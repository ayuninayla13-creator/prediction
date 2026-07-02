// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
    [username, hashed, email],
    function (err) {
      if (err) return res.status(400).json({ error: "Username already exists" });
      res.json({ success: true, userId: this.lastID });
    }
  );
});

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ success: true, username: user.username });
  });
});

module.exports = router;
