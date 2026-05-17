import { useState } from "react";
import "./adminbuku.css";

const initialBooks = [
  {
    id: "BK-001",
    title: "Ketenangan di Tengah Badai",
    author: "Hamdan Syakir",
    cover: null,
    stok: 12,
    total: 15,
    status: "TERSEDIA",
  },
  {
    id: "BK-002",
    title: "Algoritma Harapan",
    author: "Dr. Aris Setiawan",
    cover: null,
    stok: 8,
    total: 10,
    status: "HAMPIR HABIS",
  },
  {
    id: "BK-003",
    title: "Ruang Kenangan",
    author: "Sari Wijaya",
    cover: null,
    stok: 0,
    total: 10,
    status: "DIPINJAM SEMUA",
  },
  {
    id: "BK-004",
    title: "Bioetika Masa Depan",
    author: "Prof. M. Dahlan",
    cover: null,
    stok: 5,
    total: 25,
    status: "TERSEDIA",
  },
];

const CATEGORIES = ["Semua Kategori", "Fiksi", "Non-Fiksi", "Sains", "Teknologi", "Sejarah", "Biografi"];

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

const BookCoverPlaceholder = ({ id }) => {
  const colors = {
    "BK-001": "#e8c4a0",
    "BK-002": "#2c2c2c",
    "BK-003": "#d4d0c8",
    "BK-004": "#1a3a5c",
  };
  const bg = colors[id] || "#ccc";
  return (
    <div className="book-cover-placeholder" style={{ background: bg }}>
      <div className="book-cover-lines">
        <div /><div /><div />
      </div>
    </div>
  );
};

// ============ MODAL HAPUS ============
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
          Apakah Anda yakin ingin menghapus buku <strong>'{book?.title}'</strong> dari koleksi? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait buku ini.
        </p>
        <div className="modal-actions">
          <button className="btn-batal" onClick={onCancel}>Batal</button>
          <button className="btn-hapus" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ============ MODAL TAMBAH ============
function TambahBukuModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    id: "",
    category: "",
    title: "",
    author: "",
    stok: 0,
    desc: "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!form.title || !form.author) return;
    setSaved(true);
  };

  const handleKembali = () => {
    onSave(form);
    onClose();
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
            <button className="btn-hapus" onClick={handleKembali}>Kembali ke Data Buku</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tambah-page-overlay">
      <div className="tambah-navbar">
        <div className="tambah-logo">Dips<span>Book</span></div>
        <nav className="tambah-nav">
          <a href="#">Dashboard</a>
          <a href="#" className="active">Buku</a>
          <a href="#">Anggota</a>
          <a href="#">Transaksi</a>
        </nav>
        <div className="tambah-nav-icons">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>

      <div className="tambah-content">
        <h1 className="tambah-title">Tambah Buku Baru</h1>
        <p className="tambah-sub">Lengkapi informasi di bawah ini untuk menambahkan koleksi ke dalam perpustakaan.</p>

        <div className="tambah-form-card">
          <div className="tambah-form-left">
            <div className="sampul-label">Sampul Buku</div>
            <div className="sampul-upload">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4687a" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p>Klik atau seret file untuk unggah sampul</p>
              <span>format JPG/PNG, Maks. 2MB</span>
            </div>
          </div>

          <div className="tambah-form-right">
            <div className="form-row-2">
              <div className="form-group">
                <label>ID Buku</label>
                <input placeholder="Contoh: BUK-001" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Pilih Kategori</option>
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Judul Buku</label>
              <input placeholder="Masukkan judul lengkap buku" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Penulis</label>
                <input placeholder="Nama penulis" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Jumlah Stok</label>
                <input type="number" min="0" value={form.stok} onChange={e => setForm({ ...form, stok: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="form-group">
              <label>Deskripsi Singkat</label>
              <textarea placeholder="Berikan ringkasan isi buku..." rows={4} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
            </div>

            <div className="tambah-form-actions">
              <button className="btn-batal" onClick={onClose}>Batal</button>
              <button className="btn-simpan" onClick={handleSave}>Simpan Buku</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function AdminBuku() {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showTambah, setShowTambah] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalBuku = 1284;
  const sedangDipinjam = 452;
  const booksPerPage = 4;
  const totalPages = 12;

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    setBooks(prev => prev.filter(b => b.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleSaveBuku = (form) => {
    if (!form.title) return;
    const newId = `BK-00${books.length + 1}`;
    setBooks(prev => [...prev, {
      id: form.id || newId,
      title: form.title,
      author: form.author,
      cover: null,
      stok: form.stok,
      total: form.stok,
      status: form.stok > 0 ? "TERSEDIA" : "DIPINJAM SEMUA",
    }]);
  };

  const getStatusClass = (status) => {
    if (status === "TERSEDIA") return "badge badge--tersedia";
    if (status === "HAMPIR HABIS") return "badge badge--hampir";
    if (status === "DIPINJAM SEMUA") return "badge badge--dipinjam";
    return "badge";
  };

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", totalPages);
  }

  if (showTambah) {
    return <TambahBukuModal onClose={() => setShowTambah(false)} onSave={handleSaveBuku} />;
  }

  return (
    <div className="ab-root">
      {/* NAVBAR */}
      <nav className="ab-navbar">
        <div className="ab-logo">Dips<span>Book</span></div>
        <ul className="ab-nav-links">
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Anggota</a></li>
          <li><a href="#" className="ab-nav-active">Buku</a></li>
          <li><a href="#">Transaksi</a></li>
        </ul>
        <div className="ab-nav-icons">
          <button className="ab-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <button className="ab-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </nav>

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
              <div className="stat-value">{totalBuku.toLocaleString("id-ID")} <span>Buku</span></div>
              <div className="stat-note">↗ 24 buku baru ditambahkan minggu ini</div>
            </div>
            <div className="stat-icon">
              <BookIcon />
            </div>
          </div>
          <div className="stat-card stat-card--white">
            <div className="stat-info">
              <div className="stat-label">SEDANG DIPINJAM</div>
              <div className="stat-value">{sedangDipinjam}</div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${(sedangDipinjam / totalBuku) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="ab-toolbar">
          <div className="ab-search-wrap">
            <SearchIcon />
            <input
              className="ab-search"
              placeholder="Cari judul, penulis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
          <table className="ab-table">
            <thead>
              <tr>
                <th>ID BUKU</th>
                <th>INFORMASI BUKU</th>
                <th>STOK</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr key={book.id}>
                  <td className="td-id">{book.id}</td>
                  <td className="td-info">
                    <BookCoverPlaceholder id={book.id} />
                    <div className="td-text">
                      <div className="td-title">{book.title}</div>
                      <div className="td-author">{book.author}</div>
                    </div>
                  </td>
                  <td className="td-stok">
                    <span className="stok-val">{String(book.stok).padStart(2, "0")}</span>
                    <span className="stok-total"> /{book.total}</span>
                  </td>
                  <td>
                    <span className={getStatusClass(book.status)}>{book.status}</span>
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

          {/* PAGINATION */}
          <div className="ab-pagination">
            <span className="pagination-info">
              Menampilkan <strong>{filtered.length}</strong> dari <strong>{books.length}</strong> buku
            </span>
            <div className="pagination-controls">
              <button className="pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronIcon dir="left" />
              </button>
              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="pg-dots">...</span>
                ) : (
                  <button
                    key={p}
                    className={`pg-btn ${currentPage === p ? "pg-btn--active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
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
        <DeleteModal
          book={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}