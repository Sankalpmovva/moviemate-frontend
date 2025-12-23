import axios from 'axios';
const API_BASE = 'http://localhost:2112';
const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: API_BASE,
  headers: { Authorization: `Bearer ${token}` }
});

// Movies
export const getMovies = () => api.get('/admin/movies');
export const createMovie = (data) => api.post('/admin/movies', data);
export const updateMovie = (id, data) => api.put(`/admin/movies/${id}`, data);
export const deleteMovie = (id) => api.delete(`/admin/movies/${id}`);
