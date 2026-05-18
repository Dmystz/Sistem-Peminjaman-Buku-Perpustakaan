import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "./home.css";


const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── Data buku koleksi baru ───────────────────────────────────
// TODO: Ganti dengan data dari bookService.js (src/services/bookService.js)
const newBooks = [
  {
    id: 1,
    category: "FIKSI",
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    status: "tersedia",
    coverUrl: "/cover_filosofi.png",
  },
  {
    id: 2,
    category: "SELF IMPROVEMENT",
    title: "Atomic Habits",
    author: "James Clear",
    status: "tersedia",
    coverUrl: "/cover_atomic.png",
  },
  {
    id: 3,
    category: "SASTRA",
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    status: "dipinjam",
    coverUrl: "/cover_bumi.png",
  },
  {
    id: 4,
    category: "SAINS",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    status: "tersedia",
    coverUrl: "/cover_sapiens.png",
  },
  {
    id: 5,
    category: "PSIKOLOGI",
    title: "Quiet",
    author: "Susan Cain",
    status: "tersedia",
    coverUrl: "/cover_quiet.png",
  },
];

// ── Badge status ─────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === "tersedia" ? "Tersedia" : "Dipinjam"}
    </span>
  );
}

// ── Kartu buku kecil ─────────────────────────────────────────
function BookCard({ book }) {
  const navigate = useNavigate();
  const isTersedia = book.status === "tersedia";

  return (
    <div className="book-card">
      <div className="book-card-image-wrap" onClick={() => navigate(`/buku/${book.id}`)} style={{ cursor: 'pointer' }}>
        <img src={book.coverUrl} alt={book.title} className="book-cover" />
        {!isTersedia && (
          <div className="cover-overlay">
            <span className="cover-label">DIPINJAM</span>
          </div>
        )}
      </div>
      <div className="book-info">
        <span className="book-category">{book.category}</span>
        <p className="book-title">{book.title}</p>
        <p className="book-author">{book.author}</p>
        <StatusBadge status={book.status} />
      </div>
      <div className="book-card-actions">
        <button
          className="book-btn book-btn--detail"
          onClick={() => navigate(`/buku/${book.id}`)}
        >
          Detail Buku
        </button>
        <button
          className={`book-btn book-btn--pinjam${!isTersedia ? " book-btn--disabled" : ""}`}
          disabled={!isTersedia}
          onClick={() => isTersedia && navigate(`/buku/${book.id}/pinjam`)}
        >
          Pinjam Sekarang
        </button>
      </div>
    </div>
  );
}

// ── Halaman utama Home ───────────────────────────────────────
export default function Home() {
  const [activeNav, setActiveNav] = useState("Katalog");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* ── Navbar ── */}
      <Navbar activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="home-main">
        {/* ── Section: Paling Dicari ── */}
        <section className="section-popular">
          <div className="section-header-row">
            <h2 className="section-title">Paling Dicari</h2>
            {/* SearchBar — bisa dipindah ke src/components/common/SearchBar.jsx */}
            <div className="search-wrap">
              <SearchIcon />
              <input
                type="text"
                className="search-input"
                placeholder="Cari judul, penulis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Hero banner buku trending */}
          <div className="hero-banner">
            {/* Sampul buku hero */}
            <div className="hero-cover">
              <img src="/hero_book.png" alt="Buku Trending" className="hero-cover-img" />
            </div>

            {/* Info buku trending */}
            <div className="hero-info">
              <span className="trending-badge">TRENDING #1</span>
              <h1 className="hero-title">Laskar Pelangi</h1>
              <p className="hero-desc">
                Kisah inspiratif tentang perjuangan sepuluh anak di Pulau Belitung
                dalam meraih cita-cita melalui pendidikan yang terbatas.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => navigate("/buku/1/pinjam")}>Pinjam Sekarang</button>
                <button className="btn-outline" onClick={() => navigate("/buku/1")}>Detail Buku</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: Koleksi Baru ── */}
        <section className="section-new">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Koleksi Baru</h2>
              <p className="section-sub">Baru saja tiba di rak digital kami</p>
            </div>
            <button className="link-btn">
              Lihat Semua <ArrowRightIcon />
            </button>
          </div>

          {/* Grid buku */}
          <div className="books-grid">
            {newBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
