import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import MovieDetail from '../pages/Moviedetail.vue';
import Account from '../pages/Account.vue';
import Bookings from '../pages/Booking.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/movie/:id', component: MovieDetail },
  { path: '/account', component: Account },
  { path: '/bookings', component: Bookings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
