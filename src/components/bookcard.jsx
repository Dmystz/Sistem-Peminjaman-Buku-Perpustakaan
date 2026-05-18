import { useNavigate } from "react-router-dom";
import "./bookcard.css";

export default function BookCard({ id, cover, genre, title, author, status }) {
  const isTersedia = status === "tersedia";
  const navigate = useNavigate();

  return (
    <div className="book-card">
      <div className="book-card-image-wrap" onClick={() => navigate(`/buku/${id}`)} style={{ cursor: 'pointer' }}>
        <img src={cover} alt={title} className="book-cover" />
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
        <button
          className="book-btn book-btn--detail"
          onClick={() => navigate(`/buku/${id}`)}
        >
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