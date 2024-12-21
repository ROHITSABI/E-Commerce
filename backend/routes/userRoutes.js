const express = require("express");
const {
  signup,
  login,
  getProducts,
  userById,
} = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/:id", userById);
// router.get("/products", getProducts);

module.exports = router;
