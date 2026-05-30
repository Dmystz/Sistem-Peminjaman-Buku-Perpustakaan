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

// ─── POST generate-synopsis ────────────────────────────────────────────────
router.post("/generate-synopsis", async (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: "Title dan author wajib diisi" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY tidak ditemukan di backend environment variables, menggunakan fallback generator");
    const fallbackSynopsis = `${title} adalah sebuah karya tulis menarik oleh ${author} yang membahas petualangan, perjuangan, dan pelajaran hidup yang sangat berharga. Buku ini memberikan inspirasi dan wawasan baru bagi setiap pembacanya.`;
    return res.json({ synopsis: fallbackSynopsis });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Tuliskan sinopsis singkat dan menarik untuk buku berjudul "${title}" yang ditulis oleh "${author}" dalam bahasa Indonesia. Tulislah dalam 1 paragraf pendek (3-4 kalimat). Langsung berikan sinopsisnya saja tanpa kalimat pengantar.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API Error:", errText);
      throw new Error(`Claude API returned status ${response.status}`);
    }

    const data = await response.json();
    const synopsis = data.content[0].text.trim();
    res.json({ synopsis });
  } catch (err) {
    console.error("Gagal generate sinopsis dengan Claude:", err.message);
    const fallbackSynopsis = `${title} adalah sebuah karya tulis menarik oleh ${author} yang membahas petualangan, perjuangan, dan pelajaran hidup yang sangat berharga. Buku ini memberikan inspirasi dan wawasan baru bagi setiap pembacanya.`;
    res.json({ synopsis: fallbackSynopsis });
  }
});

// ─── POST pinjam buku ──────────────────────────────────────────────────────
// PENTING: semua route statis harus di atas /:id agar tidak ditangkap sebagai param
router.post("/borrow", async (req, res) => {
  const { user_id, book_id, borrow_date, return_date, status } = req.body;
  console.log("BORROW — user:", user_id, "book:", book_id);
  if (!user_id || !book_id) {
    return res.status(400).json({ error: "user_id dan book_id wajib diisi" });
  }
  try {
    // Cek stok buku terlebih dahulu
    const bookCheck = await db.query("SELECT stock FROM books WHERE id = $1", [book_id]);
    if (bookCheck.rows.length === 0) return res.status(404).json({ error: "Buku tidak ditemukan" });
    if (bookCheck.rows[0].stock <= 0) return res.status(409).json({ error: "Stok buku habis" });

    const borrowAt = borrow_date ? new Date(borrow_date) : new Date();
    const returnAt = return_date ? new Date(return_date) : null;
    const txStatus = status || "dipinjam";

    const result = await db.query(
      "INSERT INTO transactions (user_id, book_id, borrow_date, return_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, book_id, borrowAt, returnAt, txStatus]
    );
    await db.query("UPDATE books SET stock = stock - 1 WHERE id = $1", [book_id]);
    res.status(201).json({ message: "Buku berhasil dipinjam", transaction: result.rows[0] });
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

// ─── GET semua transaksi (opsional filter ?user_id=X) ─────────────────────
// HARUS di atas GET /:id agar "/transactions" tidak ditangkap sebagai id param
router.get("/transactions", async (req, res) => {
  const { user_id } = req.query;
  try {
    let query, params;
    if (user_id) {
      query = `
        SELECT t.*, b.title, b.author, b.cover_url
        FROM transactions t
        LEFT JOIN books b ON b.id = t.book_id
        WHERE t.user_id = $1
        ORDER BY t.id DESC`;
      params = [user_id];
    } else {
      query = `
        SELECT t.*, b.title, b.author, b.cover_url
        FROM transactions t
        LEFT JOIN books b ON b.id = t.book_id
        ORDER BY t.id DESC`;
      params = [];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /transactions error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data transaksi" });
  }
});

// ─── PUT update status transaksi ──────────────────────────────────────────
// HARUS di atas PUT /:id agar "/transactions/:id" tidak bentrok
router.put("/transactions/:txId", async (req, res) => {
  const { txId } = req.params;
  const { status } = req.body;
  try {
    const result = await db.query(
      "UPDATE transactions SET status=$1 WHERE id=$2 RETURNING *",
      [status, txId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    res.json({ message: "Status transaksi diperbarui", transaction: result.rows[0] });
  } catch (err) {
    console.error("PUT /transactions/:id error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui transaksi" });
  }
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
// PENTING: selalu letakkan di bawah semua route statis
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

module.exports = router;