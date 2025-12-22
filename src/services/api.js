import axios from 'axios';

const API_BASE = 'http://localhost:2112';

export const getMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE}/movies`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY; // store key in .env

export const getTMDBMovie = async (title) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
      },
    });
    return response.data.results[0]; // first match
  } catch (err) {
    console.error(err);
    return null;
  }
};

