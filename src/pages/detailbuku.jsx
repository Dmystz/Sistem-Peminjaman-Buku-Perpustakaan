import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import "./detailbuku.css";


const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

// Data buku — idealnya fetch dari API berdasarkan id
const BUKU_LIST = [
  {
    id: 1,
    cover: "/cover_filosofi.png",
    genre: "Psikologi",
    judul: "Seni Ketenangan Jiwa",
    penulis: "Aris Setiawan",
    kategori: "Psikologi",
    status: "tersedia",
    sinopsis: "Dalam hiruk-pikuk dunia modern, menemukan ketenangan seringkali terasa seperti mencari jarum di tumpukan jerami. Buku ini mengajak Anda untuk menjelajahi filosofi ketenangan dari berbagai sudut pandang praktis yang dapat diterapkan dalam kehidupan sehari-hari. Penulis memandu pembaca melalui latihan-latihan meditatif yang ringan, manajemen waktu yang berfokus pada kesejahteraan mental, dan cara membangun lingkungan yang mendukung produktivitas tanpa stres. Sebuah panduan esensial bagi siapa saja yang mendambakan harmoni antara ambisi dan kedamaian batin di era digital.",
    penerbit: "Gramedia Indonesia",
    halaman: "324 Hlm",
    bahasa: "Indonesia",
    tahun: "2023",
  },
  {
    id: 2,
    cover: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
    genre: "Sains",
    judul: "Alam Semesta & Kita",
    penulis: "Dr. Sarah Fitri",
    kategori: "Sains",
    status: "dipinjam",
    sinopsis: "Menjelajahi misteri alam semesta dari sudut pandang ilmiah yang mudah dipahami.",
    penerbit: "Erlangga",
    halaman: "356 Hlm",
    bahasa: "Indonesia",
    tahun: "2022",
  },
  {
    id: 3,
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    genre: "Anak",
    judul: "Petualangan Si Kecil",
    penulis: "Bunda Maya",
    kategori: "Anak",
    status: "tersedia",
    sinopsis: "Kisah petualangan seru si kecil yang mengajarkan nilai keberanian dan persahabatan.",
    penerbit: "Mizan",
    halaman: "120 Hlm",
    bahasa: "Indonesia",
    tahun: "2023",
  },
  {
    id: 4,
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    genre: "Psikologi",
    judul: "Ruang Tenang",
    penulis: "Rania Putri",
    kategori: "Psikologi",
    status: "tersedia",
    sinopsis: "Panduan praktis menciptakan ruang ketenangan batin di era penuh distraksi.",
    penerbit: "Gramedia Indonesia",
    halaman: "240 Hlm",
    bahasa: "Indonesia",
    tahun: "2024",
  },
  {
    id: 5,
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
    genre: "Filosofi",
    judul: "Mencari Makna Hidup",
    penulis: "Viktor Frankl",
    kategori: "Filosofi",
    status: "tersedia",
    sinopsis: "Eksplorasi mendalam tentang makna hidup dari perspektif filsafat dan psikologi.",
    penerbit: "Noura Books",
    halaman: "198 Hlm",
    bahasa: "Indonesia",
    tahun: "2021",
  },
  {
    id: 6,
    cover: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
    genre: "Teknologi",
    judul: "Masa Depan AI",
    penulis: "Budi Santoso",
    kategori: "Teknologi",
    status: "dipinjam",
    sinopsis: "Gambaran komprehensif tentang bagaimana kecerdasan buatan akan mengubah dunia.",
    penerbit: "Elex Media",
    halaman: "312 Hlm",
    bahasa: "Indonesia",
    tahun: "2024",
  },
  {
    id: 7,
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    genre: "Sejarah",
    judul: "Nusantara Berjaya",
    penulis: "Prof. Ahmad",
    kategori: "Sejarah",
    status: "tersedia",
    sinopsis: "Perjalanan sejarah Nusantara dari masa kejayaan kerajaan hingga kemerdekaan.",
    penerbit: "Balai Pustaka",
    halaman: "450 Hlm",
    bahasa: "Indonesia",
    tahun: "2022",
  },
  {
    id: 8,
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    genre: "Bisnis",
    judul: "Strategi Digital",
    penulis: "Linda Sari",
    kategori: "Bisnis",
    status: "tersedia",
    sinopsis: "Strategi bisnis digital yang relevan untuk memenangkan persaingan di era modern.",
    penerbit: "Gramedia Indonesia",
    halaman: "275 Hlm",
    bahasa: "Indonesia",
    tahun: "2023",
  },
];

export default function DetailBuku() {
  const navigate = useNavigate();
  const { id } = useParams();

  const buku = BUKU_LIST.find((b) => b.id === Number(id));
  const isTersedia = buku?.status === "tersedia";

  if (!buku) {
    return (
      <main className="detail-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft /> Kembali
        </button>
        <p style={{ color: "var(--gray-400)", marginTop: 40 }}>Buku tidak ditemukan.</p>
      </main>
    );
  }

  return (
    <div className="home-page">
      <Navbar />
      <main className="detail-page">
        <div className="detail-content">
          <div className="detail-cover-col">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <span>Detail Buku</span>
            </button>
            <div className="detail-cover-container">
              <div className="detail-cover-plain"></div>
            </div>
          <span className={`detail-status-badge detail-status-badge--${isTersedia ? "tersedia" : "dipinjam"}`}>
            <CheckCircle />
            {isTersedia ? "Tersedia" : "Dipinjam"}
          </span>
        </div>

        <div className="detail-info-col">
          <div className="detail-header-inline">
            <h1 className="detail-judul">{buku.judul}</h1>
            <span className="detail-penulis">Oleh {buku.penulis}</span>
          </div>
          <div className="detail-meta">
            <span className="detail-kategori">Kategori : {buku.kategori}</span>
          </div>

          <button 
            className="pinjam-btn" 
            disabled={!isTersedia}
            onClick={() => navigate(`/buku/${buku.id}/pinjam`)}
          >
            <BookIcon />
            {isTersedia ? "Pinjam Sekarang" : "Sedang Dipinjam"}
          </button>

          <div className="sinopsis-card">
            <h2 className="sinopsis-title">Sinopsis</h2>
            <p className="sinopsis-text">{buku.sinopsis}</p>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">PENERBIT</span>
              <span className="info-value">{buku.penerbit}</span>
            </div>
            <div className="info-item">
              <span className="info-label">HALAMAN</span>
              <span className="info-value">{buku.halaman}</span>
            </div>
            <div className="info-item">
              <span className="info-label">BAHASA</span>
              <span className="info-value">{buku.bahasa}</span>
            </div>
            <div className="info-item">
              <span className="info-label">TAHUN</span>
              <span className="info-value">{buku.tahun}</span>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}