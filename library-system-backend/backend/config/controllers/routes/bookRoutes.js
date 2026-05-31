const express = require("express");
const router = express.Router();
const db = require("../../db");
const multer = require("multer");
const jwt = require("jsonwebtoken");
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

// Middleware verifikasi JWT
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Token tidak tersedia" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const jwtSecret = process.env.JWT_SECRET || "supersecretkey";
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden: Token tidak valid" });
  }
};

// ─── POST pinjam buku ──────────────────────────────────────────────────────
// PENTING: semua route statis harus di atas /:id agar tidak ditangkap sebagai param
router.post("/borrow", verifyJWT, async (req, res) => {
  const { book_id, borrow_date, return_date, status } = req.body;
  const user_id = req.user.id;

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
        SELECT
          t.id,
          t.status,
          t.borrow_date,
          t.return_date,
          t.book_id,
          t.user_id,
          u.username AS nama_anggota,
          b.title AS judul_buku,
          b.author,
          b.cover_url
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN books b ON t.book_id = b.id
        WHERE t.user_id = $1
        ORDER BY t.id DESC`;
      params = [user_id];
    } else {
      query = `
        SELECT
          t.id,
          t.status,
          t.borrow_date,
          t.return_date,
          t.book_id,
          t.user_id,
          u.username AS nama_anggota,
          b.title AS judul_buku,
          b.author,
          b.cover_url
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN books b ON t.book_id = b.id
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
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const origTxResult = await client.query("SELECT * FROM transactions WHERE id = $1", [txId]);
    if (origTxResult.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    const origTx = origTxResult.rows[0];

    const result = await client.query(
      "UPDATE transactions SET status=$1 WHERE id=$2 RETURNING *",
      [status, txId]
    );
    const updatedTx = result.rows[0];

    if (status === "menunggu") {
      await client.query(
        'INSERT INTO notifications (user_id, message, "user") VALUES ($1, $2, $3)',
        [origTx.user_id, "Ada pengembalian buku yang perlu diverifikasi", "admin"]
      );
    }
    else if (status === "RETURNED" || status === "Selesai") {
      const wasReturned = origTx.status === "RETURNED" || origTx.status === "Selesai" || origTx.status === "returned";
      if (!wasReturned) {
        await client.query("UPDATE books SET stock = stock + 1 WHERE id = $1", [origTx.book_id]);
      }
      await client.query(
        'INSERT INTO notifications (user_id, message, "user") VALUES ($1, $2, $3)',
        [origTx.user_id, "Buku kamu telah berhasil dikembalikan", "user"]
      );
    }
    else if (status === "tidak_dikembalikan") {
      await client.query(
        'INSERT INTO notifications (user_id, message, "user") VALUES ($1, $2, $3)',
        [origTx.user_id, "Pengembalian bukumu ditolak karena buku tidak ditemukan", "user"]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Status transaksi diperbarui", transaction: updatedTx });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /transactions/:id error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui transaksi" });
  } finally {
    client.release();
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

// Helper untuk mengecek keterlambatan peminjaman
const checkOverdueNotifications = async () => {
  try {
    const overdueResult = await db.query(
      `SELECT DISTINCT user_id 
       FROM transactions 
       WHERE return_date < NOW() 
         AND status IN ('dipinjam', 'borrowed', 'menunggu')`
    );

    const message = "Buku kamu sudah melewati batas pengembalian, segera kembalikan!";

    for (const row of overdueResult.rows) {
      const { user_id } = row;
      const checkResult = await db.query(
        'SELECT 1 FROM notifications WHERE user_id = $1 AND message = $2',
        [user_id, message]
      );
      if (checkResult.rows.length === 0) {
        await db.query(
          'INSERT INTO notifications (user_id, message, "user") VALUES ($1, $2, $3)',
          [user_id, message, "user"]
        );
      }
    }
  } catch (err) {
    console.error("Error checking overdue notifications:", err.message);
  }
};

// ─── GET /notifications ─────────────────────────────────────────────────────
// HARUS di atas GET /:id agar tidak tertangkap sebagai param
router.get("/notifications", async (req, res) => {
  await checkOverdueNotifications();

  let user_id = null;
  let role = null;
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const jwtSecret = process.env.JWT_SECRET || "supersecretkey";
      const decoded = jwt.verify(token, jwtSecret);
      user_id = decoded?.id;
      role = decoded?.role;
    }
  } catch (e) {
    // ignore
  }

  if (!user_id) {
    user_id = req.query.user_id;
    role = req.query.role;
  }

  try {
    let query, params;
    if (role === "admin") {
      query = 'SELECT * FROM notifications WHERE "user" = \'admin\' ORDER BY id DESC';
      params = [];
    } else {
      query = 'SELECT * FROM notifications WHERE "user" = \'user\' AND user_id = $1 ORDER BY id DESC';
      params = [user_id];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /notifications error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data notifikasi" });
  }
});

// ─── PUT /notifications/:id/read ────────────────────────────────────────────
// HARUS di atas PUT /:id agar tidak tertangkap sebagai param
router.put("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "UPDATE notifications SET read_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notifikasi tidak ditemukan" });
    }
    res.json({ message: "Notifikasi ditandai telah dibaca", notification: result.rows[0] });
  } catch (err) {
    console.error("PUT /notifications/:id/read error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui status notifikasi" });
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
  const { title, author, stock, description, category } = req.body;
  const cover_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !author) {
    return res.status(400).json({ error: "Judul dan penulis wajib diisi" });
  }

  try {
    const result = await db.query(
      "INSERT INTO books (title, author, stock, cover_url, description, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, author, parseInt(stock) || 0, cover_url, description || null, category || null]
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
  const { title, author, stock, description, category } = req.body;

  try {
    let query, params;
    if (req.file) {
      const cover_url = `/uploads/${req.file.filename}`;
      query = "UPDATE books SET title=$1, author=$2, stock=$3, cover_url=$4, description=$5, category=$6 WHERE id=$7 RETURNING *";
      params = [title, author, parseInt(stock) || 0, cover_url, description || null, category || null, id];
    } else {
      query = "UPDATE books SET title=$1, author=$2, stock=$3, description=$4, category=$5 WHERE id=$6 RETURNING *";
      params = [title, author, parseInt(stock) || 0, description || null, category || null, id];
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