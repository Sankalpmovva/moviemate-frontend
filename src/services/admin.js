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

