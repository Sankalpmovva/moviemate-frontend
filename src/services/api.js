import axios from 'axios';

const API_BASE = 'http://localhost:2112'; // backend URL

// Fetch all movies
export const getMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE}/movies`);
    return response.data;
  } catch (err) {
    console.error('Error fetching movies:', err);
    return [];
  }
};

// Fetch single movie by ID
export const getMovieById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/movies/${id}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Fetch showtimes for a movie
export const getShowtimesByMovie = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/showtimes`, {
      params: { movieId: id },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};
