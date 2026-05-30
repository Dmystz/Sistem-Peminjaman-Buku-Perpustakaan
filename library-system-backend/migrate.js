require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("./backend/config/db");

const schemaPath = path.join(__dirname, "schema.sql");

async function migrate() {
  try {
    const schema = fs.readFileSync(schemaPath, "utf-8");
    console.log("Running migrations...");
    await db.query(schema);
    console.log("Migrations completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrate();
