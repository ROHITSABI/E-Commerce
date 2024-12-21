const db = require("../config/db");

// Add product to cart
exports.addToCart = (req, res) => {
  const { userId, productId, quantity } = req.body;
  // console.log("User ID:", userId);
  // console.log("Product ID:", productId);
  // console.log("Quantity:", quantity);

  // Check if the product is already in the cart for the user
  const checkQuery = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
  db.query(checkQuery, [userId, productId], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error checking cart", error: err });

    if (results.length > 0) {
      // If product exists, update the quantity
      const updateQuery =
        "UPDATE cart SET quantity = quantity + ? WHERE id = ?";
      db.query(updateQuery, [quantity, results[0].id], (updateErr) => {
        if (updateErr) {
          return res
            .status(500)
            .json({ message: "Error updating cart", error: updateErr });
        } else {
          res.status(200).json({ message: "Product quantity updated in cart" });
        }
      });
    } else {
      // If product does not exist, insert a new row

      const insertQuery =
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
      db.query(insertQuery, [userId, productId, quantity], (insertErr) => {
        if (insertErr) {
          return res
            .status(500)
            .json({ message: "Error adding to cart", error: insertErr });
        } else {
          res.status(200).json({ message: "Product added to cart" });
        }
      });
    }
  });
};
//Ok

// Get cart items for a specific user
exports.getCartItems = (req, res) => {
  //console.log("User:", req.user); // Debug log
  // console.log(req);
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  const userId = req.user.id;
  // console.log(userId);

  const query = `
        SELECT 
            cart.id AS cart_id, 
            products.id AS product_id, 
            products.name, 
            products.price, 
            cart.quantity 
        FROM cart 
        JOIN products ON cart.product_id = products.id 
        WHERE cart.user_id = ?
    `;

  db.query(query, [userId], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error fetching cart items", error: err });

    res.status(200).json(results);
  });
};
//OK

// Update cart item quantity
exports.updateCartItem = (req, res) => {
  const { cartItemId, quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }

  const query = "UPDATE cart SET quantity = ? WHERE id = ?";

  db.query(query, [quantity, cartItemId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error updating cart item", error: err });
    }

    res.status(200).json({ message: "Cart item updated successfully." });
  });
};

// Remove an item from the cart
exports.removeCartItem = (req, res) => {
  const { cartItemId } = req.params;
  // console.log("Removing cart item with ID:", cartItemId);

  const query = "DELETE FROM cart WHERE id = ?";

  db.query(query, [cartItemId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error removing cart item", error: err });
    }

    res.status(200).json({ message: "Cart item removed successfully." });
  });
};
//ok

exports.getCartCount = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db
      .promise()
      .query("SELECT COUNT(*) AS count FROM cart WHERE user_id = ?", [userId]);

    const cartCount = rows[0].count || 0;
    res.json({ count: cartCount });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    res.status(500).json({ message: "Error fetching cart count" });
  }
};
