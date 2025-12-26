import axios from 'axios';

const API_BASE = 'http://localhost:2112/admin';

// --------------------
// Movies Management
// --------------------
export const getAdminMovies = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE}/movies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error('Error fetching movies:', err);
    throw err;
  }
};

export const getAdminGenres = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE}/movies/genres`, {  
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error('Error fetching genres:', err);
    throw err;
  }
};

export const createAdminMovie = async (movieData) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_BASE}/movies`, movieData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error('Error creating movie:', err);
    throw err;
  }
};

export const updateAdminMovie = async (movieId, movieData) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.put(`${API_BASE}/movies/${movieId}`, movieData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error('Error updating movie:', err);
    throw err;
  }
};

export const deleteAdminMovie = async (movieId) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`${API_BASE}/movies/${movieId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error('Error deleting movie:', err);
    throw err;
  }
};

// Admin Showtimes API calls
export const getAdminShowtimes = async (params = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams(params).toString();
  const response = await axios.get(`/api/admin/showtimes${queryParams ? '?' + queryParams : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminShowtimeStats = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('/api/admin/showtimes/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminShowtimeById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/admin/showtimes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createAdminShowtime = async (showtimeData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post('/api/admin/showtimes', showtimeData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateAdminShowtime = async (id, showtimeData) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/api/admin/showtimes/${id}`, showtimeData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteAdminShowtime = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`/api/admin/showtimes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Admin Accounts/Users API calls
export const getAdminUsers = async (params = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams(params).toString();
  const response = await axios.get(`/api/admin/accounts${queryParams ? '?' + queryParams : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminUserStats = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('/api/admin/accounts/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminUserById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/admin/accounts/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateAdminUser = async (id, userData) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/api/admin/accounts/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addUserBalance = async (id, amount) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`/api/admin/accounts/${id}/add-balance`, { amount }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deactivateAdminUser = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/api/admin/accounts/${id}/deactivate`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const activateAdminUser = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/api/admin/accounts/${id}/activate`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

