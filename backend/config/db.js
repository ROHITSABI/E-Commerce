const mysql = require("mysql2");
require("dotenv").config();

// Create MySQL database connection
const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  port: process.env.port,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    throw err;
  }
  console.log("Connected to MySQL database");
});

module.exports = db;
