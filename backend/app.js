const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const userById = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoute");
const orderRoutes = require("./routes/orderRoute");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const cartCount = require("./routes/cartRoute");

require("dotenv").config();

const path = require("path");
const multer = require("multer");

const db = require("./config/db");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(bodyParser.json());
app.use("/admin", adminRoutes); //OK
app.use("/api/admin", adminOrderRoutes);

app.use("/products", productRoutes); //Ok
app.use("/cart", cartRoutes); //Ok
app.use("/api/cart", cartCount);

app.use("", orderRoutes); //Ok
app.use("/api/orders", orderRoutes); //ok

app.use("/api/users", userRoutes); //OK
// app.use("/api", userById);

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("E-commerce Backend Running");
});

const PORT = process.env.port1 || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
