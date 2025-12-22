import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Account from '../pages/Account.vue'
import Booking from '../pages/Booking.vue'
import Moviedetail from '../pages/Moviedetail.vue'

const routes = [
  { path: '/', redirect: '/home' }, 
  { path: '/home', component: Home },
  { path: '/account', component: Account },
  { path: '/booking', component: Booking },
  { path: '/moviedetail/:id', component: Moviedetail, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
