const GENRES = ["Fiksi", "Sains", "Anak", "Psikologi", "Filosofi", "Teknologi", "Sejarah", "Bisnis"];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

export function mapBook(book) {
  const genre = GENRES[(book.id - 1) % GENRES.length] || "Umum";
  const status = book.stock > 0 ? "tersedia" : "dipinjam";
  const coverSeed = `book-${book.id}`;
  
  // Resolusi cover dari database (cover_url) atau gunakan picsum.photos
  const defaultCover = `https://picsum.photos/seed/${coverSeed}/400/600`;
  const resolvedCover = book.cover_url
    ? (book.cover_url.startsWith("http") ? book.cover_url : `${BACKEND_URL}${book.cover_url}`)
    : defaultCover;

  return {
    ...book,
    genre,
    category: genre,
    status,
    cover: resolvedCover,
    coverUrl: resolvedCover,
    judul: book.title,
    penulis: book.author,
    kategori: genre,
    penerbit: "Penerbit Indonesia",
    halaman: `${200 + (book.id * 17) % 300} Hlm`,
    bahasa: "Indonesia",
    tahun: `${2020 + (book.id % 5)}`,
    sinopsis: `${book.title} adalah sebuah karya tulis oleh ${book.author} yang membahas tema-tema menarik seputar ${genre.toLowerCase()}. Buku ini sangat direkomendasikan untuk pembaca yang ingin memperluas wawasan.`,
  };
}
