const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();
let users = [];

// Verify username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Verify username + password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// ----------------------------
// LOGIN (returns JWT)
// ----------------------------
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, "access", { expiresIn: "1h" });

  return res.status(200).json({
    message: "Login successful",
    token
  });
});

// ----------------------------
// JWT AUTH MIDDLEWARE
// ----------------------------
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"

  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user; // contains { username }
    next();
  });
};

// -------------------------------------------
// Add or modify a review
// -------------------------------------------
regd_users.put("/auth/review/:isbn", verifyJWT, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;

  if (!review) {
    return res.status(400).json({ message: "Review text required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated",
    reviews: books[isbn].reviews
  });
});

// -------------------------------------------
// Delete a review
// -------------------------------------------
regd_users.delete("/auth/review/:isbn", verifyJWT, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by this user" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
