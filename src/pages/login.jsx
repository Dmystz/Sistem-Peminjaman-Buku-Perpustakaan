import { useState } from "react";
import "./login.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Icon sederhana — bisa diganti dengan react-icons jika sudah diinstall
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Username dan password wajib diisi");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error("Respons server tidak valid (Mungkin endpoint belum dibuat di backend).");
      }
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Username atau password salah");
      }
      
      // Simpan token JWT dan user
      if (!data.token) {
        throw new Error("Token JWT tidak ditemukan dari server.");
      }
      
      localStorage.setItem("token", data.token);
      const userData = data.user || { username, role: data.role || "user" };
      localStorage.setItem("user", JSON.stringify(userData));
      
      const role = (userData.role || "").toLowerCase();
      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login gagal:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background gradient merah muda sesuai desain */}
      <div className="login-bg" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          Dips<span>Book</span>
        </div>

        {/* Subjudul */}
        <p className="login-subtitle">
          Selamat datang di DipsBook.<br />
          Masukkan username dan password<br />
          sesuai nama dan NIM di KTM.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {errorMsg && (
            <div style={{ color: "#d9534f", background: "#fdf3f2", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #f5c6c5", textAlign: "center" }}>
              {errorMsg}
            </div>
          )}

          {/* Field Username */}
          <div className="field-group">
            <label htmlFor="username" className="field-label">
              Username
            </label>
            <div className="input-wrapper">
              <span className="input-icon left" aria-hidden="true">
                <UserIcon />
              </span>
              <input
                id="username"
                type="text"
                className="field-input"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Field Password */}
          <div className="field-group">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon left" aria-hidden="true">
                <LockIcon />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-icon right toggle-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>


          {/* Tombol Masuk */}
          <button
            type="submit"
            className="btn-masuk"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
