const GENRES = ["Fiksi", "Sains", "Anak", "Psikologi", "Filosofi", "Teknologi", "Sejarah", "Bisnis"];

export function mapBook(book) {
  const genre = GENRES[(book.id - 1) % GENRES.length] || "Umum";
  const status = book.stock > 0 ? "tersedia" : "dipinjam";
  const coverSeed = `book-${book.id}`;
  return {
    ...book,
    genre,
    category: genre,
    status,
    cover: `https://picsum.photos/seed/${coverSeed}/400/600`,
    coverUrl: `https://picsum.photos/seed/${coverSeed}/400/600`,
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
