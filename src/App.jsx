import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Home from "./pages/home";
import KoleksiBuku from "./pages/koleksibuku";
import DetailBuku from "./pages/detailbuku";
import FormPeminjaman from "./pages/formpeminjaman";
import PinjamanSaya from "./pages/pinjamansaya";
import Notifikasi from "./pages/notifikasi";

function NotFound() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>404 - Halaman tidak ditemukan</h1>
      <p style={{ color: "#666" }}>Route yang kamu minta belum tersedia.</p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Main */}
        <Route path="/" element={<Home />} />
        <Route path="/katalog" element={<Home />} />

        <Route path="/koleksi-buku" element={<KoleksiBuku />} />
        <Route path="/koleksi" element={<KoleksiBuku />} />

        <Route path="/pinjaman" element={<PinjamanSaya />} />
        <Route path="/notifikasi" element={<Notifikasi />} />

        {/* Buku & Peminjaman */}
        <Route path="/buku/:id" element={<DetailBuku />} />
        <Route path="/buku/:id/pinjam" element={<FormPeminjaman />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

