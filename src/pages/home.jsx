import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "./home.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

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

// ── Placeholder warna untuk buku tanpa cover ─────────────────
const PLACEHOLDER_COLORS = ["#7c3aed","#1e40af","#b91c1c","#047857","#b45309","#be185d"];

function CoverOrPlaceholder({ coverUrl, title, id }) {
  if (coverUrl) {
    return <img src={coverUrl} alt={title} className="book-cover" onError={(e) => { e.target.style.display='none'; }} />;
  }
  const bg = PLACEHOLDER_COLORS[(id || 0) % PLACEHOLDER_COLORS.length];
  return (
    <div style={{ width:'100%', aspectRatio:'3/4', background: bg, borderRadius: 6, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 8 }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
      <span style={{ fontSize:10, color:'rgba(255,255,255,0.8)', textAlign:'center', padding:'0 8px' }}>{title?.slice(0,15)}</span>
    </div>
  );
}

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
        <CoverOrPlaceholder coverUrl={book.coverUrl} title={book.title} id={book.id} />
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
  const [newBooks, setNewBooks] = useState([]);
  const navigate = useNavigate();

  // Fetch buku terbaru dari API
  useEffect(() => {
    fetch(`${API_BASE}/books`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Ambil 5 buku terbaru, map ke format yang dibutuhkan
          const mapped = data.slice(-5).reverse().map((b) => ({
            id: b.id,
            category: b.genre || "KOLEKSI",
            title: b.title,
            author: b.author,
            status: (b.stock ?? 0) > 0 ? "tersedia" : "dipinjam",
            coverUrl: b.cover_url ? `${BACKEND_URL}${b.cover_url}` : null,
          }));
          setNewBooks(mapped);
        }
      })
      .catch((err) => console.error("Gagal fetch buku home:", err));
  }, []);

  return (
    <div className="home-page">
      {/* ── Navbar ── */}
      <Navbar activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="home-main">
        {/* ── Section: Buku Terbaru ── */}
        <section className="section-popular">
          <div className="section-header-row">
            <h2 className="section-title">Buku Terbaru</h2>
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

          {/* Hero banner buku terbaru (ambil buku paling baru dari backend) */}
          <div className="hero-banner">
            <div className="hero-cover">
              <img
                src={newBooks?.[0]?.coverUrl || "/hero_book.png"}
                alt="Buku Terbaru"
                className="hero-cover-img"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>

            <div className="hero-info">
              <span className="trending-badge">TERBARU</span>
              <h1 className="hero-title">{newBooks?.[0]?.title || ""}</h1>
              <p className="hero-desc">
                {(newBooks?.[0]?.author && `Ditulis oleh ${newBooks[0].author}`) || ""}
              </p>
              <div className="hero-actions">
                <button
                  className="btn-primary"
                  onClick={() => newBooks?.[0]?.id && navigate(`/buku/${newBooks[0].id}/pinjam`)}
                  disabled={!newBooks?.[0]?.id}
                >
                  Pinjam Sekarang
                </button>
                <button
                  className="btn-outline"
                  onClick={() => newBooks?.[0]?.id && navigate(`/buku/${newBooks[0].id}`)}
                  disabled={!newBooks?.[0]?.id}
                >
                  Detail Buku
                </button>
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
