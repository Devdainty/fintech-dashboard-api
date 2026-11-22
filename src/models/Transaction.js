const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required for a transaction"],
  },

  type: {
    type: String,
    enum: {
      values: ["credit", "debit"],
      message:
        "{VALUE} is not a valid transaction type. Must be credit or debit",
    },
    required: [true, "Please specify transaction type (credit or debit)"],
  },
  amount: {
    type: Number,
    required: [true, "Please provide a transaction amount"],
    min: [0, "Amount must be greater than or equal to 0"],
  },
  balanceAfter: {
    type: Number,
    required: [true, "Balance after transaction is required"],
  },

  description: {
    type: String,
    trim: true,
    default: "",
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
