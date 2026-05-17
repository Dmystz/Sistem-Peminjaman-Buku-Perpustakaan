import React, { useState } from "react";
import "./admin.css";

const recentActivity = [
  {
    id: 1,
    anggota: "user 1",
    judul: "Filosofi Teras",
    penulis: "Henry Manampiring",
    status: "PINJAM",
    waktu: "15 Mei 2026",
  },
  {
    id: 2,
    anggota: "user 2",
    judul: "Bumi Manusia",
    penulis: "Pramoedya Ananta Toer",
    status: "KEMBALI",
    waktu: "10 Mei 2026",
  },
  {
    id: 3,
    anggota: "user 3",
    judul: "Laskar Pelangi",
    penulis: "Andrea Hirata",
    status: "PINJAM",
    waktu: "8 Mei 2026",
  },
  {
    id: 4,
    anggota: "user 4",
    judul: "Negeri 5 Menara",
    penulis: "A. Fuadi",
    status: "PINJAM",
    waktu: "5 Mei 2026",
  },
];

const navLinks = ["Dashboard", "Anggota", "Buku", "Transaksi"];

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <div className="admin-root">
      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="navbar-brand">Dips<span>Book</span></div>
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li
              key={link}
              className={`nav-item ${activeNav === link ? "active" : ""}`}
              onClick={() => setActiveNav(link)}
            >
              {link}
              {activeNav === link && <span className="nav-underline" />}
            </li>
          ))}
        </ul>
        <div className="navbar-icons">
          <button className="icon-btn" aria-label="Notifikasi">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="icon-btn" aria-label="Profil">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </nav>

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
              40 <span className="stat-unit">Buku</span>
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
              12 <span className="stat-unit">Transaksi</span>
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
              </tbody>
            </table>
          </div>

          <div className="activity-footer">
            Menampilkan 4 aktivitas terakhir dari 12 total data.
          </div>
        </div>
      </main>
    </div>
  );
}