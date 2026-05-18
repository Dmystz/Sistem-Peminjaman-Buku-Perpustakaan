const express = require("express");
const router = express.Router();
const db = require("../../db");

// GET semua buku
router.get("/", (req, res) => {
  db.query("SELECT * FROM books", (err, result) => {
    res.json(result);
  });
});

// Tambah buku
router.post("/", (req, res) => {
  const { title, author, stock } = req.body;
  db.query(
    "INSERT INTO books (title, author, stock) VALUES (?, ?, ?)",
    [title, author, stock],
    () => {
      res.json({ message: "Book added" });
    }
  );
});

// Pinjam buku
router.post("/borrow", (req, res) => {
  const { user_id, book_id } = req.body;
  console.log("USER:", user_id);
  console.log("BOOK:", book_id);

  db.query(
    "INSERT INTO transactions (user_id, book_id, borrow_date) VALUES (?, ?, NOW())",
    [user_id, book_id],
    () => {
      db.query("UPDATE books SET stock = stock - 1 WHERE id=?", [book_id]);
      res.json({ message: "Book borrowed" });
    }
  );
});

// Return buku
router.post("/return", (req, res) => {
  const { transaction_id, book_id } = req.body;

  db.query(
    "UPDATE transactions SET status='returned', return_date=NOW() WHERE id=?",
    [transaction_id],
    () => {
      db.query("UPDATE books SET stock = stock + 1 WHERE id=?", [book_id]);
      res.json({ message: "Book returned" });
    }
  );
});

router.post("/borrow", (req, res) => {
  const { user_id, book_id } = req.body;

  // 1. Insert ke transactions
  db.query(
    "INSERT INTO transactions (user_id, book_id, status) VALUES (?, ?, ?)",
    [user_id, book_id, "borrowed"],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.send(err);
      }

      // 2. Kurangi stock buku
      db.query(
        "UPDATE books SET stock = stock - 1 WHERE id = ?",
        [book_id],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.send(err2);
          }

          res.json({ message: "Book borrowed" });
        }
      );
    }
  );
});

module.exports = router;
