import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import { mapBook } from "../utils/bookMapper";
import "./detailbuku.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

export default function DetailBuku() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [buku, setBuku] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/books/${id}`);
        if (!res.ok) {
          throw new Error("Gagal memuat data buku");
        }
        const data = await res.json();
        const mapped = mapBook(data);

        // Auto-generate synopsis using Claude API via backend
        try {
          const synRes = await fetch(`${API_BASE}/books/generate-synopsis`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              title: mapped.title || mapped.judul,
              author: mapped.author || mapped.penulis
            })
          });
          if (synRes.ok) {
            const synData = await synRes.json();
            mapped.sinopsis = synData.synopsis;
          }
        } catch (e) {
          console.error("Gagal generate sinopsis otomatis:", e);
        }

        setBuku(mapped);
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const isTersedia = buku?.status === "tersedia";

  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="detail-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <p style={{ color: "#888", fontSize: 16 }}>Memuat detail buku...</p>
        </main>
      </div>
    );
  }

  if (error || !buku) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="detail-page">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft /> Kembali
          </button>
          <p style={{ color: "var(--gray-400)", marginTop: 40 }}>
            {error ? `Gagal memuat: ${error}` : "Buku tidak ditemukan."}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar />
      <main className="detail-page">
        <div className="detail-content">
          <div className="detail-cover-col">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft /> Kembali
            </button>
            <div className="detail-cover-container">
              {buku.cover ? (
                <img
                  src={buku.cover}
                  alt={buku.judul}
                  className="detail-cover-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const fallback = e.target.nextSibling;
                    if (fallback) fallback.style.display = "block";
                  }}
                />
              ) : null}
              <div
                className="detail-cover-plain"
                style={{ display: buku.cover ? "none" : "block" }}
              ></div>
            </div>
            <span className={`detail-status-badge detail-status-badge--${isTersedia ? "tersedia" : "dipinjam"}`}>
              <CheckCircle />
              {isTersedia ? "Tersedia" : "Dipinjam"}
            </span>
          </div>

          <div className="detail-info-col">
            <div className="detail-header-inline">
              <h1 className="detail-judul">{buku.judul}</h1>
              <span className="detail-penulis">Oleh {buku.penulis}</span>
            </div>
            <div className="detail-meta">
              <span className="detail-kategori">Kategori : {buku.kategori}</span>
            </div>

            <button 
              className="pinjam-btn" 
              disabled={!isTersedia}
              onClick={() => navigate(`/buku/${buku.id}/pinjam`)}
            >
              <BookIcon />
              {isTersedia ? "Pinjam Sekarang" : "Sedang Dipinjam"}
            </button>

            <div className="sinopsis-card">
              <h2 className="sinopsis-title">Sinopsis</h2>
              <p className="sinopsis-text">{buku.sinopsis}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}