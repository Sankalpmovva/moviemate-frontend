import axios from 'axios';

const API_BASE = 'http://localhost:2112';

export const login = async (email, password) => {
  const res = await axios.post(`${API_BASE}/accounts/login`, {
    email,
    password
  });

  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  }

  return res.data;
};

export const register = async (firstName, lastName, email, password) => {
  return axios.post(`${API_BASE}/accounts/register`, {
    firstName,
    lastName,
    email,
    password
  });
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};
