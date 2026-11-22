const express = require("express");
const router = express.Router();

const {
  getDashboard,
  getTransactions,
} = require("../controllers/dashboardController");
const { makeTransaction } = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, getDashboard);
router.get("/transactions", protect, getTransactions);
router.post("/transactions", protect, makeTransaction);

module.exports = router;
