const express = require("express");
const cors = require("cors");

const app = express();

// ✅ middleware (WAJIB di atas)
app.use(cors());
app.use(express.json());

// ✅ import routes (TARUH DI SINI)
const bookRoutes = require("./backend/config/controllers/routes/bookRoutes");

// ✅ pakai routes (TARUH DI SINI)
app.use("/api/books", bookRoutes);

// optional test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ paling bawah
app.listen(3000, () => {
  console.log("Server running on port 3000");
})
