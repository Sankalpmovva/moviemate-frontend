import axios from 'axios';

const API_BASE = 'http://localhost:2112'; // backend URL

// Get all movies from backend
export const getMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE}/movies`);
    return response.data;
  } catch (err) {
    console.error("Error fetching movies:", err);
    return [];
  }
};

// Optional: fetch extra TMDB details if backend exposes a TMDB endpoint
export const getTMDBMovie = async (title) => {
  try {
    const response = await axios.get(`${API_BASE}/tmdb`, {
      params: { title },
    });
    return response.data; // expect poster, overview, rating, etc.
  } catch (err) {
    console.error("Error fetching TMDB data:", err);
    return null;
  }
};
