<script setup>
import { onMounted } from 'vue';
import { useAuth } from './services/auth';

const { user, logout, loadUser } = useAuth();

onMounted(() => {
  loadUser();
});
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

            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>

            <!-- Logged in -->
            <template v-if="user">
              <li class="nav-item">
                <router-link class="nav-link" to="/account">Account</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/bookings">Bookings</router-link>
              </li>
              <li class="nav-item">
                <button class="btn btn-outline-warning ms-2" @click="logout">
                  Logout
                </button>
              </li>
            </template>

            <!-- Logged out -->
            <template v-else>
              <li class="nav-item">
                <router-link class="nav-link btn btn-outline-light ms-2" to="/login">
                  Login
                </router-link>
              </li>
            </template>

          </ul>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>
