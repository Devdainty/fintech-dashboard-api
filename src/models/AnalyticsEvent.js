const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      "USER_REGISTERED",
      "USER_LOGIN",
      "OTP_VERIFIED",
      "DASHBOARD_ACCESSED",
      "TRANSACTION_CREATED",
    ],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
