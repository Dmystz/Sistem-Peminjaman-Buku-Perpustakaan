import { useState } from "react";
import BookCard from "../components/bookcard";
import Navbar from "../components/navbar";
import "./koleksibuku.css";

// ─── DATA BUKU ─────────────────────────────────────────────────────────────
const BUKU_LIST = [
  {
    id: 1,
    cover: "/cover_filosofi.png",
    genre: "FIKSI",
    title: "Seni Menenangkan Hati",
    author: "Andi Wijaya",
    status: "tersedia",
  },
  {
    id: 2,
    cover: "/cover_atomic.png",
    genre: "SAINS",
    title: "Alam Semesta & Kita",
    author: "Dr. Sarah Fitri",
    status: "dipinjam",
  },
  {
    id: 3,
    cover: "/cover_forest.png",
    genre: "ANAK",
    title: "Petualangan Si Kecil",
    author: "Bunda Maya",
    status: "tersedia",
  },
  {
    id: 4,
    cover: "/cover_face.png",
    genre: "PSIKOLOGI",
    title: "Ruang Tenang",
    author: "Rania Putri",
    status: "tersedia",
  },
  {
    id: 5,
    cover: "/cover_filosofi.png",
    genre: "FILOSOFI",
    title: "Mencari Makna Hidup",
    author: "Viktor Frankl",
    status: "tersedia",
  },
  {
    id: 6,
    cover: "/cover_atomic.png",
    genre: "TEKNOLOGI",
    title: "Masa Depan AI",
    author: "Budi Santoso",
    status: "dipinjam",
  },
  {
    id: 7,
    cover: "/cover_forest.png",
    genre: "SEJARAH",
    title: "Nusantara Berjaya",
    author: "Prof. Ahmad",
    status: "tersedia",
  },
  {
    id: 8,
    cover: "/cover_face.png",
    genre: "BISNIS",
    title: "Strategi Digital",
    author: "Linda Sari",
    status: "tersedia",
  },
];

// ─── ICON SEARCH ────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ─── HALAMAN KOLEKSI BUKU ───────────────────────────────────────────────────
export default function KoleksiBuku() {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  // Filter berdasarkan judul, penulis, atau genre
  const filtered = BUKU_LIST.filter((b) => {
    const q = query.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
    );
  });

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="home-page">
      <Navbar />
      <main className="koleksi-page">
      {/* ── Header ── */}
      <div className="koleksi-header">
        <div className="koleksi-header__text">
          <h1 className="koleksi-title">Koleksi Buku</h1>
          <p className="koleksi-subtitle">
            Temukan koleksi bacaan berkualitas untuk memperluas cakrawala pengetahuan Anda.
          </p>
        </div>

        {/* ── Search Bar ── */}
        <div className="search-bar">
          <SearchIcon />
          <input
            type="text"
            className="search-input"
            placeholder="Cari judul, penulis, atau ISBN..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(8); // reset saat query berubah
            }}
            aria-label="Cari buku"
          />
        </div>
      </div>

      {/* ── Grid Buku ── */}
      {displayed.length > 0 ? (
        <div className="book-grid">
          {displayed.map((buku) => (
            <BookCard key={buku.id} {...buku} />
          ))}
        </div>
      ) : (
        <p className="koleksi-empty">Buku tidak ditemukan.</p>
      )}

      {/* ── Muat Lebih Banyak ── */}
      {hasMore && (
        <div className="load-more-wrap">
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((c) => c + 4)}
          >
            Muat Lebih Banyak <ChevronDown />
          </button>
        </div>
      )}
      </main>
    </div>
  );
}
