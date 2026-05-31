import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import AdminNavbar from "../components/adminnavbar";
import "./notifikasi.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Icons
const IconBellActive = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e85d8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconBellInactive = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

// ─── ILUSTRASI SVG KOSONG ───────────────────────────────────────────────────────────
const IllustrasiKosong = () => (
  <div className="ilustrasi-wrap">
    {/* Card utama */}
    <div className="ilustrasi-card ilustrasi-card--main">
      <div className="ilustrasi-bell-circle">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0507a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      </div>
    </div>

    {/* Card kecil kanan atas */}
    <div className="ilustrasi-card ilustrasi-card--topright">
      <div className="ilustrasi-dot" />
    </div>

    {/* Card kecil bawah kiri */}
    <div className="ilustrasi-card ilustrasi-card--bottomleft">
      <div className="ilustrasi-line" />
      <div className="ilustrasi-icon-small">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0507a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
    </div>

    {/* Lingkaran dekorasi blur */}
    <div className="ilustrasi-blob" />
  </div>
);

// ─── KOMPONEN UTAMA ──────────────────────────────────────────────────────────
export default function Notifikasi() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setIsAdmin(u.role === "admin");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/books/notifications`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, readAt) => {
    if (readAt) return; // Sudah dibaca

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/books/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
      }
    } catch (err) {
      console.error("Gagal menandai dibaca:", err);
    }
  };

  return (
    <div className="home-page">
      {isAdmin ? <AdminNavbar active="" /> : <Navbar />}

      <main className="notif-page-content" style={{ padding: "40px 24px", maxWidth: "800px", margin: "0 auto", width: "100%", minHeight: "calc(100vh - 64px)" }}>
        <h1 className="notif-header-title" style={{ fontFamily: "Nunito, sans-serif", fontSize: "28px", fontWeight: "800", color: "#333", marginBottom: "8px" }}>
          Pemberitahuan
        </h1>
        <p className="notif-header-sub" style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", color: "#666", marginBottom: "32px" }}>
          Kelola pesan notifikasi aktivitas peminjaman buku perpustakaan Anda.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "15px" }}>
            Memuat pemberitahuan...
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-container" style={{ marginTop: "40px" }}>
            <IllustrasiKosong />
            <h2 className="notif-title">Belum Ada Notifikasi</h2>
            <p className="notif-subtitle">
              Semua pemberitahuan tentang aktivitas peminjaman dan
              <br />pengembalian buku Anda akan muncul di sini.
            </p>
            <button className="notif-btn" onClick={() => navigate(isAdmin ? "/admin/dashboard" : "/")}>
              {isAdmin ? "Ke Dashboard Admin" : "Jelajahi Katalog"}
            </button>
          </div>
        ) : (
          <div className="notif-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map((notif) => {
              const isUnread = notif.read_at === null;
              const formattedDate = new Date(notif.created_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={notif.id}
                  className={`notif-item ${isUnread ? "notif-item--unread" : "notif-item--read"}`}
                  onClick={() => handleMarkAsRead(notif.id, notif.read_at)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    background: isUnread ? "#fff5f7" : "#ffffff",
                    border: isUnread ? "1px solid #fce3eb" : "1px solid #eef2f5",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    cursor: isUnread ? "pointer" : "default",
                    transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
                    position: "relative"
                  }}
                >
                  <div className="notif-icon-wrap" style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: isUnread ? "#fcebf1" : "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {isUnread ? <IconBellActive /> : <IconBellInactive />}
                  </div>

                  <div className="notif-details" style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "14.5px",
                      color: isUnread ? "#2c2c2c" : "#666",
                      fontWeight: isUnread ? "600" : "400",
                      lineHeight: "1.5"
                    }}>
                      {notif.message}
                    </p>
                    <span style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "11.5px",
                      color: "#999",
                      marginTop: "6px",
                      display: "block"
                    }}>
                      {formattedDate}
                    </span>
                  </div>

                  {isUnread && (
                    <span className="unread-dot" style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#e85d8a",
                      position: "absolute",
                      top: "20px",
                      right: "20px"
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
