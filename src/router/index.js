import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import MovieDetail from '../pages/Moviedetail.vue';
import Account from '../pages/Account.vue';
import Bookings from '../pages/Booking.vue';
import Wallet from '../pages/Wallet.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/movie/:id', component: MovieDetail },
  { 
    path: '/account', 
    component: Account,
    meta: { requiresAuth: true }
  },
  { 
    path: '/bookings', 
    component: Bookings,
    meta: { requiresAuth: true }
  },
  { 
    path: '/wallet', 
    component: Wallet,
    meta: { requiresAuth: true }
  },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/admin',
    component: () => import('../pages/admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/dashboard',
    component: () => import('../pages/admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/bookings',
    component: () => import('../pages/admin/Bookings.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/showtimes',
    component: () => import('../pages/admin/Showtimes.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/movies',
    component: () => import('../pages/admin/Movies.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
    {
    path: '/admin/accounts',
    component: () => import('../pages/admin/Accounts.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  // Always allow non-protected routes
  if (!to.meta.requiresAuth) {
    next();
    return;
  }
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  // If no token/user, redirect to login
  if (!token || !userStr) {
    next('/login');
    return;
  }
  
  // Parse user
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user:', e);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    next('/login');
    return;
  }
  
  // Check admin requirement - check both isAdmin and IsAdmin for compatibility
  if (to.meta.requiresAdmin && !user.isAdmin && !user.IsAdmin) {
    console.log('Access denied: User is not an admin', user);
    alert('Access denied: Admin privileges required');
    next('/');
    return;
  }
  
  // All good, proceed
  next();
});

export default router;