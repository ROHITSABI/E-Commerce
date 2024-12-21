const db = require("../config/db");

exports.placeOrder = async (req, res) => {
  const {
    address,
    city,
    postal_code,
    country,
    phone_number,
    payment_method,
    card_details,
  } = req.body;
  const userId = req.user.id; // From the authenticated user middleware
  // console.log(req.user);

  if (!address || !city || !postal_code || !country || !phone_number) {
    return res
      .status(400)
      .json({ message: "All fields are required for shipping details." });
  }

  // Simulate payment validation
  if (payment_method === "card") {
    if (!card_details.number || !card_details.expiry || !card_details.cvc) {
      return res.status(400).json({ message: "Card details are incomplete." });
    }

    // Simulate payment success
    const paymentSuccess = true; // You can change this to false for testing failed payments
    if (!paymentSuccess) {
      return res
        .status(400)
        .json({ message: "Payment failed. Please try again." });
    }
  } else if (payment_method === "paypal") {
    // Simulate PayPal payment (for simplicity, assume it always succeeds)
    const paypalPaymentSuccess = true; // Simulating success
    if (!paypalPaymentSuccess) {
      return res
        .status(400)
        .json({ message: "PayPal payment failed. Please try again." });
    }
  }

  // Start transaction
  db.beginTransaction(async (transactionErr) => {
    if (transactionErr)
      return res
        .status(500)
        .json({ message: "Transaction error", error: transactionErr });

    try {
      // Get cart items
      const cartQuery =
        "SELECT * FROM cart INNER JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?";
      db.query(cartQuery, [userId], (err, cartItems) => {
        if (err || cartItems.length === 0) {
          db.rollback();
          return res
            .status(400)
            .json({ message: "Cart is empty or error occurred", error: err });
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        // Insert order
        const orderQuery =
          "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)";
        db.query(orderQuery, [userId, totalAmount], (orderErr, orderResult) => {
          if (orderErr) {
            db.rollback();
            return res
              .status(500)
              .json({ message: "Error placing order", error: orderErr });
          }

          const orderId = orderResult.insertId;

          // Insert order items
          const orderItemsQuery =
            "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?";
          const orderItemsData = cartItems.map((item) => [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
          ]);

          db.query(orderItemsQuery, [orderItemsData], (orderItemsErr) => {
            if (orderItemsErr) {
              db.rollback();
              return res.status(500).json({
                message: "Error adding order items",
                error: orderItemsErr,
              });
            }

            // Add shipping details
            const shippingQuery =
              "INSERT INTO shipping_details (order_id, address, city, postal_code, country, phone_number) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(
              shippingQuery,
              [orderId, address, city, postal_code, country, phone_number],
              (shippingErr) => {
                if (shippingErr) {
                  db.rollback();
                  return res.status(500).json({
                    message: "Error adding shipping details",
                    error: shippingErr,
                  });
                }

                const clearCartQuery = "DELETE FROM cart WHERE user_id = ?";
                db.query(clearCartQuery, [userId], (clearCartErr) => {
                  if (clearCartErr) {
                    db.rollback();
                    return res.status(500).json({
                      message: "Error clearing cart",
                      error: clearCartErr,
                    });
                  }
                });

                // Commit transaction
                db.commit((commitErr) => {
                  if (commitErr) {
                    db.rollback();
                    return res.status(500).json({
                      message: "Error committing transaction",
                      error: commitErr,
                    });
                  }

                  return res.status(200).json({
                    message: "Order placed successfully, payment simulated.",
                  });
                });
              }
            );
          });
        });
      });
    } catch (error) {
      db.rollback();
      return res.status(500).json({ message: "Error placing order", error });
    }
  });
};

// exports.placeOrder = async (req, res) => {
//   const { address, city, postal_code, country, phone_number } = req.body;
//   const userId = req.user.id;

//   if (!address || !city || !postal_code || !country || !phone_number) {
//     return res
//       .status(400)
//       .json({ message: "All fields are required for shipping details." });
//   }

