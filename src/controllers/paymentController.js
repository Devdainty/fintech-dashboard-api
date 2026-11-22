const mongoose = require("mongoose");
const paystack = require("../config/paystack");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// INITIALIZES DEPOSIT
exports.initializeDeposit = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) < 100) {
      return res.status(400).json({
        success: false,
        message: "Deposit amount must be at least ₦100.",
      });
    }

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const amountInKobo = Math.round(Number(amount) * 100);

    const reference = `PAY_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    await Payment.create({
      user: user._id,
      reference,
      amount: Number(amount),
      amountInKobo,
      status: "pending",
    });

    const response = await paystack.post("/transaction/initialize", {
      email: user.email,
      amount: amountInKobo,
      reference,
      callback_url:
        process.env.PAYSTACK_CALLBACK_URL ||
        "http://localhost:5000/callback.html",
    });

    if (!response.data || !response.data.status) {
      return res.status(502).json({
        success: false,
        message: "Could not generate payment link with payment gateway.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deposit session initialized",
      authorization_url: response.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error(
      "Paystack Init Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      success: false,
      message: "Payment gateway error. Please try again later.",
    });
  }
};

// VERIFYS DEPOSIT & CREDIT WALLET (IDEMPOTENT)
exports.verifyDeposit = async (req, res) => {
  const { reference } = req.params;

  try {
    if (!reference) {
      return res
        .status(400)
        .json({ success: false, message: "Reference is required." });
    }

    const payment = await Payment.findOne({
      reference,
      user: req.user._id || req.user.id,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found." });
    }

    if (payment.status === "success") {
      const user = await User.findById(payment.user);
      return res.status(200).json({
        success: true,
        message: "Payment was already verified and credited.",
        balance: user.balance,
      });
    }

    const response = await paystack.get(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );
    const data = response.data?.data;

    if (!data || data.status !== "success") {
      payment.status = "failed";
      await payment.save();
      return res
        .status(400)
        .json({ success: false, message: "Payment was not successful." });
    }

    if (data.amount !== payment.amountInKobo || data.currency !== "NGN") {
      payment.status = "failed";
      await payment.save();
      return res
        .status(400)
        .json({
          success: false,
          message: "Payment verification failed: Amount or currency mismatch.",
        });
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: "pending" },
      {
        $set: {
          status: "success",
          paidAt: new Date(data.paid_at || Date.now()),
        },
      },
      { new: true },
    );

    if (!updatedPayment) {
      const user = await User.findById(payment.user);
      return res.status(200).json({
        success: true,
        message: "Payment already processed.",
        balance: user.balance,
      });
    }

    const user = await User.findById(payment.user);
    user.balance += payment.amount;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: "credit",
      amount: payment.amount,
      balanceAfter: user.balance,
      description: `Paystack Deposit (Ref: ${payment.reference})`,
    });

    return res.status(200).json({
      success: true,
      message: `Deposit of ₦${payment.amount.toLocaleString()} verified successfully!`,
      balance: user.balance,
    });
  } catch (error) {
    console.error(
      "Paystack Verify Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      success: false,
      message: "Failed to verify transaction with payment provider.",
    });
  }
};
