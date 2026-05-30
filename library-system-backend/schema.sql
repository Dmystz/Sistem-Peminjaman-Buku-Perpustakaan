-- PostgreSQL Schema for Library Book Borrowing System

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS books;

-- Ensure users table exists with required columns (idempotent for fresh or existing DBs)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'mahasiswa',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add new columns if they don't exist (safe for existing DBs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name VARCHAR(255);
    UPDATE users SET name = username WHERE name IS NULL;
    ALTER TABLE users ALTER COLUMN name SET NOT NULL;
    ALTER TABLE users ALTER COLUMN name SET DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'nim'
  ) THEN
    ALTER TABLE users ADD COLUMN nim VARCHAR(50) UNIQUE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  stock INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'borrowed',
  borrow_date TIMESTAMP DEFAULT NOW(),
  return_date TIMESTAMP NULL
);
