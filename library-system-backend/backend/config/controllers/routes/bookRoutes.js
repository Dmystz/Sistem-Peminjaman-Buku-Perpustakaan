const express = require("express");
const router = express.Router();
const db = require("../../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Konfigurasi Multer ────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "../../../../public/uploads");

// Pastikan folder uploads ada
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "cover-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Hanya file gambar (JPG/PNG/GIF/WEBP) yang diizinkan!"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // maks 2MB
});

// ─── GET semua buku ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /books error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data buku" });
  }
});

// ─── GET buku by ID ────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Buku tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /books/:id error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data buku" });
  }
});

// ─── POST tambah buku (dengan cover opsional) ──────────────────────────────
router.post("/", upload.single("cover"), async (req, res) => {
  const { title, author, stock } = req.body;
  const cover_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !author) {
    return res.status(400).json({ error: "Judul dan penulis wajib diisi" });
  }

  try {
    const result = await db.query(
      "INSERT INTO books (title, author, stock, cover_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, author, parseInt(stock) || 0, cover_url]
    );
    res.status(201).json({ message: "Buku berhasil ditambahkan", book: result.rows[0] });
  } catch (err) {
    console.error("POST /books error:", err.message);
    res.status(500).json({ error: "Gagal menambahkan buku" });
  }
});

// ─── PUT update buku (dengan cover opsional) ───────────────────────────────
router.put("/:id", upload.single("cover"), async (req, res) => {
  const { id } = req.params;
  const { title, author, stock } = req.body;

  try {
    let query, params;
    if (req.file) {
      const cover_url = `/uploads/${req.file.filename}`;
      query = "UPDATE books SET title=$1, author=$2, stock=$3, cover_url=$4 WHERE id=$5 RETURNING *";
      params = [title, author, parseInt(stock) || 0, cover_url, id];
    } else {
      query = "UPDATE books SET title=$1, author=$2, stock=$3 WHERE id=$4 RETURNING *";
      params = [title, author, parseInt(stock) || 0, id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: "Buku tidak ditemukan" });
    res.json({ message: "Buku berhasil diupdate", book: result.rows[0] });
  } catch (err) {
    console.error("PUT /books/:id error:", err.message);
    res.status(500).json({ error: "Gagal mengupdate buku" });
  }
});

// ─── DELETE hapus buku ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM books WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Buku tidak ditemukan" });
    res.json({ message: "Buku berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /books/:id error:", err.message);
    res.status(500).json({ error: "Gagal menghapus buku" });
  }
});

// ─── POST pinjam buku ──────────────────────────────────────────────────────
router.post("/borrow", async (req, res) => {
  const { user_id, book_id } = req.body;
  console.log("BORROW — user:", user_id, "book:", book_id);
  try {
    await db.query(
      "INSERT INTO transactions (user_id, book_id, borrow_date, status) VALUES ($1, $2, NOW(), 'borrowed')",
      [user_id, book_id]
    );
    await db.query("UPDATE books SET stock = stock - 1 WHERE id = $1", [book_id]);
    res.json({ message: "Buku berhasil dipinjam" });
  } catch (err) {
    console.error("POST /borrow error:", err.message);
    res.status(500).json({ error: "Gagal meminjam buku" });
  }
});

// ─── POST kembalikan buku ──────────────────────────────────────────────────
router.post("/return", async (req, res) => {
  const { transaction_id, book_id } = req.body;
  try {
    await db.query(
      "UPDATE transactions SET status='returned', return_date=NOW() WHERE id=$1",
      [transaction_id]
    );
    await db.query("UPDATE books SET stock = stock + 1 WHERE id=$1", [book_id]);
    res.json({ message: "Buku berhasil dikembalikan" });
  } catch (err) {
    console.error("POST /return error:", err.message);
    res.status(500).json({ error: "Gagal mengembalikan buku" });
  }
});

module.exports = router;