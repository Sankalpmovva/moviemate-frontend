<script setup>
import { useAuth } from './services/auth.js';
import { useRouter } from 'vue-router';

const { user, isLoggedIn, logout } = useAuth();
const router = useRouter();

const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>

<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <router-link class="navbar-brand" to="/">MovieMate</router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">

            <!-- Not logged in -->
            <template v-if="!isLoggedIn">
              <li class="nav-item">
                <router-link class="nav-link" to="/">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/login">Login</router-link>
              </li>
            </template>

            <!-- Logged in USER -->
            <template v-else-if="isLoggedIn && !user?.isAdmin">
              <li class="nav-item">
                <router-link class="nav-link" to="/">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/account">Account</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/bookings">Bookings</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/wallet">Wallet</router-link>
              </li>
              <li class="nav-item">
                <button
                  class="btn btn-outline-light ms-2"
                  @click="handleLogout"
                >
                  Logout
                </button>
              </li>
            </template>

            <!-- Logged in ADMIN -->
            <template v-else>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin/dashboard">
                  Dashboard
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin/accounts">
                  Accounts
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin/movies">
                  Movies
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin/bookings">
                  Bookings
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin/showtimes">
                  Showtimes
                </router-link>
              </li>
              <li class="nav-item">
                <button
                  class="btn btn-outline-danger ms-2"
                  @click="handleLogout"
                >
                  Logout
                </button>
              </li>
            </template>

          </ul>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <router-view />
  </div>
</template>

<style>
body {
  background-color: #121212;
  color: #fff;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}
</style>
