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
  component: () => import('../pages/admin/AdminHome.vue')
},
{
  path: '/admin/bookings',
  component: () => import('../pages/admin/Bookings.vue'),
},
{
  path: '/admin/showtimes',
  component: () => import('../pages/admin/Showtimes.vue'),
  meta: { requiresAdmin: true }
},
{
  path: '/admin/movies',
  component: () => import('../pages/admin/Movies.vue'),
  meta: { requiresAdmin: true }
}


];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (to.meta.requiresAuth && (!token || !user)) {
    next('/login');
  } else {
    next();
  }
});

export default router;