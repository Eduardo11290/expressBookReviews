const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// ----------------------
// Task 6 – User Registration
// ----------------------
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});


// ----------------------
// Task 1 – Get all books
// ----------------------
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});


// ----------------------
// Task 2 – Get book by ISBN
// ----------------------
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }

  return res.status(404).json({ message: "Book not found" });
});


// ----------------------
// Task 3 – Get books by author
// ----------------------
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = [];

  Object.keys(books).forEach(id => {
    if (books[id].author === author) {
      result.push(books[id]);
    }
  });

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ message: "No books found for this author" });
});


// ----------------------
// Task 4 – Get books by title
// ----------------------
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const result = [];

  Object.keys(books).forEach(id => {
    if (books[id].title === title) {
      result.push(books[id]);
    }
  });

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ message: "No books found with this title" });
});


// ----------------------
// Task 5 – Get reviews by ISBN
// ----------------------
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: "No reviews found for this ISBN" });
});


module.exports.general = public_users;
