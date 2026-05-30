import React, { useState, useEffect } from "react";
import "./admin.css";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function AdminDashboard() {
  const [totalBuku, setTotalBuku] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Total Buku
        const resBooks = await fetch(`${API_BASE}/books`);
        const booksData = await resBooks.json();
        const booksArray = Array.isArray(booksData) ? booksData : [];
        setTotalBuku(booksArray.length);

        // Fetch Total Transaksi & Aktivitas Terbaru
        const resTrans = await fetch(`${API_BASE}/transactions`);
        const transData = await resTrans.json();
        const transArray = Array.isArray(transData) ? transData : [];
        setTotalTransaksi(transArray.length);

        // Format Aktivitas Terbaru
        const sortedTrans = [...transArray].sort((a, b) => {
          const dateA = new Date(a.created_at || a.tanggal_pinjam || 0);
          const dateB = new Date(b.created_at || b.tanggal_pinjam || 0);
          return dateB - dateA;
        });

        const recent = sortedTrans.slice(0, 4).map((tx, index) => {
          return {
            id: tx.id || index,
            anggota: tx.user?.name || tx.anggota || tx.nama_peminjam || `User ${tx.user_id || "-"}`,
            judul: tx.book?.title || tx.judul || tx.judul_buku || `Buku ${tx.book_id || "-"}`,
            penulis: tx.book?.author || tx.penulis || tx.pengarang || "-",
            status: tx.status === "RETURNED" || tx.status === "KEMBALI" ? "KEMBALI" : "PINJAM",
            waktu: new Date(tx.created_at || tx.tanggal_pinjam || new Date()).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })
          };
        });

        setRecentActivity(recent);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="admin-root">
      {/* Navbar */}
      <AdminNavbar active="Dashboard" />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">Selamat Datang, Admin!</h1>
          <p className="admin-subtitle">Berikut adalah ringkasan perpustakaan Anda hari ini.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#c0306a" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="stat-label">TOTAL BUKU</div>
            <div className="stat-value">
              {totalBuku} <span className="stat-unit">Buku</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#c0306a" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="stat-label">TOTAL TRANSAKSI</div>
            <div className="stat-value">
              {totalTransaksi} <span className="stat-unit">Transaksi</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <div className="activity-header">
            <div>
              <h2 className="activity-title">Aktivitas Terbaru</h2>
              <p className="activity-desc">Pemantauan real-time perpustakaan</p>
            </div>
            <button className="btn-lihat-semua">
              Lihat Semua
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="activity-table-wrap">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>ANGGOTA</th>
                  <th>JUDUL BUKU</th>
                  <th>STATUS</th>
                  <th>WAKTU</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr key={row.id}>
                    <td className="td-anggota">{row.anggota}</td>
                    <td className="td-buku">
                      <span className="buku-judul">{row.judul}</span>
                      <span className="buku-penulis">{row.penulis}</span>
                    </td>
                    <td>
                      <span className={`badge ${row.status === "PINJAM" ? "badge-pinjam" : "badge-kembali"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="td-waktu">{row.waktu}</td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                      Belum ada aktivitas terbaru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="activity-footer">
            Menampilkan {recentActivity.length} aktivitas terakhir dari {totalTransaksi} total data.
          </div>
        </div>
      </main>
    </div>
  );
}