const express = require("express");
const router = express.Router();
const db = require("../../db");

// POST /auth/login — login user (admin or mahasiswa)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  try {
    const result = await db.query(
      "SELECT id, name, username, password, role, nim FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const user = result.rows[0];

    // For mahasiswa, password must match their NIM
    // For admin, password matches the stored password directly
    if (user.password !== password) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login berhasil",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan saat login" });
  }
});

module.exports = router;
