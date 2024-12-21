const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const signup = (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(query, [name, email, hashedPassword], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: "User registered successfully!" });
    }
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results.length)
      return res.status(404).json({ message: "User not found!" });

    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_Secret,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ message: "Login successful!", token });
  });
};

//Fetch a user by ID
const userById = (req, res) => {
  const { id } = req.query;
  console.log(id);
  const sql = "SELECT * FROM users WHERE id = ?;";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Invalid Query", err);
      return res.status(401).json({ error: "Invalid Query" });
    } else {
      // console.log("Fetch the user");
      res.status(201).json(results[0]);
    }
  });
};

const getProducts = (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

module.exports = { signup, login, getProducts, userById };
