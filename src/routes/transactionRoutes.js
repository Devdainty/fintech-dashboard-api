const express = require("express");
const router = express.Router();

//Imports the controller and protect middleware
const { makeTransaction } = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, makeTransaction);

module.exports = router;
