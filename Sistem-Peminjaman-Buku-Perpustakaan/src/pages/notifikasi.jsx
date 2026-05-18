import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "./notifikasi.css";

// ─── ILUSTRASI SVG ───────────────────────────────────────────────────────────
const IllustrasiKosong = () => (
  <div className="ilustrasi-wrap">
    {/* Card utama */}
    <div className="ilustrasi-card ilustrasi-card--main">
      <div className="ilustrasi-bell-circle">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0507a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      </div>
    </div>

    {/* Card kecil kanan atas */}
    <div className="ilustrasi-card ilustrasi-card--topright">
      <div className="ilustrasi-dot" />
    </div>

    {/* Card kecil bawah kiri */}
    <div className="ilustrasi-card ilustrasi-card--bottomleft">
      <div className="ilustrasi-line" />
      <div className="ilustrasi-icon-small">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0507a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
    </div>

    {/* Lingkaran dekorasi blur */}
    <div className="ilustrasi-blob" />
  </div>
);

// ─── KOMPONEN UTAMA ──────────────────────────────────────────────────────────
/**
 * File  : src/pages/Notifikasi.jsx
 * Route : /notifikasi
 */
export default function Notifikasi() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Navbar />
      <main className="notif-page">
        <div className="notif-container">
        <IllustrasiKosong />

        <h1 className="notif-title">Belum Ada Notifikasi</h1>
        <p className="notif-subtitle">
          Semua pemberitahuan tentang aktivitas peminjaman dan
          <br />pengembalian buku Anda akan muncul di sini.
        </p>

        <button className="notif-btn" onClick={() => navigate("/")}>
          Jelajahi Katalog
        </button>
        </div>
      </main>
    </div>
  );
}
