const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ middleware (WAJIB di atas)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());

// ✅ import routes (TARUH DI SINI)
const bookRoutes = require("./backend/config/controllers/routes/bookRoutes");

// ✅ pakai routes (TARUH DI SINI)
app.use("/api/books", bookRoutes);

// optional test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 3000;

// ✅ paling bawah
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});