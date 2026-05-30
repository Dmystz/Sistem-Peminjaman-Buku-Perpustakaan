import { useState, useEffect } from "react";
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

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
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
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState({ name: "Pengguna", username: "-", role: "Mahasiswa" });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Gagal membaca data user dari storage", e);
    }
  }, []);

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
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            aria-label="Profil"
            onClick={() => setShowProfile(!showProfile)}
          >
            <UserIcon />
          </button>

          {showProfile && (
            <div className="profile-popup">
              <div className="profile-popup-top">
                <div className="profile-popup-avatar">
                  <UserIcon />
                </div>
                <h4 className="profile-popup-name">{user.name || user.username || "Pengguna"}</h4>
                <p className="profile-popup-id">{user.username || "-"}</p>
                <span className="profile-popup-role">
                  {user.role === "admin" ? "Administrator" : "Mahasiswa"}
                </span>
              </div>
              <div className="profile-popup-bottom">
                <button className="profile-popup-logout" onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login");
                }}>
                  <LogoutIcon />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}