import axios from 'axios';
import { ref } from 'vue';

const API_BASE = 'http://localhost:2112';

// 🔹 Reactive auth state
const user = ref(null);

// --------------------
// Load user from storage on app start
// --------------------
export const loadUser = () => {
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (storedUser && token) {
    user.value = JSON.parse(storedUser);
  } else {
    user.value = null;
  }
};

// --------------------
// Login
// --------------------
export const login = async (email, password) => {
  const res = await axios.post(`${API_BASE}/accounts/login`, {
    email,
    password
  });

  // Backend should return: token + accountId (+ email optionally)
  if (res.data.token) {
    const userData = {
      accountId: res.data.accountId,
      email
    };

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    user.value = userData;
  }

  return res.data;
};

// --------------------
// Register
// --------------------
export const register = async (firstName, lastName, email, password) => {
  return axios.post(`${API_BASE}/accounts/register`, {
    firstName,
    lastName,
    email,
    password
  });
};

// --------------------
// Logout
// --------------------
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  user.value = null;
};

// --------------------
// Helpers
// --------------------
export const getUser = () => user.value;

export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};
