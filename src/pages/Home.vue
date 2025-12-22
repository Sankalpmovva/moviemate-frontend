<script setup>
import { ref, onMounted } from 'vue';
import { getMovies } from '../services/api';

const movies = ref([]);

onMounted(async () => {
  movies.value = await getMovies();
});
</script>

<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">MovieMate</a>
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
              <a class="nav-link" href="#">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Account</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Bookings</a>
            </li>
            <li class="nav-item">
              <a class="nav-link btn btn-outline-light ms-2" href="#">Login</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="bg-secondary text-white text-center py-5 mb-4">
      <div class="container">
        <h1 class="fw-bold">Now Showing</h1>
        <p class="lead">Book your favorite movies easily!</p>
      </div>
    </header>

    <!-- Movies Grid -->
    <div class="container">
      <div class="row g-4">
        <div
          class="col-sm-6 col-md-4 col-lg-3"
          v-for="movie in movies"
          :key="movie.Movie_ID"
        >
          <div class="card h-100 text-white bg-dark">
            <img
              :src="movie.Poster_URL || 'placeholder.jpg'"
              class="card-img-top"
              :alt="movie.Title"
            />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ movie.Title }}</h5>
              <p class="card-text mb-1">
                <strong>Genre:</strong> {{ movie.genres?.Name || 'Unknown' }}
              </p>
              <p class="card-text mb-1">
                <strong>Rating:</strong> {{ movie.Rating }}
              </p>
              <p class="card-text mt-auto">
                <small class="text-muted">Release: {{ movie.Release_Date }}</small>
              </p>
              <button class="btn btn-primary mt-2">Book Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-img-top {
  object-fit: cover;
  height: 350px;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}
</style>
