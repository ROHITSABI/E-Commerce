const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?);";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error creating admin");
        return res
          .status(500)
          .json({ message: "Error creating admin", error: err });
      } else {
        return res
          .status(201)
          .json({ message: "Admin Registered Successfully" });
      }
    });
  } catch (error) {
    console.error("Error during admin signup");
    return res.status(500).json({ message: "Server Error", error });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?;";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server Error", error: err });
    }

    if (!results.length) {
      console.error("Admin not found");
      return res.status(401).json({ message: "Admin not found" });
    }

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      console.error("Invalid Credentials");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(201).json({ message: "Login Successful", token });
  });
};
