const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartItems,
  getCartCount,
} = require("../controllers/cartController");

const {
  updateCartItem,
  removeCartItem,
} = require("../controllers/cartController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Add item to cart
router.post("/", verifyToken, addToCart);

router.get("/check/:userId", verifyToken, getCartItems); //Ok
router.get("/cart-count", verifyToken, getCartCount);

router.put("/update", verifyToken, updateCartItem);
router.delete("/remove/:cartItemId", verifyToken, removeCartItem);

module.exports = router;