//   db.beginTransaction(async (transactionErr) => {
//     if (transactionErr)
//       return res
//         .status(500)
//         .json({ message: "Transaction error", error: transactionErr });

//     try {
//       /
//       const cartQuery =
//         "SELECT * FROM cart INNER JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?";
//       db.query(cartQuery, [userId], (err, cartItems) => {
//         if (err || cartItems.length === 0) {
//           db.rollback();
//           return res
//             .status(400)
//             .json({ message: "Cart is empty or error occurred", error: err });
//         }

//         const totalAmount = cartItems.reduce(
//           (total, item) => total + item.price * item.quantity,
//           0
//         );

//         const orderQuery =
//           "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)";
//         db.query(orderQuery, [userId, totalAmount], (orderErr, orderResult) => {
//           if (orderErr) {
//             db.rollback();
//             return res
//               .status(500)
//               .json({ message: "Error placing order", error: orderErr });
//           }

//           const orderId = orderResult.insertId;

//           const orderItemsQuery =
//             "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?";
//           const orderItemsData = cartItems.map((item) => [
//             orderId,
//             item.product_id,
//             item.quantity,
//             item.price,
//           ]);

//           db.query(orderItemsQuery, [orderItemsData], (orderItemsErr) => {
//             if (orderItemsErr) {
//               db.rollback();
//               return res.status(500).json({
//                 message: "Error adding order items",
//                 error: orderItemsErr,
//               });
//             }

//             const shippingQuery =
//               "INSERT INTO shipping_details (order_id, address, city, postal_code, country, phone_number) VALUES (?, ?, ?, ?, ?, ?)";
//             db.query(
//               shippingQuery,
//               [orderId, address, city, postal_code, country, phone_number],
//               (shippingErr) => {
//                 if (shippingErr) {
//                   db.rollback();
//                   return res.status(500).json({
//                     message: "Error adding shipping details",
//                     error: shippingErr,
//                   });
//                 }

//                 const clearCartQuery = "DELETE FROM cart WHERE user_id = ?";
//                 db.query(clearCartQuery, [userId], (clearCartErr) => {
//                   if (clearCartErr) {
//                     db.rollback();
//                     return res.status(500).json({
//                       message: "Error clearing cart",
//                       error: clearCartErr,
//                     });
//                   }

//                   db.commit((commitErr) => {
//                     if (commitErr) {
//                       return res.status(500).json({
//                         message: "Error committing transaction",
//                         error: commitErr,
//                       });
//                     }

//                     res
//                       .status(200)
//                       .json({ message: "Order placed successfully." });
//                   });
//                 });
//               }
//             );
//           });
//         });
//       });
//     } catch (err) {
//       db.rollback();
//       return res
//         .status(500)
//         .json({ message: "Server error during order placement.", error: err });
//     }
//   });
// };

// Get user's orders

exports.getUserOrders = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  try {
    // Use `.promise()` here to make the query return a Promise
    const sqlquery = `SELECT orders.id AS order_id, orders.total_amount, orders.order_date,
              shipping_details.address, shipping_details.city, shipping_details.country 
       FROM orders 
       JOIN shipping_details ON orders.id = shipping_details.order_id 
       WHERE orders.user_id = ?`;
    const [orders] = await db.promise().query(sqlquery, [userId]);

    const [orderItems] = await db.promise().query(
      `SELECT order_items.order_id, products.name AS product_name, 
              order_items.quantity, order_items.price_at_purchase 
       FROM order_items 
       JOIN products ON order_items.product_id = products.id`
    );

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: orderItems.filter((item) => item.order_id === order.order_id),
    }));

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

// exports.totalOrder = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log(userId);
//     const sql =
//       "SELECT SUM(total_amount) AS total FROM orders WHERE user_id = ?";
//     db.query(sql, [userId], (err, result) => {
//       if (err) {
//         console.error("Internal Server Error", err);
//         return res.status(500).json({ message: "Internal Server Error" });
//       }

//       const total = result[0]?.total || 0;
//       console.log("Total amount fetched:", total);
//       return res.status(200).json({ total });
//     });
//   } catch (error) {
//     console.error("Error fetching total order amount:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
