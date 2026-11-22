const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome Admin ${req.user.username}! You have granted access to this restricted route.`,
    user: req.user,
  });
});

module.exports = router;
