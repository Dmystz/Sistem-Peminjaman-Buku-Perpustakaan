import { Link } from "react-router-dom";
import "./bookcard.css";

export default function BookCard({ id, cover, genre, title, author, status }) {
  const isTersedia = status === "tersedia";

  return (
    <Link to={`/buku/${id}`} className="book-card-link">
      <div className="book-card">
        <div className="book-card-image-wrap">
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
      </div>
    </Link>
  );
}