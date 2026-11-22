const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { uploadProfileImage } = require("../controllers/profileController");

router.post(
  "/upload-profile",
  protect,
  upload.single("profile"),
  uploadProfileImage,
);

module.exports = router;
