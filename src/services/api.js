import axios from 'axios';

const API_BASE = 'http://localhost:2112'; 

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// --------------------
// Attach JWT automatically
// --------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Movies
// --------------------
export const getMovies = async () => {
  try {
    const res = await api.get('/movies');
    return res.data;
  } catch (err) {
    console.error('Error fetching movies:', err);
    return [];
  }
};

export const getMovieById = async (id) => {
  try {
    const res = await api.get(`/movies/${id}`); // Fixed
    return res.data;
  } catch (err) {
    console.error('Error fetching movie:', err);
    return null;
  }
};

// --------------------
// Showtimes
// --------------------
export const getShowtimesByMovie = async (movieId) => {
  const res = await axios.get(`http://localhost:2112/showtimes?movieId=${movieId}`); // Fixed
  return res.data;
};

export const getAllShowtimes = async () => {
  try {
    const res = await api.get('/showtimes');
    return res.data;
  } catch (err) {
    console.error('Error fetching all showtimes:', err);
    return [];
  }
};

// --------------------
// Theatres
// --------------------
export const getTheatres = async () => {
  try {
    const res = await api.get('/theatres');
    return res.data;
  } catch (err) {
    console.error('Error fetching theatres:', err);
    return [];
  }
};

// --------------------
// Bookings
// --------------------
export const getAllBookings = async () => {
  try {
    const res = await api.get('/bookings');
    return res.data;
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
};

// --------------------
// Notifications
// --------------------
export const getNotifications = async (userId) => {
  try {
    const res = await api.get(`/notifications/user/${userId}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
};

export const deleteNotification = async (id) => {
  try {
    await api.delete(`/notifications/${id}`);
    return true;
  } catch (err) {
    console.error('Error deleting notification:', err);
    return false;
  }
};

export const clearAllNotifications = async (userId) => {
  try {
    await api.delete(`/notifications/user/${userId}/all`);
    return true;
  } catch (err) {
    console.error('Error clearing notifications:', err);
    return false;
  }
};

// --------------------
// Export api for custom calls
// --------------------
export default api;