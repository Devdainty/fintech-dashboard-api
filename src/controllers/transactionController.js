const User = require("../models/User");
const Transaction = require("../models/Transaction");
const logger = require("../config/logger");
const { trackEvent } = require("../services/analyticsService");

exports.makeTransaction = async (req, res) => {
  try {
    const { type, amount } = req.body;

    // Validation: Missing fields
    if (!type || !amount) {
      logger.warn(
        { userId: req.user._id, body: req.body },
        "Transaction rejected: Missing type or amount",
      );
      return res.status(400).json({
        success: false,
        message: "Please provide both type (credit/debit) and amount",
      });
    }

    // Validation: Invalid type
    if (type !== "credit" && type !== "debit") {
      logger.warn(
        { userId: req.user._id, type },
        "Transaction rejected: Invalid transaction type",
      );
      return res.status(400).json({
        success: false,
        message: "Type must be either credit or debit",
      });
    }

    // Validation: Non-positive amount
    if (amount <= 0) {
      logger.warn(
        { userId: req.user._id, amount },
        "Transaction rejected: Amount must be greater than zero",
      );
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Find the user to get their current balance
    const user = await User.findById(req.user._id);
    if (!user) {
      logger.warn(
        { userId: req.user._id },
        "Transaction rejected: User account not found",
      );
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let newBalance = user.balance;

    // Overdraft check for debit transactions
    if (type === "debit") {
      if (user.balance < amount) {
        logger.warn(
          {
            userId: user._id,
            currentBalance: user.balance,
            attemptedDebit: amount,
          },
          "Transaction rejected: Insufficient funds",
        );

        return res.status(400).json({
          success: false,
          message: `Insufficient balance! Your current balance is ${user.balance}, but you tried to spend ${amount}.`,
        });
      }
      newBalance = user.balance - amount;
    } else if (type === "credit") {
      newBalance = user.balance + amount;
    }

    // Update user balance
    user.balance = newBalance;
    await user.save();

    // Create persistent transaction record
    const transaction = await Transaction.create({
      user: user._id,
      type,
      amount,
      balanceAfter: newBalance,
    });

    // Structured Pino log for audit trail
    logger.info(
      {
        userId: user._id,
        transactionId: transaction._id,
        type,
        amount,
        balanceAfter: newBalance,
      },
      "Financial transaction processed successfully",
    );

    // Records analytics event
    await trackEvent("TRANSACTION_CREATED", user._id);

    res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} transaction successful!`,
      currentBalance: user.balance,
      transaction,
    });
  } catch (error) {
    logger.error(
      { err: error.message, userId: req.user?._id },
      "Error processing financial transaction",
    );

    res.status(500).json({ success: false, error: error.message });
  }
};
