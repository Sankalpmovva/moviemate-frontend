<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getMovieById, getShowtimesByMovie } from '../services/api';

const route = useRoute();
const movieId = route.params.id;

const movie = ref(null);
const showtimes = ref([]);
const loading = ref(true);
const error = ref(null);

const groupedShowtimes = computed(() => {
  const grouped = {};
  showtimes.value.forEach(show => {
    const date = show.Show_Date?.split('T')[0] || 'Unknown';
    if (!grouped[date]) {
      grouped[date] = { date, shows: [] };
    }
    grouped[date].shows.push(show);
  });
  // Sort by date
  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown Date';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(async () => {
  try {
    console.log('Fetching movie with ID:', movieId);
    movie.value = await getMovieById(movieId);
    console.log('Movie data:', movie.value);
    console.log('Genres data:', movie.value?.genres);
    if (movie.value) {
      showtimes.value = await getShowtimesByMovie(movieId);
    }
  } catch (err) {
    error.value = err.message;
    console.error('Error loading movie:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="detail-container">
    <!-- Back Button & Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status" style="color: #ff6b00;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3" style="color: #ccc;">Loading movie details...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger m-4">
      <h5>Error Loading Movie</h5>
      <p>{{ error }}</p>
    </div>

    <!-- Movie Details -->
    <div v-else-if="movie" class="movie-detail">
      <!-- Back Button -->
      <div class="container py-3">
        <router-link to="/" class="btn btn-outline-warning btn-sm">
          ← Back to Movies
        </router-link>
      </div>

      <!-- Main Content -->
      <div class="container mb-5">
        <div class="row g-5">
          <!-- Poster Section -->
          <div class="col-lg-4">
            <div class="poster-section">
              <img
                :src="movie.Poster_URL || 'placeholder.jpg'"
                :alt="movie.Title"
                class="poster-img"
              />
            </div>
          </div>

          <!-- Details Section -->
          <div class="col-lg-8">
            <div class="details-section">
              <h1 class="movie-title">{{ movie.Title }}</h1>
              
              <div class="movie-meta">
                <span class="badge-genre">{{ movie.genres?.Name || 'Unknown' }}</span>
                <span class="meta-item">⭐ {{ movie.Rating }}/10</span>
                <span class="meta-item">📅 {{ movie.Release_Date?.split('T')[0] }}</span>
                <span v-if="movie.Runtime" class="meta-item">⏱️ {{ movie.Runtime }} min</span>
              </div>

              <div class="description-section mt-4">
                <h5 class="section-title">Synopsis</h5>
                <p class="synopsis">{{ movie.Overview }}</p>
              </div>

              <!-- Showtimes Section -->
              <div class="showtimes-section mt-5">
                <h5 class="section-title">Available Showtimes</h5>
                
                <div v-if="showtimes.length" class="showtimes-container">
                  <!-- Group by Date -->
                  <div v-for="dateGroup in groupedShowtimes" :key="dateGroup.date" class="date-group">
                    <h6 class="date-header">{{ formatDate(dateGroup.date) }}</h6>
                    <div class="showtimes-grid">
                      <div v-for="show in dateGroup.shows" :key="show.Showtime_ID" class="showtime-card">
                        <div class="showtime-header">
                          <div class="time-display">{{ show.Start_Time }}</div>
                          <div class="format-badge">{{ show.format?.Name || 'Standard' }}</div>
                        </div>
                        <div class="showtime-details">
                          <div class="detail-row">
                            <span class="detail-label">Theater:</span>
                            <span class="detail-value">{{ show.theater?.Name || 'Unknown' }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Price:</span>
                            <span class="price-tag">€{{ parseFloat(show.Price).toFixed(2) }}</span>
                          </div>
                        </div>
                        <button class="btn btn-warning btn-book">BOOK SEAT</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-showtimes">
                  <p>🎬 No showtimes available at the moment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="alert alert-warning m-4">
      <p>No movie data found for ID {{ movieId }}</p>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  background: #0f0f0f;
  min-height: 100vh;
  padding-bottom: 3rem;
}

.movie-detail {
  background: #0f0f0f;
}

.poster-section {
  position: relative;
}

.poster-img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(255, 107, 0, 0.4);
  border: 2px solid #ff6b00;
}

.details-section {
  color: white;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.movie-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.badge-genre {
  background-color: #ff6b00;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.95rem;
}

.meta-item {
  font-size: 1.05rem;
  font-weight: 500;
  color: #ccc;
}

.description-section {
  background: #1a1a1a;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #ff6b00;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '▶';
  color: #ff6b00;
  margin-right: 0.5rem;
}

.synopsis {
  color: #ddd;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.showtimes-section {
  margin-top: 3rem;
}

.showtimes-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.date-group {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.date-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff9500;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ff6b00;
  margin-bottom: 1.5rem;
}

.showtimes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.showtime-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
  border: 2px solid #333;
  border-radius: 10px;
  padding: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.showtime-card:hover {
  border-color: #ff6b00;
  box-shadow: 0 8px 20px rgba(255, 107, 0, 0.3);
  transform: translateY(-4px);
}

.showtime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #444;
}

.time-display {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ff9500;
  letter-spacing: 2px;
}

.format-badge {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.showtime-details {
  flex-grow: 1;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.detail-label {
  color: #aaa;
  font-weight: 500;
}

.detail-value {
  color: #fff;
  font-weight: 600;
}

.price-tag {
  color: #00d4ff;
  font-weight: 700;
  font-size: 1.1rem;
}

.btn-book {
  width: 100%;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.75rem;
  background-color: #ff6b00;
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.btn-book:hover {
  background-color: #ff9500;
  transform: scale(1.02);
}

.no-showtimes {
  background: #1a1a1a;
  padding: 3rem 2rem;
  border-radius: 8px;
  text-align: center;
  color: #999;
  border: 2px dashed #333;
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .movie-title {
    font-size: 1.8rem;
  }

  .movie-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .showtimes-grid {
    grid-template-columns: 1fr;
  }

  .time-display {
    font-size: 1.5rem;
  }
}
</style>
