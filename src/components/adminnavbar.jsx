import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

const NAV_LINKS = ["Dashboard", "Anggota", "Buku", "Transaksi"];

const BellIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ROUTES = {
  Dashboard: "/admin/dashboard",
  Anggota:   "/admin/anggota",
  Buku:      "/admin/buku",
  Transaksi: "/admin/transaksi",
};

export default function AdminNavbar({ active }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(active || "Dashboard");
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState({ name: "Admin", username: "-", role: "admin" });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Gagal membaca data admin dari storage", e);
    }
  }, []);

  function handleNav(link) {
    setActiveNav(link);
    navigate(ROUTES[link]);
  }

  return (
    <nav className="admin-navbar">
      {/* Logo */}
      <div className="admin-navbar-brand" onClick={() => navigate("/admin/dashboard")} style={{ cursor: "pointer" }}>
        Dips<span>Book</span>
      </div>

      {/* Nav links */}
      <ul className="admin-navbar-links">
        {NAV_LINKS.map((link) => (
          <li
            key={link}
            className={`admin-nav-item ${activeNav === link ? "active" : ""}`}
            onClick={() => handleNav(link)}
          >
            {link}
            {activeNav === link && <span className="admin-nav-underline" />}
          </li>
        ))}
      </ul>

      {/* Icons */}
      <div className="admin-navbar-icons">
        <button className="admin-icon-btn" aria-label="Notifikasi">
          <BellIcon />
        </button>
        <div style={{ position: 'relative' }}>
          <button 
            className="admin-icon-btn" 
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
                <h4 className="profile-popup-name">{user.name || user.username || "Admin"}</h4>
                <p className="profile-popup-id">{user.username || "-"}</p>
                <span className="profile-popup-role">
                  {user.role === "admin" ? "Admin Perpustakaan" : "Petugas"}
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