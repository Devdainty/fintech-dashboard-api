const User = require("../models/User");
const Transaction = require("../models/Transaction");

// GETS DASHBOARD DATA
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const transactions = await Transaction.find({ user: req.user._id }).sort({
      timestamp: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      balance: user.balance,
      profileImage: user.profileImage || "",
      // Verification status for the dashboard badge (keeping private video URLs hidden)
      verificationStatus: user.verificationVideo?.status || "not_submitted",
      transactionCount: transactions.length,
      transactions,
    });
  } catch (error) {
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

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
      error: error.message,
    });
  }
};
