const express = require("express");
const {
  addProduct,
  getAllProducts,
  deleteProduct,
  editProduct,
  getProductById,
  updateProduct,
} = require("../controllers/productController");

const router = express.Router();

router.post("/add", addProduct); //ok
router.get("/", getAllProducts);
router.delete("/:id", deleteProduct);
// router.put("/:id", editProduct);

router.get("/:id", getProductById);
router.put("/:id", updateProduct);

module.exports = router;
