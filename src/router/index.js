import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import MovieDetail from '../pages/MovieDetail.vue'
import Account from '../pages/Account.vue'
import Booking from '../pages/Booking.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/movies/:id',
    name: 'MovieDetail',
    component: MovieDetail
  },
  {
    path: '/account',
    name: 'Account',
    component: Account
  },
  {
    path: '/booking/:showtimeId',
    name: 'Booking',
    component: Booking
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
