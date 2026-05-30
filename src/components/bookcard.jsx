import { useNavigate } from "react-router-dom";
import "./bookcard.css";

// Placeholder SVG jika tidak ada cover
const BookPlaceholder = ({ title }) => {
  const colors = ["#7c3aed","#1e40af","#b91c1c","#047857","#b45309","#be185d"];
  const idx = (title?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className="book-cover-placeholder-card" style={{ background: colors[idx] }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
      <span className="placeholder-title">{title?.slice(0, 15)}</span>
    </div>
  );
};

export default function BookCard({ id, cover, genre, title, author, status }) {
  const isTersedia = status === "tersedia";
  const navigate = useNavigate();

  return (
    <div className="book-card">
      <div className="book-card-image-wrap" onClick={() => navigate(`/buku/${id}`)} style={{ cursor: "pointer" }}>
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="book-cover"
            onError={(e) => {
              // Kalau gambar gagal load, ganti ke placeholder
              e.target.style.display = "none";
              e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
            }}
          />
        ) : null}
        {/* Placeholder selalu ada, tersembunyi jika ada cover */}
        <div style={{ display: cover ? "none" : "flex", width: "100%", height: "100%" }}>
          <BookPlaceholder title={title} />
        </div>
        {!isTersedia && (
          <div className="cover-overlay">
            <span className="cover-label">DIPINJAM</span>
          </div>
        )}
      </div>
      <div className="book-info">
        <span className="book-category">{genre}</span>
        <p className="book-title">{title}</p>
        <p className="book-author">{author}</p>
        <span className={`status-badge ${isTersedia ? "status-tersedia" : "status-dipinjam"}`}>
          {isTersedia ? "Tersedia" : "Dipinjam"}
        </span>
      </div>
      <div className="book-card-actions">
        <button className="book-btn book-btn--detail" onClick={() => navigate(`/buku/${id}`)}>
          Detail Buku
        </button>
        <button
          className={`book-btn book-btn--pinjam${!isTersedia ? " book-btn--disabled" : ""}`}
          disabled={!isTersedia}
          onClick={() => isTersedia && navigate(`/buku/${id}/pinjam`)}
        >
          Pinjam Sekarang
        </button>
      </div>
    </div>
  );
}