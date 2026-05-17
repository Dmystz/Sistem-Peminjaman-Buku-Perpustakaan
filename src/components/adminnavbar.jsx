import { useState } from "react";
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

const ROUTES = {
  Dashboard: "/admin/dashboard",
  Anggota:   "/admin/anggota",
  Buku:      "/admin/buku",
  Transaksi: "/admin/transaksi",
};

export default function AdminNavbar({ active }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(active || "Dashboard");

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
        <button className="admin-icon-btn" aria-label="Profil">
          <UserIcon />
        </button>
      </div>
    </nav>
  );
}