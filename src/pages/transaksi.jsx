import { useState, useEffect } from "react";
import "./transaksi.css";
import AdminNavbar from "../components/adminnavbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const STATUS_OPTIONS = ["Dipinjam", "Selesai", "Terlambat"];
const PER_PAGE = 5;

/* ── Icon helpers ── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconFilter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconReceipt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

/* ── Status Badge ── */
function StatusBtn({ status, onClick }) {
  const cls = {
    Dipinjam:  "status-dipinjam",
    Selesai:   "status-selesai",
    Terlambat: "status-terlambat",
    "Tidak Dikembalikan": "status-terlambat",
  }[status] || "status-dipinjam";

  return (
    <button className={`status-btn ${cls}`} onClick={onClick}>
      {status}
      <IconChevronDown />
    </button>
  );
}

/* ── Status Dropdown ── */
function StatusDropdown({ current, onSelect, onClose }) {
  return (
    <div className="status-dropdown">
      {STATUS_OPTIONS.map((opt) => (
        <div
          key={opt}
          className={`dropdown-item ${opt === current ? "selected" : ""}`}
          onClick={() => { onSelect(opt); onClose(); }}
        >
          {opt}
          {opt === current && <IconCheck />}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════ */
export default function TransaksiPage() {
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [data, setData]             = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null); // id transaksi

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      const json = await res.json();
      const rawData = Array.isArray(json) ? json : (json.data || []);
      
      const mapped = rawData.map((tx) => {
        let statusStr = "Dipinjam";
        if (tx.status === "RETURNED" || tx.status === "Selesai" || tx.status === "KEMBALI") statusStr = "Selesai";
        if (tx.status === "OVERDUE" || tx.status === "Terlambat") statusStr = "Terlambat";
        if (tx.status === "menunggu" || tx.status === "Menunggu") statusStr = "Menunggu";
        if (tx.status === "tidak_dikembalikan" || tx.status === "Tidak Dikembalikan") statusStr = "Tidak Dikembalikan";
        
        return {
          id: tx.id ? `#TRX-${tx.id}` : `#TRX-${Math.floor(Math.random() * 10000)}`,
          realId: tx.id,
          anggota: tx.nama_anggota || tx.user_name || tx.user?.name || tx.anggota || tx.nama_peminjam || `User ${tx.user_id || "-"}`,
          buku: tx.judul_buku || tx.title || tx.judul || tx.buku || tx.judul_buku || `Buku ${tx.book_id || "-"}`,
          tanggal: new Date(tx.created_at || tx.tanggal_pinjam || new Date()).toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric"
          }),
          status: statusStr
        };
      });
      
      mapped.sort((a, b) => (b.realId || 0) - (a.realId || 0));
      setData(mapped);
    } catch (err) {
      console.error("Gagal fetch transaksi:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function handleVerifikasi(realId, action) {
    try {
      const token = localStorage.getItem("token");
      const backendStatus = action === "Selesai" ? "RETURNED" : "tidak_dikembalikan";
      const res = await fetch(`${API_BASE}/transactions/${realId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: backendStatus })
      });
      if (res.ok) {
        await fetchTransactions();
      }
    } catch (err) {
      console.error("Gagal verifikasi transaksi:", err);
    }
  }

  /* Filter berdasarkan search */
  const filtered = data.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.anggota.toLowerCase().includes(search.toLowerCase()) ||
    t.buku.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* Stat counts */
  const totalTrx    = data.length;
  const dipinjam    = data.filter((t) => t.status === "Dipinjam").length;
  const kembaliHariIni = data.filter((t) => t.status === "Selesai").length;

  async function handleStatusChange(id, newStatus) {
    const target = data.find(t => t.id === id);
    if (!target) return;

    setData((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      const token = localStorage.getItem("token");
      let backendStatus = newStatus;
      if (newStatus === "Selesai") backendStatus = "RETURNED";
      else if (newStatus === "Dipinjam") backendStatus = "BORROWED";
      else if (newStatus === "Terlambat") backendStatus = "OVERDUE";

      if (target.realId) {
        await fetch(`${API_BASE}/transactions/${target.realId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ status: backendStatus })
        });
      }
    } catch (err) {
      console.error("Gagal update status transaksi:", err);
    }
  }

  function toggleDropdown(id) {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }

  const NAV_ITEMS = ["Dashboard", "Buku", "Anggota", "Transaksi"];

  return (
    <div className="transaksi-page" onClick={() => setOpenDropdown(null)}>

      {/* ── Navbar ── */}
        <AdminNavbar active="Transaksi" />

      {/* ── Main ── */}
      <main className="transaksi-main">

        {/* Header */}
        <div className="page-header">
          <h1>Manajemen Transaksi</h1>
          <p>Kelola dan pantau seluruh aktivitas buku perpustakaan dengan efisien.</p>
        </div>

        {/* Stat Cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-icon"><IconReceipt /></div>
            <div className="stat-info">
              <label>Total Transaksi</label>
              <strong>{totalTrx}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconBook /></div>
            <div className="stat-info">
              <label>Peminjaman Aktif</label>
              <strong>{dipinjam}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconCalendar /></div>
            <div className="stat-info">
              <label>Pengembalian Hari Ini</label>
              <strong>{kembaliHariIni}</strong>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <IconSearch />
            <input
              className="search-input"
              placeholder="Cari ID, Anggota, atau Judul..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="filter-btn">
            <IconFilter /> Filter
          </button>
        </div>

        {/* Table Card */}
        <div className="table-card" onClick={(e) => e.stopPropagation()}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Pinjam</th>
                <th>Nama Anggota</th>
                <th>Judul Buku</th>
                <th>Tanggal Transaksi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? paged.map((trx) => (
                <tr key={trx.id}>
                  <td><span className="trx-id">{trx.id}</span></td>
                  <td><span className="member-name">{trx.anggota}</span></td>
                  <td><span className="book-title-cell">{trx.buku}</span></td>
                  <td><span className="date-cell">{trx.tanggal}</span></td>
                  <td>
                    {trx.status === "Menunggu" ? (
                      <div className="aksi-verifikasi-wrap" style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-verif-selesai"
                          style={{
                            background: "#2ecc71",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "12px",
                            transition: "background 0.2s"
                          }}
                          onClick={() => handleVerifikasi(trx.realId, "Selesai")}
                        >
                          Selesai
                        </button>
                        <button
                          className="btn-verif-tolak"
                          style={{
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "12px",
                            transition: "background 0.2s"
                          }}
                          onClick={() => handleVerifikasi(trx.realId, "Buku Tidak Dikembalikan")}
                        >
                          Buku Tidak Dikembalikan
                        </button>
                      </div>
                    ) : (
                      <div
                        className="status-dropdown-wrap"
                        onClick={(e) => { e.stopPropagation(); toggleDropdown(trx.id); }}
                      >
                        <StatusBtn status={trx.status} onClick={() => {}} />
                        {openDropdown === trx.id && (
                          <StatusDropdown
                            current={trx.status}
                            onSelect={(s) => handleStatusChange(trx.id, s)}
                            onClose={() => setOpenDropdown(null)}
                          />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer Pagination */}
          <div className="table-footer">
            <span className="table-info">
              Menampilkan {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} data
            </span>
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <IconChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`page-btn ${page === n ? "active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <IconChevronRight />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}