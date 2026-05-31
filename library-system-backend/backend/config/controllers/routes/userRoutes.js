const express = require("express");
const router = express.Router();
const db = require("../../db");

// GET /users - Get users with their loan transactions history using a JOIN query
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.username AS nama_lengkap, u.nim,
             COUNT(t.id) AS total_pinjam,
             COUNT(CASE WHEN t.status = 'dipinjam' OR t.status = 'menunggu' THEN 1 END) AS pinjaman_aktif
      FROM users u
      JOIN transactions t ON u.id = t.user_id
      GROUP BY u.id, u.username, u.nim
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /users error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

// DELETE /users/:id - Delete user and associated records to prevent foreign key violations
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Delete user's transactions and notifications first to prevent foreign key errors
    await db.query("DELETE FROM transactions WHERE user_id = $1", [id]);
    await db.query("DELETE FROM notifications WHERE user_id = $1", [id]);
    const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /users/:id error:", err.message);
    res.status(500).json({ error: "Gagal menghapus user" });
  }
});

module.exports = router;
