import React, { useState, useEffect } from "react";
import "./adminanggota.css";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function AdminAnggota() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [anggota, setAnggota] = useState([]);

  useEffect(() => {
    const fetchAnggota = async () => {
      try {
        const res = await fetch(`${API_BASE}/users`);
        const json = await res.json();
        const rawData = Array.isArray(json) ? json : (json.data || []);
        
        const mapped = rawData.map((u, i) => ({
          realId: u.id,
          nim: u.nim || u.username || `NIM-${u.id || i}`,
          nama: u.name || u.nama || `User ${u.id || i}`,
          totalPinjam: u.totalPinjam || u.total_pinjam || 0,
          pinjamAktif: u.pinjamAktif || u.pinjam_aktif || 0,
        }));
        
        setAnggota(mapped);
      } catch (err) {
        console.error("Gagal fetch data anggota:", err);
      }
    };
    fetchAnggota();
  }, []);

  const filtered = anggota.filter(
    (a) =>
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.nim.includes(search)
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;

    // Update UI immediately (optimistic)
    setAnggota((prev) => prev.filter((a) => a.nim !== deleteTarget.nim));

    try {
      if (deleteTarget.realId) {
        await fetch(`${API_BASE}/users/${deleteTarget.realId}`, {
          method: "DELETE"
        });
      }
    } catch (err) {
      console.error("Gagal menghapus anggota:", err);
    }

    setDeleteTarget(null);
  };

  const totalBukuDipinjam = anggota.reduce((sum, a) => sum + a.pinjamAktif, 0);

  return (
    <div className="aa-root">
      {/* Navbar */}
      <AdminNavbar active="Anggota" />

      {/* Main */}
      <main className="aa-main">
        {/* Page Header */}
        <div className="aa-page-header">
          <div className="aa-page-title-wrap">
            <h1 className="aa-page-title">Data Anggota</h1>
            <p className="aa-page-desc">
              Kelola informasi mahasiswa dan pantau aktivitas peminjaman literatur di lingkungan Pustaka Harmoni.
            </p>
          </div>
          <div className="aa-search-wrap">
            <svg className="aa-search-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              className="aa-search"
              type="text"
              placeholder="Cari Nama atau NIM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="aa-stats">
          <div className="aa-stat-card aa-stat-pink">
            <div className="aa-stat-label">Total Anggota Aktif</div>
            <div className="aa-stat-value">{anggota.length.toLocaleString("id-ID")}</div>
            <div className="aa-stat-bg-icon">
              <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="#c0306a" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.364-3.764M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a4 4 0 015.364-3.764M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <div className="aa-stat-card aa-stat-white">
            <div className="aa-stat-icon-wrap">
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#c0306a" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="aa-stat-label-sm">Buku Dipinjam</div>
            <div className="aa-stat-value-sm">{totalBukuDipinjam}</div>
          </div>
        </div>

        {/* Table Card */}
        <div className="aa-table-card">
          <div className="aa-table-title">Daftar Mahasiswa</div>
          <div className="aa-table-wrap">
            <table className="aa-table">
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>NAMA LENGKAP</th>
                  <th>TOTAL PINJAM</th>
                  <th>PINJAMAN AKTIF</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="aa-empty">Tidak ada anggota ditemukan.</td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.nim}>
                      <td className="aa-td-nim">{row.nim}</td>
                      <td className="aa-td-nama">{row.nama}</td>
                      <td>
                        <span className="aa-badge aa-badge-total">{row.totalPinjam} Buku</span>
                      </td>
                      <td>
                        <span className="aa-badge aa-badge-aktif">{row.pinjamAktif} Buku</span>
                      </td>
                      <td>
                        <button
                          className="aa-del-btn"
                          aria-label={`Hapus ${row.nama}`}
                          onClick={() => setDeleteTarget(row)}
                        >
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="aa-table-footer">
            Menampilkan {filtered.length} dari {anggota.length} anggota
          </div>
        </div>
      </main>

      {/* Modal Hapus */}
      {deleteTarget && (
        <div className="aa-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="aa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aa-modal-icon-wrap">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#c0306a" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="aa-modal-title">Hapus Data Mahasiswa?</h2>
            <p className="aa-modal-desc">
              Apakah Anda yakin ingin menghapus data mahasiswa ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="aa-modal-actions">
              <button className="aa-btn-batal" onClick={() => setDeleteTarget(null)}>Batal</button>
              <button className="aa-btn-hapus" onClick={handleDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}