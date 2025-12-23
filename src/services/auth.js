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
export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_BASE}/accounts/login`, { email, password });

    if (res.data.token) {
      const userData = {
        accountId: res.data.user.id,
        email: res.data.user.email,
        firstName: res.data.user.firstName,
        lastName: res.data.user.lastName
      };
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      user.value = userData;
    }

    return res.data;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
};

export const register = async (firstName, lastName, email, password) => {
  return axios.post(`${API_BASE}/accounts/register`, { firstName, lastName, email, password });
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
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
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

// --------------------
// Account management
// --------------------
export const getAccount = async (accountId) => {
  if (!accountId) return null;
  try {
    const res = await axios.get(`${API_BASE}/accounts/${accountId}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching account:', err);
    throw err;
  }
};

export const updateAccount = async (accountId, firstName, lastName) => {
  if (!accountId) return null;
  try {
    const res = await axios.put(`${API_BASE}/accounts/${accountId}`, { firstName, lastName });
    return res.data;
  } catch (err) {
    console.error('Error updating account:', err);
    throw err;
  }
};

// --------------------
// Wallet / balance
// --------------------
export const addBalance = async (accountId, amount) => {
  if (!accountId) return null;
  try {
    const res = await axios.put(`${API_BASE}/accounts/${accountId}/add-balance`, { amount });
    return res.data;
  } catch (err) {
    console.error('Error adding balance:', err);
    throw err;
  }
};

// --------------------
// Booking management
// --------------------
export const createBooking = async (showId, userId, tickets, totalPrice) => {
  try {
    const res = await axios.post(`${API_BASE}/bookings/create`, {
      Show_ID: showId,
      User_ID: userId,
      Tickets: tickets,
      Total_Price: totalPrice
    });
    return res.data;
  } catch (err) {
    console.error('Error creating booking:', err);
    throw err;
  }
};

export const getUserBookings = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/bookings?userId=${userId}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching bookings:', err);
    throw err;
  }
};