import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "./pinjamansaya.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

// ─── ICON ────────────────────────────────────────────────────────────────────
const HistoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

export default function PinjamanSaya() {
  const navigate = useNavigate();
  const [modalBuku, setModalBuku] = useState(null);
  const [successBuku, setSuccessBuku] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const userObj = JSON.parse(storedUser);
        if (!userObj?.id) return;

        const res = await fetch(`${API_BASE}/books/transactions?user_id=${userObj.id}`);
        const rawData = await res.json();
        const rows = Array.isArray(rawData) ? rawData : [];

        const mapped = rows.map((tx) => {
          let st = "dipinjam";
          const s = (tx.status || "").toLowerCase();
          if (s === "returned" || s === "selesai" || s === "kembali") st = "selesai";
          if (s === "pending" || s === "menunggu") st = "menunggu";

          const coverRaw = tx.cover_url;
          const cover = coverRaw
            ? (coverRaw.startsWith("http") ? coverRaw : `${BACKEND_URL}${coverRaw}`)
            : null;

          return {
            id: tx.id,
            realId: tx.id,
            book_id: tx.book_id,
            cover,
            judul: tx.title || `Buku #${tx.book_id}`,
            penulis: tx.author || "Unknown Author",
            tanggalPinjam: tx.borrow_date
              ? new Date(tx.borrow_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
              : "-",
            tanggalKembali: tx.return_date
              ? new Date(tx.return_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
              : "Belum ditentukan",
            status: st,
          };
        });

        setRiwayat(mapped);
      } catch (e) {
        console.error("Gagal fetch riwayat pinjaman:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, []);

  const handleReturn = (item) => {
    // Show modal with selected book
    setModalBuku(item);
  };

  const handleConfirmReturn = async () => {
    try {
      setRiwayat(prev => prev.map(book => 
        book.id === modalBuku.id ? { ...book, status: "menunggu" } : book
      ));

      if (modalBuku.realId) {
        await fetch(`${API_BASE}/books/transactions/${modalBuku.realId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "menunggu" })
        });
      }
      
      setSuccessBuku(modalBuku);
      setModalBuku(null);
    } catch (e) {
      console.error("Gagal update status:", e);
    }
  };

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
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#888" }}>Memuat riwayat pinjaman...</td>
                </tr>
              ) : riwayat.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#888" }}>Belum ada riwayat pinjaman.</td>
                </tr>
              ) : riwayat.map((item) => (
                <tr key={item.id} className="riwayat-row">
                  {/* Judul */}
                  <td className="riwayat-judul-cell">
                    {item.cover ? (
                      <img src={item.cover} alt={item.judul} className="riwayat-cover-img" style={{ width: 40, height: 60, objectFit: "cover", borderRadius: 4, marginRight: 12, flexShrink: 0 }} />
                    ) : (
                      <div className={`riwayat-cover-plain riwayat-cover-plain--${item.id}`}></div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className="riwayat-judul">{item.judul}</span>
                      <span style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{item.penulis}</span>
                    </div>
                  </td>

                  {/* Tanggal Pinjam */}
                  <td className="riwayat-date">{item.tanggalPinjam}</td>

                  {/* Tanggal Kembali */}
                  <td className="riwayat-date">{item.tanggalKembali}</td>

                  {/* Status */}
                  <td>
                    <span className={`status-badge status-badge--${item.status}`}>
                      {item.status === "dipinjam" ? "Dipinjam" : item.status === "menunggu" ? "Menunggu" : "Selesai"}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="riwayat-aksi-cell">
                    {item.status === "dipinjam" ? (
                      <button className="aksi-btn aksi-btn--kembalikan" onClick={() => handleReturn(item)}>Kembalikan</button>
                    ) : item.status === "menunggu" ? (
                      <span className="riwayat-date" style={{ fontSize: '11.5px', color: '#9b4163', fontWeight: 600 }}>Menunggu Admin</span>
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

      {/* ── Modal Konfirmasi Pengembalian ── */}
      {modalBuku && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon-top">
              <InfoIcon />
            </div>
            
            <h3 className="modal-title">Konfirmasi Pengembalian</h3>
            <p className="modal-subtitle">
              Apakah Anda yakin ingin mengembalikan buku ini ke perpustakaan?
            </p>

            <div className="modal-book-card">
              {modalBuku.cover ? (
                <img src={modalBuku.cover} alt={modalBuku.judul} style={{ width: 60, height: 90, objectFit: "cover", borderRadius: 6, marginRight: 16 }} />
              ) : (
                <div className={`modal-book-cover riwayat-cover-plain--${modalBuku.id}`}></div>
              )}
              <div className="modal-book-info">
                <span className="modal-badge">Sedang Dipinjam</span>
                <h4 className="modal-book-title">{modalBuku.judul}</h4>
                <p className="modal-book-author">{modalBuku.penulis}</p>
                <p className="modal-book-date">
                  <CalendarIcon />
                  Pinjam: {modalBuku.tanggalPinjam}
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn--primary" onClick={handleConfirmReturn}>
                Kembalikan Buku
              </button>
              <button className="modal-btn modal-btn--secondary" onClick={() => setModalBuku(null)}>
                Batal
              </button>
            </div>

            <div className="modal-info-box">
              <ShieldCheckIcon />
              <p>Buku akan diverifikasi secara fisik oleh pustakawan di meja layanan sebelum status peminjaman Anda dinyatakan selesai sepenuhnya.</p>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal Success Pengembalian ── */}
      {successBuku && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '32px 28px' }}>
            <div className="modal-success-icon-wrap">
              <div className="modal-success-icon-inner">
                <CheckIcon />
              </div>
            </div>
            
            <h3 className="modal-success-title">Menunggu Konfirmasi Admin.</h3>
            <p className="modal-success-subtitle">
              Terima kasih telah mengembalikan buku tepat waktu.
            </p>

            <div className="modal-success-card">
              <div className="modal-success-item">
                <BookIcon />
                <div className="modal-success-text">
                  <span className="modal-success-label">JUDUL BUKU</span>
                  <span className="modal-success-value">{successBuku.judul}</span>
                </div>
              </div>
              <div className="modal-success-item">
                <CalendarIcon />
                <div className="modal-success-text">
                  <span className="modal-success-label">TANGGAL PENGEMBALIAN</span>
                  <span className="modal-success-value">{successBuku.tanggalKembali}</span>
                </div>
              </div>
            </div>

            <div className="modal-success-actions">
              <button className="modal-btn modal-btn--primary" onClick={() => setSuccessBuku(null)}>
                Kembali ke Riwayat
              </button>
              <button className="modal-btn modal-btn--outline" onClick={() => { setSuccessBuku(null); navigate("/katalog"); }}>
                Cari Buku Lagi
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
