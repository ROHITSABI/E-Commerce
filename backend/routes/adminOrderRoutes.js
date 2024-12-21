const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const adminOrderController = require("../controllers/adminOrderController");

// Admin: View all orders
router.get("/orders", verifyToken, adminOrderController.getAllOrders);

module.exports = router;
