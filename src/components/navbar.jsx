import { Link, useLocation, useNavigate } from "react-router-dom";
import "./navbar.css";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const navLinks = [
  { label: "Katalog",      href: "/katalog" },
  { label: "Koleksi Buku", href: "/koleksi-buku" },
  { label: "Pinjaman Saya",href: "/pinjaman" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(link) {
    if (location.pathname === link.href) return true;
    if (link.label === "Koleksi Buku" && location.pathname.startsWith("/buku/") && !location.pathname.includes("/pinjam")) return true;
    if (link.label === "Pinjaman Saya" && location.pathname.includes("/pinjam")) return true;
    return false;
  }

  return (
    <nav className="navbar">
      <Link className="navbar-brand" to="/">
        Dips<span>Book</span>
      </Link>

      <ul className="navbar-links">
        {navLinks.map((link) => (
          <li key={link.label}>
            <Link
              className={`nav-link${isActive(link) ? " nav-link--active" : ""}`}
              to={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <button
          className="icon-btn"
          aria-label="Notifikasi"
          onClick={() => navigate("/notifikasi")}
        >
          <BellIcon />
        </button>
        <button className="icon-btn" aria-label="Profil">
          <UserIcon />
        </button>
      </div>
    </nav>
  );
}