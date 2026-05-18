// Konfigurasi dasar untuk memanggil API
// Mengambil base URL dari environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Contoh helper untuk memanggil API dengan fetch standar
 * Bisa diganti dengan axios nanti jika diperlukan
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Parse JSON
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
      throw new Error(data?.message || `HTTP error! status: ${response.status}`);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { data: null, error: error.message };
  }
};
