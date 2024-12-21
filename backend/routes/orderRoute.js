const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  totalOrder,
} = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Place an order
router.post("/checkout", verifyToken, placeOrder);
router.get("/my-orders", verifyToken, getUserOrders);
// router.get("/total/:userId", verifyToken, totalOrder);

module.exports = router;
