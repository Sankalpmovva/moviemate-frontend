<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMovies } from '../services/api';

const movies = ref([]);
const selectedGenre = ref('all');
const currentPage = ref(1);
const moviesPerPage = 8;

const genres = ref([]);
const locations = ref([
  { id: 'all', name: 'All Locations' },
  { id: 'london', name: 'London' },
  { id: 'manchester', name: 'Manchester' },
  { id: 'birmingham', name: 'Birmingham' },
  { id: 'leeds', name: 'Leeds' }
]);

onMounted(async () => {
  movies.value = await getMovies();
  // Extract unique genres
  const uniqueGenres = [...new Set(movies.value.map(m => m.genres?.Name).filter(Boolean))];
  genres.value = [
    { id: 'all', name: 'All Genres' },
    ...uniqueGenres.map(g => ({ id: g, name: g }))
  ];
});

const filteredMovies = computed(() => {
  return movies.value.filter(movie => {
    const genreMatch = selectedGenre.value === 'all' || movie.genres?.Name === selectedGenre.value;
    return genreMatch;
  });
});

const paginatedMovies = computed(() => {
  const start = (currentPage.value - 1) * moviesPerPage;
  return filteredMovies.value.slice(start, start + moviesPerPage);
});

const totalPages = computed(() => {
  return Math.ceil(filteredMovies.value.length / moviesPerPage);
});
</script>

<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
      <div class="container">
        <router-link class="navbar-brand" to="/" style="font-size: 1.8rem; font-weight: 700; background: linear-gradient(135deg, #ff6b00, #ff9500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">🎬 MovieMate</router-link>
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
            <li class="nav-item">
              <router-link class="nav-link" to="/account">Account</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/bookings">Bookings</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link btn btn-outline-light ms-2" to="/login">Login</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="text-white text-center py-5 mb-5" style="background: linear-gradient(135deg, #ff6b00 0%, #ff9500 50%, #1a1a1a 100%); position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: url('data:image/svg+xml,%3Csvg width=%2720%27 height=%2720%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M0 0h20v20H0z%27 fill=%27none%27 stroke=%27white%27 stroke-width=%271%27/%3E%3C/svg%3E');"></div>
      <div class="container" style="position: relative; z-index: 1;">
        <h1 class="fw-bold" style="font-size: 3.5rem; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">NOW SHOWING</h1>
        <p class="lead" style="font-size: 1.3rem; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">✨ Discover & Book Your Favorite Movies ✨</p>
      </div>
    </header>

    <!-- Movies Grid -->
    <div class="container mb-5">
      <!-- Filter Section -->
      <div class="filter-section mb-5">
        <div class="row g-3">
          <div class="col-md-12">
            <label class="filter-label">🎬 Filter by Genre</label>
            <select v-model="selectedGenre" class="form-select filter-select">
              <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                {{ genre.name }}
              </option>
            </select>
          </div>
        </div>
        <p class="filter-results mt-3">
          Showing <strong>{{ paginatedMovies.length }}</strong> of <strong>{{ filteredMovies.length }}</strong> movies
        </p>
      </div>

      <!-- Movies Grid -->
      <div class="row g-4">
        <div
          class="col-sm-6 col-md-4 col-lg-3"
          v-for="movie in paginatedMovies"
          :key="movie.Movie_ID"
        >
          <div class="movie-card">
            <div class="movie-poster-container">
              <img
                :src="movie.Poster_URL || 'placeholder.jpg'"
                class="card-img-top"
                :alt="movie.Title"
              />
              <div class="movie-overlay">
                <router-link
                  :to="`/movie/${movie.Movie_ID}`"
                  class="btn btn-warning btn-lg"
                >
                  BOOK NOW
                </router-link>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title" style="min-height: 50px;">{{ movie.Title }}</h5>
              <p class="card-text mb-2" style="font-size: 0.9rem;">
                <span class="badge" style="background-color: #ff6b00;">{{ movie.genres?.Name || 'Unknown' }}</span>
              </p>
              <div class="movie-info">
                <small class="info-item">⭐ <span class="info-value">{{ movie.Rating }}</span></small>
                <small class="info-item">📅 <span class="info-value">{{ movie.Release_Date?.split('T')[0] }}</span></small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-section mt-5">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">First</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">Previous</button>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">Last</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-img-top {
  object-fit: cover;
  height: 400px;
  width: 100%;
}

.movie-card {
  background: #1a1a1a;
  color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #333;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(255, 107, 0, 0.3);
}

.movie-poster-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 2/3;
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.card-body {
  background: #1a1a1a;
  padding: 1.2rem;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.movie-info {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  flex-wrap: wrap;
}

.info-item {
  color: #ff9500;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.info-value {
  color: #00d4ff;
  font-weight: 700;
}
</style>
