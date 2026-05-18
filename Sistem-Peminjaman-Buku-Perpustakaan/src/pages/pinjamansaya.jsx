import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "./pinjamansaya.css";

// ─── ICON ────────────────────────────────────────────────────────────────────
const HistoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);

// ─── DATA RIWAYAT PINJAMAN ───────────────────────────────────────────────────
const RIWAYAT = [
  {
    id: 1,
    cover: "/cover_filosofi.png",
    judul: "Laut Bercerita",
    tanggalPinjam: "10 Mei 2026",
    tanggalKembali: "17 Mei 2026",
    status: "dipinjam",
  },
  {
    id: 2,
    cover: "/cover_atomic.png",
    judul: "Pulang",
    tanggalPinjam: "10 Mar 2026",
    tanggalKembali: "17 Mar 2026",
    status: "selesai",
  },
  {
    id: 3,
    cover: "/cover_forest.png",
    judul: "Sapiens",
    tanggalPinjam: "01 Jan 2026",
    tanggalKembali: "08 Jan 2026",
    status: "selesai",
  },
];

// ─── KOMPONEN UTAMA ──────────────────────────────────────────────────────────
/**
 * File  : src/pages/PinjamanSaya.jsx
 * Route : /pinjaman
 */
export default function PinjamanSaya() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Navbar />
      <main className="pinjaman-page">
      {/* ── Header ── */}
      <div className="pinjaman-header">
        <h1 className="pinjaman-title">Pinjaman Saya</h1>
        <p className="pinjaman-subtitle">
          Lacak kemajuan membaca dan kelola tenggat waktu peminjaman buku Anda dengan tenang.
        </p>
      </div>

      {/* ── Riwayat ── */}
      <div className="riwayat-section">
        <h2 className="riwayat-heading">
          <HistoryIcon />
          Riwayat Pinjaman
        </h2>

        <div className="riwayat-table-wrap">
          <table className="riwayat-table">
            <thead>
              <tr>
                <th>JUDUL BUKU</th>
                <th>TANGGAL PINJAM</th>
                <th>TANGGAL KEMBALI</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {RIWAYAT.map((item) => (
                <tr key={item.id} className="riwayat-row">
                  {/* Judul */}
                  <td className="riwayat-judul-cell">
                    <div className={`riwayat-cover-plain riwayat-cover-plain--${item.id}`}></div>
                    <span className="riwayat-judul">{item.judul}</span>
                  </td>

                  {/* Tanggal Pinjam */}
                  <td className="riwayat-date">{item.tanggalPinjam}</td>

                  {/* Tanggal Kembali */}
                  <td className="riwayat-date">{item.tanggalKembali}</td>

                  {/* Status */}
                  <td>
                    <span className={`status-badge status-badge--${item.status}`}>
                      {item.status === "dipinjam" ? "Dipinjam" : "Selesai"}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="riwayat-aksi-cell">
                    {item.status === "dipinjam" ? (
                      <button className="aksi-btn aksi-btn--kembalikan">Kembalikan</button>
                    ) : (
                      <button
                        className="aksi-btn aksi-btn--pinjam-lagi"
                        onClick={() => navigate(`/buku/${item.id}/pinjam`)}
                      >
                        Pinjam Lagi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </main>
    </div>
  );
}
