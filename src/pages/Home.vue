<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const movies = ref([]);
const genres = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const moviesPerPage = 8;

const searchQuery = ref('');
const selectedGenre = ref('all');
const sortBy = ref('newest');


const loadMovies = async () => {
  try {
    loading.value = true;
    const res = await axios.get('http://localhost:2112/movies');
    movies.value = res.data;
    error.value = null;
  } catch (err) {
    console.error('Error loading movies:', err);
    error.value = 'Failed to load movies. Please try again later.';
    movies.value = [];
  } finally {
    loading.value = false;
  }
};

const loadGenres = async () => {
  try {
    const res = await axios.get('http://localhost:2112/movies/genres/all');
    genres.value = res.data;
  } catch (err) {
    console.error('Error loading genres:', err);
    genres.value = [];
  }
};

const filteredMovies = computed(() => {
  let result = [...movies.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(movie => {
      const title = movie.Title?.toLowerCase() || '';
      return title.includes(query);
    });
  }

  // Genre filter
  if (selectedGenre.value !== 'all') {
    result = result.filter(movie => {
      const genreId = movie.genres?.Genre_ID || movie.Genre_ID;
      return genreId === parseInt(selectedGenre.value);
    });
  }

  // Sorting
  switch(sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.Release_Date || 0) - new Date(a.Release_Date || 0));
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.Release_Date || 0) - new Date(b.Release_Date || 0));
      break;
    case 'rating':
      result.sort((a, b) => (parseFloat(b.Rating) || 0) - (parseFloat(a.Rating) || 0));
      break;
    case 'title':
      result.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
      break;
  }

  return result;
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedGenre.value = 'all';
  sortBy.value = 'newest';
  currentPage.value = 1;
};

const paginatedMovies = computed(() => {
  const start = (currentPage.value - 1) * moviesPerPage;
  return filteredMovies.value.slice(start, start + moviesPerPage);
});

const totalPages = computed(() => {
  return Math.ceil(filteredMovies.value.length / moviesPerPage);
});

onMounted(async () => {
  await Promise.all([
    loadMovies(),
    loadGenres()
  ]);
});
</script>

<template>
  <div>
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
<!-- Filters: -->
     
      <div class="filters-section mb-5">
        <!-- Compact Filter Bar -->
        <div class="compact-filters mb-4">
          <div class="row align-items-center g-3">
            <!-- Search Bar -->
            <div class="col-xl-4 col-lg-5">
              <div class="search-wrapper">
                <div class="input-group">
                  <span class="input-group-text bg-dark border-dark">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control bg-dark text-white border-dark"
                    placeholder="Search movies..."
                    @input="currentPage = 1"
                  />
                </div>
              </div>
            </div>

            <!-- Main Filters Row -->
            <div class="col-xl-8 col-lg-7">
              <div class="row g-2">
                <!-- Genre Filter -->
                <div class="col-md-6 col-6">
                  <select v-model="selectedGenre" class="form-select bg-dark text-white border-dark" @change="currentPage = 1">
                    <option value="all">All Genres</option>
                    <option v-for="genre in genres" :key="genre.Genre_ID" :value="genre.Genre_ID">
                      {{ genre.Name }}
                    </option>
                  </select>
                </div>

                <!-- Sort Filter -->
                <div class="col-md-4 col-6">
                  <select v-model="sortBy" class="form-select bg-dark text-white border-dark" @change="currentPage = 1">
                    <option value="newest">Newest Releases</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>

                <!-- Reset Button -->
                <div class="col-md-2 col-12">
                  <button class="btn btn-outline-light w-100" @click="resetFilters">
                    <i class="bi bi-arrow-clockwise me-1"></i> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Results Count -->
          <div class="row mt-3">
            <div class="col-12">
              <div class="d-flex align-items-center justify-content-between">
                <small class="text-muted">
                  Showing {{ filteredMovies.length }} of {{ movies.length }} movies
                </small>
                <small class="text-muted" v-if="totalPages > 1">
                  Page {{ currentPage }} of {{ totalPages }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading movies...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger text-center">
          {{ error }}
          <button class="btn btn-sm btn-outline-light ms-2" @click="loadMovies">
            Retry
          </button>
        </div>

        <!-- No Results -->
        <div v-else-if="filteredMovies.length === 0" class="no-results text-center py-5">
          <div class="no-results-icon mb-3">🎬</div>
          <h4 class="text-white mb-2">No movies found</h4>
          <p class="text-muted mb-3">Try adjusting your search or filters</p>
          <button class="btn btn-warning" @click="resetFilters">
            Clear All Filters
          </button>
        </div>
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

.filters-panel {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ff6b00;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.2);
}

.filters-title {
  color: #ff6b00;
  margin-bottom: 1.5rem;
  font-weight: 700;
  font-size: 1.5rem;
}

.search-box {
  position: relative;
}

.search-box input {
  padding-left: 2.5rem;
  background: #0a0a0a;
  border: 2px solid #444;
  color: #fff;
  font-size: 1rem;
}

.search-box input:focus {
  background: #0a0a0a;
  border-color: #ff6b00;
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  pointer-events: none;
}

.filter-label {
  color: #999;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}

.form-select {
  background: #0a0a0a;
  border: 2px solid #444;
  color: #fff;
}

.form-select:focus {
  background: #0a0a0a;
  border-color: #ff6b00;
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
}

.form-select option {
  background: #1a1a1a;
  color: #fff;
}

.results-count {
  color: #999;
  font-size: 0.9rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: #1a1a1a;
  border-radius: 12px;
  border: 2px solid #333;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.no-results p {
  color: #999;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .filters-panel {
    padding: 1rem;
  }

  .filters-title {
    font-size: 1.2rem;
  }
}
/* Add these to your existing <style scoped> section */

.compact-filters {
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid #333;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.search-wrapper .input-group-text {
  border-right: none;
  color: #ff6b00;
}

.search-wrapper input {
  border-left: none;
  padding: 0.75rem;
}

.search-wrapper input:focus {
  border-color: #ff6b00;
  box-shadow: 0 0 0 0.25rem rgba(255, 107, 0, 0.25);
}

.form-select {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s;
}

.form-select:focus {
  border-color: #ff6b00;
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
}

.secondary-filters {
  padding-top: 0.75rem;
  border-top: 1px solid #333;
}

/* Movie Grid Styles */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .compact-filters {
    padding: 1rem;
  }
  
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .compact-filters .row > div {
    margin-bottom: 0.5rem;
  }
  
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
