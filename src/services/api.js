import axios from 'axios';

const API_BASE = 'http://localhost:2112'; // backend URL

// Get all movies from backend (with TMDB info already stored)
export const getMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE}/movies`);
    return response.data;
  } catch (err) {
    console.error("Error fetching movies:", err);
    return [];
  }
};
