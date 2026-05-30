import { useState, useEffect } from "react";
import BookCard from "../components/bookcard";
import Navbar from "../components/navbar";
import "./koleksibuku.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

// ─── Icon Search ────────────────────────────────────────────────────────────
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

// ─── Halaman Koleksi Buku ───────────────────────────────────────────────────
export default function KoleksiBuku() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  // Fetch buku dari API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_BASE}/books`);
        const data = await res.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal fetch koleksi buku:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Map data API ke format yang dibutuhkan BookCard
  const mappedBooks = books.map((b) => ({
    id: b.id,
    // Gunakan cover_url dari DB, atau null untuk placeholder
    cover: b.cover_url ? `${BACKEND_URL}${b.cover_url}` : null,
    genre: b.genre || "—",
    title: b.title,
    author: b.author,
    status: (b.stock ?? 0) > 0 ? "tersedia" : "dipinjam",
  }));

  // Filter berdasarkan judul, penulis, atau genre
  const filtered = mappedBooks.filter((b) => {
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
              placeholder="Cari judul, penulis, atau genre..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(8);
              }}
              aria-label="Cari buku"
            />
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: 15 }}>
            Memuat koleksi buku...
          </div>
        )}

        {/* ── Grid Buku ── */}
        {!loading && (
          displayed.length > 0 ? (
            <div className="book-grid">
              {displayed.map((buku) => (
                <BookCard key={buku.id} {...buku} />
              ))}
            </div>
          ) : (
            <p className="koleksi-empty">Buku tidak ditemukan.</p>
          )
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
