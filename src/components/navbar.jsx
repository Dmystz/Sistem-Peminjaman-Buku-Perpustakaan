import { Link, useLocation, useNavigate } from "react-router-dom";
import "./navbar.css";

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const navLinks = [
  { label: "Katalog", href: "/katalog" },
  { label: "Koleksi Buku", href: "/koleksi-buku" },
  { label: "Pinjaman Saya", href: "/pinjaman" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/">
          <span className="brand-dips">Dips</span>
          <span className="brand-book">Book</span>
        </Link>
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                className={`nav-link${
                  location.pathname === link.href ||
                  (link.label === "Koleksi Buku" && location.pathname.startsWith("/buku/") && !location.pathname.includes("/pinjam")) ||
                  (link.label === "Pinjaman Saya" && location.pathname.includes("/pinjam"))
                    ? " nav-link--active"
                    : ""
                }`}
                to={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="navbar-actions">
          <button 
            className={`icon-btn ${location.pathname === "/notifikasi" ? "icon-btn--active" : ""}`} 
            aria-label="Notifikasi" 
            onClick={() => navigate("/notifikasi")}
          >
            <BellIcon />
          </button>
          <button className="icon-btn icon-btn--filled" aria-label="Profil">
            <UserIcon />
          </button>
        </div>
      </div>
    </nav>
  );
}