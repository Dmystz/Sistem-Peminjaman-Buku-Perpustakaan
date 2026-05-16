import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import "./formpeminjaman.css";

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

// ─── DATA BUKU (sama seperti di DetailBuku) ──────────────────────────────────
const BUKU_LIST = [
  { id: 1, cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80", judul: "Seni Menenangkan Hati", penulis: "Andi Wijaya", status: "tersedia" },
  { id: 2, cover: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80", judul: "Alam Semesta & Kita", penulis: "Dr. Sarah Fitri", status: "dipinjam" },
  { id: 3, cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", judul: "Petualangan Si Kecil", penulis: "Bunda Maya", status: "tersedia" },
  { id: 4, cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80", judul: "Ruang Tenang", penulis: "Rania Putri", status: "tersedia" },
  { id: 5, cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80", judul: "Mencari Makna Hidup", penulis: "Viktor Frankl", status: "tersedia" },
  { id: 6, cover: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80", judul: "Masa Depan AI", penulis: "Budi Santoso", status: "dipinjam" },
  { id: 7, cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", judul: "Nusantara Berjaya", penulis: "Prof. Ahmad", status: "tersedia" },
  { id: 8, cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80", judul: "Strategi Digital", penulis: "Linda Sari", status: "tersedia" },
];

const DURASI_OPTIONS = ["7 hari", "14 hari", "21 hari", "30 hari"];

// ─── HELPER: hitung estimasi pengembalian ────────────────────────────────────
function hitungEstimasi(tanggal, durasi) {
  if (!tanggal) return null;
  const hari = parseInt(durasi);
  const tgl = new Date(tanggal);
  tgl.setDate(tgl.getDate() + hari);
  return tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ─── KOMPONEN UTAMA ──────────────────────────────────────────────────────────
/**
 * File  : src/pages/FormPeminjaman.jsx
 * Route : /buku/:id/pinjam
 */
export default function FormPeminjaman() {
  const navigate = useNavigate();
  const { id } = useParams();

  const buku = BUKU_LIST.find((b) => b.id === Number(id));

  const [durasi, setDurasi] = useState("7 hari");
  const [tanggal, setTanggal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const estimasi = hitungEstimasi(tanggal, durasi);

  function handleKonfirmasi() {
    if (!tanggal) {
      alert("Silakan pilih tanggal peminjaman terlebih dahulu.");
      return;
    }
    setSubmitted(true);
    // Di sini bisa tambahkan logika submit ke API
    setTimeout(() => navigate("/"), 2000);
  }

  if (!buku) {
    return (
      <main className="form-page">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft /> Kembali</button>
        <p style={{ color: "var(--gray-400)", marginTop: 40 }}>Buku tidak ditemukan.</p>
      </main>
    );
  }

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
            <div className="form-book-card__cover-plain"></div>
          </div>
          <span className="form-book-card__badge">TERSEDIA</span>
          <h3 className="form-book-card__title">{buku.judul}</h3>
          <p className="form-book-card__author">{buku.penulis}</p>
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
                onChange={(e) => setTanggal(e.target.value)}
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

          {/* Tombol */}
          <button
            className={`konfirmasi-btn${submitted ? " konfirmasi-btn--success" : ""}`}
            onClick={handleKonfirmasi}
            disabled={submitted}
          >
            <CheckCircle />
            {submitted ? "Peminjaman Dikonfirmasi!" : "Konfirmasi Pinjaman"}
          </button>

          <button className="batal-btn" onClick={() => navigate(-1)} disabled={submitted}>
            Batal
          </button>
        </div>
      </div>
      </main>
    </div>
  );
}
