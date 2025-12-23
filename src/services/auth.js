import axios from 'axios';
import { ref, computed } from 'vue';

const API_BASE = 'http://localhost:2112';

// --------------------
// Reactive auth state (singleton)
// --------------------
const user = ref(null);

// --------------------
// Init auth from localStorage
// --------------------
const loadUser = () => {
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (storedUser && token) {
    user.value = JSON.parse(storedUser);
  } else {
    user.value = null;
  }
};

loadUser();

// --------------------
// Auth actions
// --------------------
export const login = (loginData) => {
  if (loginData.token) {
    const userData = {
      accountId: loginData.accountId,
      email: loginData.email
    };

    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    user.value = userData;
  }

  return loginData;
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
  user.value = null;
};

export const isLoggedIn = () => {
  return !!user.value;
};

export const getUser = () => {
  return user.value;
};

// --------------------
// Composable (for App.vue / Navbar)
// --------------------
export const useAuth = () => {
  return {
    user,
    isLoggedIn: computed(() => !!user.value),
    login,
    register,
    logout,
    loadUser
  };
};

// Update first + last name
export const updateAccount = async (accountId, firstName, lastName) => {
  try {
    const res = await axios.put(`${API_BASE}/accounts/${accountId}`, {
      firstName,
      lastName
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Add balance (dummy)
export const addBalance = async (accountId, amount) => {
  try {
    const res = await axios.put(`${API_BASE}/accounts/${accountId}/add-balance`, { amount });
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};