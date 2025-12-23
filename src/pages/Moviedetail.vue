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
const selectedTheatre = ref('all');
const selectedDate = ref('all');
const currentPage = ref(1);
const itemsPerPage = 5;

// Extract unique dates from showtimes
const uniqueDates = computed(() => {
  const dates = [...new Set(showtimes.value.map(s => s.Show_Date?.split('T')[0]).filter(Boolean))];
  return [
    { id: 'all', label: 'All Dates' },
    ...dates.sort().map(date => ({
      id: date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    }))
  ];
});

// Extract unique theatres from showtimes
const uniqueTheatres = computed(() => {
  const theatreMap = {};
  showtimes.value.forEach(show => {
    if (show.theaters && !theatreMap[show.Theater_ID]) {
      theatreMap[show.Theater_ID] = show.theaters;
    }
  });
  return Object.values(theatreMap);
});

// Filtered showtimes based on selection
const filteredShowtimes = computed(() => {
  return showtimes.value.filter(showtime => {
    const dateMatch = selectedDate.value === 'all' || showtime.Show_Date?.split('T')[0] === selectedDate.value;
    let theatreMatch = true;
    
    if (selectedTheatre.value !== 'all') {
      theatreMatch = showtime.Theater_ID === parseInt(selectedTheatre.value);
    }
    
    return dateMatch && theatreMatch;
  });
});

// Group filtered showtimes by date
const groupedShowtimes = computed(() => {
  const grouped = {};
  filteredShowtimes.value.forEach(show => {
    const date = show.Show_Date?.split('T')[0] || 'Unknown';
    if (!grouped[date]) {
      grouped[date] = { date, shows: [] };
    }
    grouped[date].shows.push(show);
  });
  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
});

// Paginate the grouped dates
const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return groupedShowtimes.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => {
  return Math.ceil(groupedShowtimes.value.length / itemsPerPage);
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown Date';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const getTheatreName = (theatreObj) => {
  return theatreObj?.Name || 'Unknown Theatre';
};

const getTheatreCity = (theatreObj) => {
  return theatreObj?.City || 'Unknown';
};

const getFormatName = (formatObj) => {
  return formatObj?.Name || 'Standard';
};

const getTimeOnly = (timeStr) => {
  if (!timeStr) return '00:00';
  // Extract HH:MM from ISO timestamp like "1970-01-01T11:00:00.000Z"
  const match = timeStr.match(/T(\d{2}:\d{2})/);
  if (match) {
    return match[1];
  }
  // Fallback for HH:MM:SS format
  return timeStr.split('.')[0].substring(0, 5);
};

onMounted(async () => {
  try {
    console.log('Fetching movie with ID:', movieId);
    const [movieData, showtimesData] = await Promise.all([
      getMovieById(movieId),
      getShowtimesByMovie(movieId)
    ]);
    
    movie.value = movieData;
    showtimes.value = showtimesData;
    
    console.log('Movie data:', movie.value);
    console.log('Showtimes data:', showtimesData);
    
    if (showtimesData && showtimesData.length > 0) {
      console.log('First showtime:', JSON.stringify(showtimesData[0]));
      console.log('Theatre in showtime:', showtimesData[0].theaters);
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
                
                <!-- Filters -->
                <div class="filters-container">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="filter-label">🎭 Theatre</label>
                      <select v-model="selectedTheatre" class="form-select filter-select">
                        <option value="all">All Theatres</option>
                        <option v-for="theatre in uniqueTheatres" :key="theatre.Theatre_ID" :value="theatre.Theatre_ID">
                          {{ theatre.Name }} - {{ theatre.City }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="filter-label">📅 Date</label>
                      <select v-model="selectedDate" class="form-select filter-select">
                        <option v-for="date in uniqueDates" :key="date.id" :value="date.id">
                          {{ date.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div v-if="showtimes.length" class="showtimes-wrapper">
                  <!-- Showtimes Grid by Date -->
                  <div v-for="dateGroup in paginatedGroups" :key="dateGroup.date" class="date-group">
                    <h6 class="date-header">{{ formatDate(dateGroup.date) }}</h6>
                    <div class="showtimes-grid">
                      <div v-for="show in dateGroup.shows" :key="show.Showtime_ID" class="showtime-card">
                        <div class="showtime-header">
                          <div class="time-display">{{ getTimeOnly(show.Start_Time) }}</div>
                          <div class="format-badge">{{ getFormatName(show.formats) }}</div>
                        </div>
                        <div class="showtime-details">
                          <div class="detail-row">
                            <span class="detail-label">Theatre:</span>
                            <span class="detail-value">{{ getTheatreName(show.theaters) }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">{{ getTheatreCity(show.theaters) }}</span>
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

                  <!-- Pagination -->
                  <div v-if="totalPages > 1" class="pagination-section mt-4">
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
                <div v-else class="no-showtimes">
                  <p>No showtimes available.</p>
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
  background: var(--bg-dark);
  min-height: 100vh;
  padding-bottom: 3rem;
}

.poster-img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(255, 107, 0, 0.4);
  border: 2px solid var(--primary-orange);
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
  background-color: var(--primary-orange);
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
  background: var(--bg-darker);
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid var(--primary-orange);
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
  color: var(--primary-orange);
  margin-right: 0.5rem;
}

.synopsis {
  color: #ddd;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.showtimes-wrapper {
  animation: slideIn 0.3s ease-out;
}

.date-group {
  margin-bottom: 2.5rem;
}

.date-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-orange-light);
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--primary-orange);
  margin-bottom: 1.5rem;
}

.showtimes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.showtime-card {
  background: linear-gradient(135deg, var(--bg-darker) 0%, var(--bg-card) 100%);
  border: 2px solid var(--border-dark);
  border-radius: 10px;
  padding: 1.2rem;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.showtime-card:hover {
  border-color: var(--primary-orange);
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
  color: var(--primary-orange-light);
  letter-spacing: 2px;
}

.format-badge {
  background: linear-gradient(135deg, var(--primary-cyan), var(--primary-cyan-dark));
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

.price-tag {
  color: var(--primary-cyan);
  font-weight: 700;
  font-size: 1.1rem;
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
