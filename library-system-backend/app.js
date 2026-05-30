const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ middleware (WAJIB di atas)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());

// ✅ serve folder uploads sebagai static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ import routes
const bookRoutes = require("./backend/config/controllers/routes/bookRoutes");
const authRoutes = require("./backend/config/controllers/routes/authRoutes");

// ✅ pakai routes
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", (req, res, next) => {
  // Reuse bookRoutes for /transactions sub-paths (injected directly)
  req.url = "/transactions" + (req.url === "/" ? "" : req.url);
  bookRoutes(req, res, next);
});

const PORT = process.env.PORT || 3000;

// ✅ paling bawah
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});