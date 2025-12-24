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

  return res.data.user; // return user for redirect logic
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
    loadUser,
    googleLogin
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

// --------------------
// Cancel booking
// --------------------
export const cancelBooking = async (bookingId) => {
  try {
    const res = await axios.delete(`${API_BASE}/bookings/${bookingId}`);
    return res.data;
  } catch (err) {
    console.error('Error cancelling booking:', err);
    throw err;
  }
};


// --------------------
// Google OAuth login
// --------------------
export const googleLogin = () => {
  return new Promise((resolve, reject) => {
    // Check if Google API is loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      reject(new Error('Google API not loaded. Please refresh the page.'));
      return;
    }

    try {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            console.log('Google response received:', response);
            
            // Send the credential to your backend
            const res = await axios.post(`${API_BASE}/routes/accounts/oauth/google`, {
              credential: response.credential  // Send the entire JWT credential
            });

            console.log('Backend response:', res.data);
            
            // Save JWT & user info
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            // Update reactive user state
            user.value = res.data.user;
            
            resolve(res.data.user);
          } catch (err) {
            console.error('Error in Google callback:', err);
            reject(err);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Trigger Google Sign-In popup
      window.google.accounts.id.prompt((notification) => {
        console.log('Google prompt notification:', notification);
        
        if (notification.isNotDisplayed()) {
          reject(new Error('Google Sign-In popup was blocked. Please allow popups for this site.'));
        } else if (notification.isSkippedMoment()) {
          reject(new Error('Google Sign-In was skipped.'));
        }
        
      });
      
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err);
      reject(err);
    }
  });
};