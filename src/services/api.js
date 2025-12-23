import axios from 'axios';

const API_BASE = 'http://localhost:2112'; // backend URL

const api = axios.create({
  baseURL: API_BASE
});

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

// Fetch all showtimes
export const getAllShowtimes = async () => {
  try {
    const response = await axios.get(`${API_BASE}/showtimes`);
    return response.data;
  } catch (err) {
    console.error('Error fetching showtimes:', err);
    return [];
  }
};

// Fetch all theatres
export const getTheatres = async () => {
  try {
    const response = await axios.get(`${API_BASE}/theatres`);
    return response.data;
  } catch (err) {
    console.error('Error fetching theatres:', err);
    return [];
  }
};

// Fetch all bookings
export const getAllBookings = async () => {
  try {
    const response = await axios.get(`${API_BASE}/bookings`);
    return response.data;
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
};

//attach jwt
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

