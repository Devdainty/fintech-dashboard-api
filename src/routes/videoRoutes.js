const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { protect } = require("../middleware/authMiddleware");
const videoUpload = require("../middleware/videoUpload");
const { uploadVerificationVideo } = require("../controllers/videoController");

const videoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message:
      "Too many verification attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/verification-video",
  protect,
  videoLimiter,
  videoUpload.single("video"),
  uploadVerificationVideo,
);

module.exports = router;
