const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("imageUrl");

// Add a product

exports.addProduct = (req, res) => {
  // Using multer to handle the file upload
  upload(req, res, (err) => {
    if (err) {
      console.error("Failed to upload image:", err);
      return res.status(500).json({ message: "Failed to upload image" });
    }

    const { name, description, price } = req.body;
    const imageUrl = req.file ? req.file.filename : null;

    const query =
      "INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)";
    db.query(query, [name, description, price, imageUrl], (err, result) => {
      if (err) {
        console.error("Error adding product:", err);
        return res
          .status(400)
          .json({ message: "Error adding product", error: err });
      } else {
        console.log("Product added successfully");
        return res.status(201).json({ message: "Product added successfully" });
      }
    });
  });
};

// Get all products
exports.getAllProducts = (req, res) => {
  const query = "SELECT * FROM products ORDER BY created_at ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products", err);
      return res
        .status(500)
        .json({ message: "Error fetching products", error: err });
    } else {
      // console.log(results);
      return res.status(200).json(results);
    }
  });
};
//Ok

// Delete a product
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM products WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error deleting product", error: err });
    res.status(200).json({ message: "Product deleted successfully" });
  });
};
//Ok

// Edit a product
// exports.updateProduct = (req, res) => {
//   const { id } = req.params;

//   upload(req, res, (err) => {
//     if (err) {
//       console.error("Failed to upload image:", err);
//       return res.status(500).json({ message: "Failed to upload image" });
//     }

//     const { name, description, price } = req.body;
//     const imageUrl = req.file ? req.file.filename : null;

//     const query = imageUrl
//       ? "UPDATE products SET name=?, description=?, price=?, image_url=? WHERE id=?"
//       : "UPDATE products SET name=?, description=?, price=? WHERE id=?";

//     const params = imageUrl
//       ? [name, description, price, imageUrl, id]
//       : [name, description, price, id];

//     db.query(query, params, (err, result) => {
//       if (err) {
//         console.error("Error updating the product", err);
//         return res
//           .status(500)
//           .json({ message: "Error updating the product", error: err });
//       } else {
//         res.status(200).json({ message: "Product Updated Successfully" });
//       }
//     });
//   });
// };

exports.updateProduct = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Failed to upload image:", err);
      return res.status(500).json({ message: "Failed to upload image" });
    }

    const { name, description, price } = req.body;
    const productId = req.params.id;
    const imageUrl = req.file ? req.file.filename : null;

    // Update query
    let query = "UPDATE products SET name = ?, description = ?, price = ?";
    const params = [name, description, price];

    if (imageUrl) {
      query += ", image_url = ?";
      params.push(imageUrl);
    }

    query += " WHERE id = ?";
    params.push(productId);

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res
          .status(500)
          .json({ message: "Error updating product", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      console.log("Product updated successfully");
      return res.status(200).json({ message: "Product updated successfully" });
    });
  });
};

// =======
// Fetch a product by ID
exports.getProductById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM products WHERE id = ?;";
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to fetch product", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(results[0]);
  });
};

// Update a product
// exports.updateProduct = (req, res) => {
//   const { id } = req.params;
//   const { name, description, price } = req.body;

//   // Handle file upload if there's an image
//   const imageUrl = req.file ? req.file.filename : req.body.imageUrl;

//   const sql = `
//     UPDATE products
//     SET name = ?, description = ?, price = ?, image_url = ?
//     WHERE id = ?;
//   `;

//   db.query(sql, [name, description, price, imageUrl, id], (err, results) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ message: "Failed to update product", error: err });
//     }

//     res.status(200).json({ message: "Product updated successfully" });
//   });
// };
