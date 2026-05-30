import { useState, useEffect, useRef } from "react";
import "./adminbuku.css";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

const CATEGORIES = ["Semua Kategori", "Fiksi", "Non-Fiksi", "Sains", "Teknologi", "Sejarah", "Biografi"];

// ─── Helper: hitung status dari stock ─────────────────────────────────────
function getStatus(stock) {
  if (stock <= 0) return "DIPINJAM SEMUA";
  if (stock <= 5) return "HAMPIR HABIS";
  return "TERSEDIA";
}

// ─── Icons ─────────────────────────────────────────────────────────────────
const BookIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="8" width="48" height="48" rx="4" fill="currentColor" opacity="0.15" />
    <path d="M14 16h20v32H14V16zM34 16h16v32H34V16z" fill="currentColor" opacity="0.3" />
    <path d="M14 16h20v2H14zM34 16h16v2H34z" fill="currentColor" opacity="0.5" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = ({ dir = "right" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Cover: tampilkan gambar asli atau placeholder warna ───────────────────
const BookCoverDisplay = ({ book }) => {
  if (book.cover_url) {
    return (
      <img
        src={`${BACKEND_URL}${book.cover_url}`}
        alt={book.title}
        className="book-cover-img"
        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
      />
    );
  }
  const colors = ["#e8c4a0", "#2c2c2c", "#d4d0c8", "#1a3a5c", "#7c3aed", "#b91c1c"];
  const bg = colors[book.id % colors.length] || "#ccc";
  return (
    <div className="book-cover-placeholder" style={{ background: bg }}>
      <div className="book-cover-lines"><div /><div /><div /></div>
    </div>
  );
};

// ─── Modal Hapus ───────────────────────────────────────────────────────────
function DeleteModal({ book, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-icon modal-icon--delete">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <h2 className="modal-title">Hapus Koleksi Buku?</h2>
        <p className="modal-desc">
          Apakah Anda yakin ingin menghapus buku <strong>'{book?.title}'</strong> dari koleksi? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="modal-actions">
          <button className="btn-batal" onClick={onCancel}>Batal</button>
          <button className="btn-hapus" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Tambah Buku ─────────────────────────────────────────────────────
function TambahBukuModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ category: "", title: "", author: "", stok: 0, desc: "" });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Preview gambar sebelum upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title || !form.author) {
      setError("Judul dan penulis wajib diisi!");
      return;
    }
    setLoading(true);
    setError("");

    // Kirim sebagai FormData (bukan JSON) karena ada file
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("stock", parseInt(form.stok, 10) || 0);
    if (coverFile) formData.append("cover", coverFile);

    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: "POST",
        body: formData, // JANGAN set Content-Type, browser otomatis set multipart
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setSaved(true);
      onSaved(); // refresh daftar buku di parent
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={e => e.stopPropagation()}>
          <div className="modal-icon modal-icon--success">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h2 className="modal-title">Data Buku Berhasil<br />Disimpan ke Katalog.</h2>
          <div className="modal-actions" style={{ justifyContent: "center" }}>
            <button className="btn-hapus" onClick={onClose}>Kembali ke Data Buku</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tambah-page-overlay">
      <AdminNavbar active="Buku" />
      <div className="tambah-content">
        <h1 className="tambah-title">Tambah Buku Baru</h1>
        <p className="tambah-sub">Lengkapi informasi di bawah ini untuk menambahkan koleksi ke dalam perpustakaan.</p>

        <div className="tambah-form-card">
          {/* ── Kolom Kiri: Upload Cover ── */}
          <div className="tambah-form-left">
            <div className="sampul-label">Sampul Buku</div>

            {/* Area upload — klik untuk pilih file */}
            <div
              className="sampul-upload"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer", position: "relative", overflow: "hidden" }}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Preview cover"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                />
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4687a" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p>Klik untuk unggah sampul</p>
                  <span>JPG / PNG / WEBP · Maks. 2MB</span>
                </>
              )}
            </div>

            {/* Input file tersembunyi */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
              id="cover-file-input"
            />

            {coverPreview && (
              <button
                style={{ marginTop: 8, fontSize: 12, color: "#c0392b", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => { setCoverFile(null); setCoverPreview(null); }}
              >
                × Hapus gambar
              </button>
            )}
          </div>

          {/* ── Kolom Kanan: Form Fields ── */}
          <div className="tambah-form-right">
            <div className="form-row-2">
              <div className="form-group">
                <label>Kategori</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Pilih Kategori</option>
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Jumlah Stok</label>
                <input type="number" min="0" value={form.stok} onChange={e => setForm({ ...form, stok: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Judul Buku <span style={{ color: "#c0392b" }}>*</span></label>
              <input placeholder="Masukkan judul lengkap buku" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Penulis <span style={{ color: "#c0392b" }}>*</span></label>
              <input placeholder="Nama penulis" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Deskripsi Singkat</label>
              <textarea placeholder="Berikan ringkasan isi buku..." rows={4} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
            </div>

            {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 8 }}>{error}</p>}

            <div className="tambah-form-actions">
              <button className="btn-batal" onClick={onClose} disabled={loading}>Batal</button>
              <button className="btn-simpan" onClick={handleSave} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Buku"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Utama AdminBuku ───────────────────────────────────────────────
export default function AdminBuku() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showTambah, setShowTambah] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;

  // Fetch buku dari API
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/books`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal fetch buku:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / booksPerPage));
  const paginated = filtered.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);

  // Delete buku via API
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${API_BASE}/books/${deleteTarget.id}`, { method: "DELETE" });
      setBooks(prev => prev.filter(b => b.id !== deleteTarget.id));
    } catch (err) {
      console.error("Gagal hapus:", err);
    }
    setDeleteTarget(null);
  };

  const getStatusClass = (stock) => {
    if (stock <= 0) return "badge badge--dipinjam";
    if (stock <= 5) return "badge badge--hampir";
    return "badge badge--tersedia";
  };

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", totalPages);
  }

  if (showTambah) {
    return (
      <TambahBukuModal
        onClose={() => setShowTambah(false)}
        onSaved={() => { fetchBooks(); setShowTambah(false); }}
      />
    );
  }

  return (
    <div className="ab-root">
      <AdminNavbar active="Buku" />

      <main className="ab-main">
        {/* HEADER */}
        <div className="ab-header">
          <div>
            <h1 className="ab-page-title">Manajemen Data Buku</h1>
            <p className="ab-page-sub">Kelola koleksi pustaka panel kontrol terpadu yang modern dan intuitif.</p>
          </div>
          <button className="btn-tambah" onClick={() => setShowTambah(true)}>
            <PlusIcon /> Tambah Buku
          </button>
        </div>

        {/* STATS */}
        <div className="ab-stats">
          <div className="stat-card stat-card--pink">
            <div className="stat-info">
              <div className="stat-label">TOTAL KOLEKSI AKTIF</div>
              <div className="stat-value">{books.length.toLocaleString("id-ID")} <span>Buku</span></div>
              <div className="stat-note">↗ Data dari database</div>
            </div>
            <div className="stat-icon"><BookIcon /></div>
          </div>
          <div className="stat-card stat-card--white">
            <div className="stat-info">
              <div className="stat-label">STOK HABIS / DIPINJAM</div>
              <div className="stat-value">{books.filter(b => b.stock <= 0).length}</div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: books.length ? `${(books.filter(b => b.stock <= 0).length / books.length) * 100}%` : "0%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="ab-toolbar">
          <div className="ab-search-wrap">
            <SearchIcon />
            <input className="ab-search" placeholder="Cari judul, penulis..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="ab-select-wrap">
            <FilterIcon />
            <select className="ab-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="ab-table-card">
          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>Memuat data buku...</div>
          ) : (
            <table className="ab-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>INFORMASI BUKU</th>
                  <th>STOK</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#888" }}>Tidak ada buku ditemukan.</td></tr>
                ) : paginated.map((book) => (
                  <tr key={book.id}>
                    <td className="td-id">#{book.id}</td>
                    <td className="td-info">
                      {/* Cover: gambar asli atau placeholder */}
                      <div className="book-cover-cell">
                        {book.cover_url ? (
                          <img
                            src={`${BACKEND_URL}${book.cover_url}`}
                            alt={book.title}
                            className="book-cover-img"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="book-cover-placeholder" style={{ background: ["#e8c4a0","#2c4c6c","#d4d0c8","#1a3a5c","#7c3aed","#b45309"][book.id % 6] }}>
                            <div className="book-cover-lines"><div /><div /><div /></div>
                          </div>
                        )}
                      </div>
                      <div className="td-text">
                        <div className="td-title">{book.title}</div>
                        <div className="td-author">{book.author}</div>
                      </div>
                    </td>
                    <td className="td-stok">
                      <span className="stok-val">{book.stock ?? 0}</span>
                    </td>
                    <td>
                      <span className={getStatusClass(book.stock ?? 0)}>{getStatus(book.stock ?? 0)}</span>
                    </td>
                    <td>
                      <button className="btn-trash" onClick={() => setDeleteTarget(book)}>
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          <div className="ab-pagination">
            <span className="pagination-info">
              Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> buku
            </span>
            <div className="pagination-controls">
              <button className="pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronIcon dir="left" />
              </button>
              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="pg-dots">...</span>
                ) : (
                  <button key={p} className={`pg-btn ${currentPage === p ? "pg-btn--active" : ""}`} onClick={() => setCurrentPage(p)}>
                    {p}
                  </button>
                )
              )}
              <button className="pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronIcon dir="right" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL HAPUS */}
      {deleteTarget && (
        <DeleteModal book={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}