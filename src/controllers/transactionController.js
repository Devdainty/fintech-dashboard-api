const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.makeTransaction = async (req, res) => {
  try {
    const { type, amount } = req.body;
    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        message: "Please provide both type (credit/debit) and amount",
      });
    }

    if (type !== "credit" && type !== "debit") {
      return res.status(400).json({
        success: false,
        message: "Type must be either credit or debit",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let newBalance = user.balance;

    if (type === "debit") {
      if (user.balance < amount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance! Your current balance is ${user.balance}, but you tried to spend ${amount}.`,
        });
      }
      newBalance = user.balance - amount;
    } else if (type === "credit") {
      newBalance = user.balance + amount;
    }

    user.balance = newBalance;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type,
      amount,
      balanceAfter: newBalance,
    });

    res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} transaction successful!`,
      currentBalance: user.balance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
