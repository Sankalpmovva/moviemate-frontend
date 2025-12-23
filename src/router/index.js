import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import MovieDetail from '../pages/Moviedetail.vue';
import Account from '../pages/Account.vue';
import Bookings from '../pages/Booking.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/movie/:id', component: MovieDetail },
  { path: '/account', component: Account },
  { path: '/bookings', component: Bookings },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;