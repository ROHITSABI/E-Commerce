const db = require("../config/db");

exports.getAllOrders = async (req, res) => {
  try {
    // Fetch orders
    const [orders] = await db.promise().query(
      `SELECT orders.id AS order_id, users.name AS user_name, users.email AS user_email,
           orders.total_amount, orders.order_date
           FROM orders
           JOIN users ON orders.user_id = users.id
           ORDER BY orders.order_date DESC`
    );

    // Fetch order items
    const [orderItems] = await db.promise().query(
      `SELECT order_items.order_id, products.name AS product_name,
           order_items.quantity, order_items.price_at_purchase
           FROM order_items
           JOIN products ON order_items.product_id = products.id`
    );

    // Combine orders with their respective items
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: orderItems.filter((item) => item.order_id === order.order_id),
    }));

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

// const db = require("../config/db");

// exports.getAllOrders = (req, res) => {
//   try {
//     console.log("Fetching Orders...");
//     const [orders] = db.query(
//       `SELECT orders.id AS order_id, users.name AS user_name, users.email AS user_email,
//                     orders.total_amount, orders.order_date
//              FROM orders
//              JOIN users ON orders.user_id = users.id
//              ORDER BY orders.order_date DESC`
//     );
//     console.log("Orders fetched:", orders);

//     const [orderItems] = db.query(
//       `SELECT order_items.order_id, products.name AS product_name,
//                     order_items.quantity, order_items.price_at_purchase
//              FROM order_items
//              JOIN products ON order_items.product_id = products.id`
//     );
//     console.log("Order items fetched:", orderItems);

//     const ordersWithItems = orders.map((order) => ({
//       ...order,
//       items: orderItems.filter((item) => item.order_id === order.order_id),
//     }));

//     res.status(200).json(ordersWithItems);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ message: "Server error while fetching orders" });
//   }
// };
