const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Generates JWT with user ID and Role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Generates a random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Creates user in database
    const user = await User.create({
      username,
      email,
      password,
      role: role || "user",
      otp,
      otpExpires,
    });

    console.log("\n==================================================");
    console.log(`📧 REGISTRATION FOR: ${user.email}`);
    console.log(`🔑 DEV OTP CODE IS  : [ ${otp} ]`);
    console.log("==================================================\n");

    // Sends OTP via Email (if email fails or you are offline, app won't crash)
    try {
      await sendEmail({
        email: user.email,
        subject: "Your Fintech Verification OTP",
        message: `Welcome to Fintech Dashboard! Your verification code is: ${otp}. It expires in 10 minutes.`,
      });
      console.log(`✅ Real email sent successfully to ${user.email}`);
    } catch (emailErr) {
      console.log(
        "⚠️ Email could not be sent (DNS/Offline). Use the terminal OTP printed above!",
      );
    }

    // Generates token with ID and Role
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration successful! An OTP has been sent to your email.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// VERIFYS EMAIL OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if OTP matches and hasn't expired
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Mark user verified and clear the OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.log(`🎉 User [${user.email}] verified successfully!`);

    res.status(200).json({
      success: true,
      message:
        "Email successfully verified! You can now use all dashboard features.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// LOGS IN USER
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
