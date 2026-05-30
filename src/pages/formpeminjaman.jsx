import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import "./formpeminjaman.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

// ─── ICONS ──────────────────────────────────────────────────────────────────
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const DURASI_OPTIONS = ["7 hari", "14 hari", "21 hari", "30 hari"];

// ─── HELPER: hitung estimasi pengembalian ────────────────────────────────────
function hitungEstimasi(tanggal, durasi) {
  if (!tanggal) return null;
  const hari = parseInt(durasi);
  const tgl = new Date(tanggal);
  tgl.setDate(tgl.getDate() + hari);
  return tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function hitungReturnDate(tanggal, durasi) {
  if (!tanggal) return null;
  const hari = parseInt(durasi);
  const tgl = new Date(tanggal);
  tgl.setDate(tgl.getDate() + hari);
  return tgl.toISOString().split("T")[0]; // YYYY-MM-DD format
}

// ─── KOMPONEN UTAMA ──────────────────────────────────────────────────────────
export default function FormPeminjaman() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [buku, setBuku] = useState(null);
  const [loadingBuku, setLoadingBuku] = useState(true);
  const [errorBuku, setErrorBuku] = useState(null);

  const [durasi, setDurasi] = useState("7 hari");
  const [tanggal, setTanggal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Fetch data buku dari API berdasarkan id dari URL params
  useEffect(() => {
    const fetchBuku = async () => {
      try {
        setLoadingBuku(true);
        const res = await fetch(`${API_BASE}/books/${id}`);
        if (!res.ok) throw new Error("Buku tidak ditemukan");
        const data = await res.json();
        setBuku(data);
      } catch (err) {
        setErrorBuku(err.message);
      } finally {
        setLoadingBuku(false);
      }
    };
    fetchBuku();
  }, [id]);

  const estimasi = hitungEstimasi(tanggal, durasi);

  async function handleKonfirmasi() {
    if (!tanggal) {
      alert("Silakan pilih tanggal peminjaman terlebih dahulu.");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Anda harus login terlebih dahulu.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user?.id) {
      alert("Sesi login tidak valid. Silakan login ulang.");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const return_date = hitungReturnDate(tanggal, durasi);

    try {
      const res = await fetch(`${API_BASE}/books/borrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          book_id: parseInt(id),
          borrow_date: tanggal,
          return_date,
          status: "dipinjam",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan peminjaman");
      }

      setSubmitted(true);
      // Redirect ke halaman Pinjaman Saya setelah 1.5 detik
      setTimeout(() => navigate("/pinjaman"), 1500);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading buku ──
  if (loadingBuku) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="form-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <p style={{ color: "#888", fontSize: 16 }}>Memuat data buku...</p>
        </main>
      </div>
    );
  }

  // ── Buku tidak ditemukan ──
  if (errorBuku || !buku) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="form-page">
          <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft /> Kembali</button>
          <p style={{ color: "var(--gray-400)", marginTop: 40 }}>
            {errorBuku || "Buku tidak ditemukan."}
          </p>
        </main>
      </div>
    );
  }

  const isTersedia = (buku.stock ?? 0) > 0;
  const coverUrl = buku.cover_url
    ? (buku.cover_url.startsWith("http") ? buku.cover_url : `${BACKEND_URL}${buku.cover_url}`)
    : null;

  return (
    <div className="home-page">
      <Navbar />
      <main className="form-page">
        {/* ── Header ── */}
        <div className="form-header">
          <h1 className="form-title">Formulir Peminjaman Buku</h1>
          <p className="form-subtitle">Silakan lengkapi detail peminjaman di bawah ini untuk melanjutkan.</p>
        </div>

      {/* ── Body ── */}
      <div className="form-body">
        {/* ── Kolom Kiri: Info Buku ── */}
        <div className="form-book-card">
          <h2 className="form-book-card__heading">Buku yang Dipinjam</h2>
          <div className="form-book-card__cover-wrap">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={buku.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="form-book-card__cover-plain"></div>
            )}
          </div>
          <span className={`form-book-card__badge${isTersedia ? "" : " form-book-card__badge--dipinjam"}`}>
            {isTersedia ? "TERSEDIA" : "STOK HABIS"}
          </span>
          <h3 className="form-book-card__title">{buku.title}</h3>
          <p className="form-book-card__author">{buku.author}</p>
        </div>

        {/* ── Kolom Kanan: Form ── */}
        <div className="form-fields">
          {/* Durasi */}
          <div className="field-group">
            <label className="field-label">Durasi Pinjam</label>
            <div className="select-wrap">
              <select
                className="field-select"
                value={durasi}
                onChange={(e) => setDurasi(e.target.value)}
                disabled={submitted || submitting}
              >
                {DURASI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span className="select-icon"><ChevronDown /></span>
            </div>
          </div>

          {/* Tanggal */}
          <div className="field-group">
            <label className="field-label">Tanggal Peminjaman</label>
            <div className="input-wrap">
              <input
                type="date"
                className="field-input"
                value={tanggal}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setTanggal(e.target.value)}
                disabled={submitted || submitting}
              />
              <span className="input-icon"><CalendarIcon /></span>
            </div>
          </div>

          {/* Estimasi */}
          <div className="estimasi-box">
            <span className="estimasi-label">Estimasi Pengembalian</span>
            <span className="estimasi-value">
              {estimasi ?? <span className="estimasi-placeholder">Pilih tanggal dulu</span>}
            </span>
          </div>

          {/* Error message */}
          {submitError && (
            <p style={{ color: "#c0392b", fontSize: 13, margin: "0 0 4px" }}>{submitError}</p>
          )}

          {/* Tombol */}
          <button
            className={`konfirmasi-btn${submitted ? " konfirmasi-btn--success" : ""}`}
            onClick={handleKonfirmasi}
            disabled={submitted || submitting || !isTersedia}
          >
            <CheckCircle />
            {submitted ? "Peminjaman Dikonfirmasi! Mengarahkan..." : submitting ? "Menyimpan..." : "Konfirmasi Pinjaman"}
          </button>

          <button className="batal-btn" onClick={() => navigate(-1)} disabled={submitted || submitting}>
            Batal
          </button>
        </div>
      </div>
      </main>
    </div>
  );
}
