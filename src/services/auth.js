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
  const res = await axios.post(`${API_BASE}/accounts/login`, { email, password }); 
  if (res.data.token) {
    const userData = {
      id: res.data.user.id, 
      accountId: res.data.user.id,
      email: res.data.user.email,
      firstName: res.data.user.firstName,
      lastName: res.data.user.lastName,
      isAdmin: res.data.user.isAdmin   
    };
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    user.value = userData;
  }
  return res.data.user;
};

export const register = async (firstName, lastName, email, password) => {
  return axios.post(`${API_BASE}/accounts/register`, { firstName, lastName, email, password }); // Fixed
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
    loadUser,
  googleLogin: googleLoginRedirect, 
  handleGoogleCallback,
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
    const res = await axios.put(`${API_BASE}/accounts/${accountId}`, { firstName, lastName }); // Fixed
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
    const res = await axios.put(`${API_BASE}/accounts/${accountId}/add-balance`, { amount }); // Fixed
    return res.data;
  } catch (err) {
    console.error('Error adding balance:', err);
    throw err;
  }
};

// --------------------
// Booking management
// --------------------
export const createBooking = async (showId, accountId, tickets, totalPrice) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/bookings/create`, { // Fixed
      Show_ID: parseInt(showId),
      User_ID: parseInt(accountId),
      Tickets: parseInt(tickets),
      Total_Price: parseFloat(totalPrice)
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Booking error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const getUserBookings = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/bookings?userId=${userId}`); // Fixed
    return res.data;
  } catch (err) {
    console.error('Error fetching bookings:', err);
    throw err;
  }
};

// --------------------
// Cancel booking
// --------------------
export const cancelBooking = async (bookingId) => {
  try {
    const res = await axios.delete(`${API_BASE}/bookings/${bookingId}`); // Fixed
    return res.data;
  } catch (err) {
    console.error('Error cancelling booking:', err);
    throw err;
  }
};
// --------------------
// Google OAuth login 
// --------------------
export const googleLoginRedirect = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:2112';
  const frontendUrl = window.location.origin;
  
  // Simple redirect 
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(`${backendUrl}/accounts/oauth/google/callback`)}` +
    `&response_type=code` +
    `&scope=email%20profile` +
    `&state=${encodeURIComponent(frontendUrl)}` +
    `&prompt=select_account`;
  
  window.location.href = authUrl;
  return Promise.resolve(); 
};

export const handleGoogleCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const error = params.get('error');
  
  if (error) {
    throw new Error(`Google login failed: ${error}`);
  }
  
  if (token) {
    try {
    
      localStorage.setItem('token', token);
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userData = {
        id: payload.accountId,
        email: payload.email,
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        isAdmin: payload.isAdmin || false,
        balance: 0  
      };
      
     
      localStorage.setItem('user', JSON.stringify(userData));
      user.value = userData;
      
      try {
        const userRes = await axios.get(`${API_BASE}/accounts/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
  
        userData.balance = userRes.data.balance || 0;
        localStorage.setItem('user', JSON.stringify(userData));
        user.value = userData;
      } catch (err) {
        console.log('Could not fetch full profile, using token data:', err.message);
        
      }
      
    
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return userData;
    } catch (err) {
      console.error('Error processing Google callback:', err);
      throw new Error('Failed to process Google login');
    }
  }
  
  return null;
};

export const googleLogin = googleLoginRedirect; 