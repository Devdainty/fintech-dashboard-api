const User = require("../models/User");
const Transaction = require("../models/Transaction");
const logger = require("../config/logger");
const { trackEvent } = require("../services/analyticsService");

// GETS DASHBOARD DATA
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      logger.warn(
        { userId: req.user._id },
        "Dashboard access failed: User account not found",
      );
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const transactions = await Transaction.find({ user: req.user._id }).sort({
      timestamp: -1,
      createdAt: -1,
    });

    await trackEvent("DASHBOARD_ACCESSED", req.user._id);

    logger.info(
      {
        userId: req.user._id,
        transactionCount: transactions.length,
        balance: user.balance,
      },
      "Dashboard data accessed successfully",
    );

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      balance: user.balance,
      profileImage: user.profileImage || "",
      verificationStatus: user.verificationVideo?.status || "not_submitted",
      transactionCount: transactions.length,
      transactions,
    });
  } catch (error) {
    logger.error(
      { err: error.message, userId: req.user?._id },
      "Error loading dashboard data",
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
};

// GETS ALL TRANSACTIONS
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      timestamp: -1,
      createdAt: -1,
    });

    logger.info(
      { userId: req.user._id, count: transactions.length },
      "Transaction history retrieved successfully",
    );

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    logger.error(
      { err: error.message, userId: req.user?._id },
      "Error retrieving transactions",
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
      error: error.message,
    });
  }
};
