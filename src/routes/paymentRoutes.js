const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  initializeDeposit,
  verifyDeposit,
} = require("../controllers/paymentController");

router.post("/initialize", protect, initializeDeposit);
router.get("/verify/:reference", protect, verifyDeposit);

module.exports = router;
