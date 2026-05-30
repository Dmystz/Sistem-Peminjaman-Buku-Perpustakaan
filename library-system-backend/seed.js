require("dotenv").config();
const db = require("./backend/config/db");

const books = [
  { title: "Seni Menenangkan Hati", author: "Andi Wijaya", stock: 5 },
  { title: "Alam Semesta & Kita", author: "Dr. Sarah Fitri", stock: 3 },
  { title: "Petualangan Si Kecil", author: "Bunda Maya", stock: 8 },
  { title: "Ruang Tenang", author: "Rania Putri", stock: 4 },
  { title: "Mencari Makna Hidup", author: "Viktor Frankl", stock: 6 },
  { title: "Masa Depan AI", author: "Budi Santoso", stock: 2 },
  { title: "Nusantara Berjaya", author: "Prof. Ahmad", stock: 7 },
  { title: "Strategi Digital", author: "Linda Sari", stock: 9 },
];

const users = [
  {
    name: "Admin Perpustakaan",
    username: "admin",
    password: "admin123",
    role: "admin",
    nim: null,
  },
  {
    name: "Mahasiswa UBT",
    username: "mahasiswaubt",
    password: "21120124130049",
    role: "mahasiswa",
    nim: "21120124130049",
  },
];

async function seed() {
  try {
    console.log("Seeding database...");

    // Seed users
    for (const user of users) {
      await db.query(
        `INSERT INTO users (name, username, password, role, nim)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO NOTHING`,
        [user.name, user.username, user.password, user.role, user.nim]
      );
    }
    console.log(`Inserted ${users.length} users.`);

    // Seed books
    for (const book of books) {
      await db.query(
        "INSERT INTO books (title, author, stock) VALUES ($1, $2, $3)",
        [book.title, book.author, book.stock]
      );
    }
    console.log(`Inserted ${books.length} books.`);

    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seed();
