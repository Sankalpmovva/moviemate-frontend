<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAllShowtimes, getTheatres, getMovies } from '../services/api';

const showtimes = ref([]);
const theatres = ref([]);
const movies = ref([]);
const selectedTheatre = ref('all');
const selectedDate = ref('all');
const currentPage = ref(1);
const itemsPerPage = 6;
const loading = ref(true);

onMounted(async () => {
  try {
    const [showtimesData, theatresData, moviesData] = await Promise.all([
      getAllShowtimes(),
      getTheatres(),
      getMovies(),
    ]);
    
    showtimes.value = showtimesData;
    theatres.value = theatresData;
    movies.value = moviesData;
  } catch (err) {
    console.error('Error loading data:', err);
  } finally {
    loading.value = false;
  }
});

// Extract unique dates
const dates = computed(() => {
  const uniqueDates = [...new Set(showtimes.value.map(s => s.Show_Date?.split('T')[0]).filter(Boolean))];
  return [
    { id: 'all', label: 'All Dates' },
    ...uniqueDates.sort().map(date => ({
      id: date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    }))
  ];
});

// Extract unique cities
const cities = computed(() => {
  const uniqueCities = [...new Set(theatres.value.map(t => t.City).filter(Boolean))];
  return [
    { id: 'all', label: 'All Cities' },
    ...uniqueCities.map(city => ({ id: city, label: city }))
  ];
});

// Filter showtimes
const filteredShowtimes = computed(() => {
  return showtimes.value.filter(showtime => {
    const dateMatch = selectedDate.value === 'all' || showtime.Show_Date?.split('T')[0] === selectedDate.value;
    let theatreMatch = true;
    
    if (selectedTheatre.value !== 'all') {
      const selectedTheatreObj = theatres.value.find(t => t.Theatre_ID === parseInt(selectedTheatre.value));
      theatreMatch = selectedTheatreObj && showtime.Theatre_ID === selectedTheatreObj.Theatre_ID;
    }
    
    return dateMatch && theatreMatch;
  });
});

// Paginate
const paginatedShowtimes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredShowtimes.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => {
  return Math.ceil(filteredShowtimes.value.length / itemsPerPage);
});

const getMovieTitle = (movieId) => {
  const movie = movies.value.find(m => m.Movie_ID === movieId);
  return movie?.Title || 'Unknown Movie';
};

const getTheatreName = (theatreId) => {
  const theatre = theatres.value.find(t => t.Theatre_ID === theatreId);
  return theatre?.Name || 'Unknown Theatre';
};

const getTheatreCity = (theatreId) => {
  const theatre = theatres.value.find(t => t.Theatre_ID === theatreId);
  return theatre?.City || 'Unknown';
};

const getFormatName = (formatId) => {
  // Format names - adjust based on your database
  const formats = { 1: '2D', 2: '3D', 3: 'IMAX', 4: '4DX' };
  return formats[formatId] || 'Standard';
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};
</script>

<template>
  <div class="booking-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status" style="color: #ff6b00;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3" style="color: #ccc;">Loading available showtimes...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header -->
      <div class="booking-header">
        <div class="container">
          <h1 class="header-title">🎬 Book Your Tickets</h1>
          <p class="header-subtitle">Find and book your perfect showtime</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="container mt-5 mb-5">
        <div class="filters-section">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="filter-label">📍 Select Theatre</label>
              <select v-model="selectedTheatre" class="form-select filter-select">
                <option value="all">All Theatres</option>
                <option v-for="theatre in theatres" :key="theatre.Theatre_ID" :value="theatre.Theatre_ID">
                  {{ theatre.Name }} - {{ theatre.City }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="filter-label">📅 Select Date</label>
              <select v-model="selectedDate" class="form-select filter-select">
                <option v-for="date in dates" :key="date.id" :value="date.id">
                  {{ date.label }}
                </option>
              </select>
            </div>
          </div>
          <p class="filter-results mt-3">
            Showing <strong>{{ paginatedShowtimes.length }}</strong> of <strong>{{ filteredShowtimes.length }}</strong> showtimes
          </p>
        </div>
      </div>

      <!-- Showtimes Grid -->
      <div class="container mb-5">
        <div v-if="paginatedShowtimes.length" class="showtimes-grid">
          <div v-for="showtime in paginatedShowtimes" :key="showtime.Showtime_ID" class="showtime-item">
            <div class="showtime-card">
              <!-- Movie Title -->
              <div class="movie-info-header">
                <h5 class="movie-title">{{ getMovieTitle(showtime.Movie_ID) }}</h5>
              </div>

              <!-- Showtime Details -->
              <div class="showtime-details">
                <div class="detail-row">
                  <span class="detail-icon">🎬</span>
                  <div>
                    <span class="detail-label">Theatre</span>
                    <div class="detail-value">{{ getTheatreName(showtime.Theatre_ID) }}</div>
                  </div>
                </div>

                <div class="detail-row">
                  <span class="detail-icon">📍</span>
                  <div>
                    <span class="detail-label">Location</span>
                    <div class="detail-value">{{ getTheatreCity(showtime.Theatre_ID) }}</div>
                  </div>
                </div>

                <div class="detail-row">
                  <span class="detail-icon">📅</span>
                  <div>
                    <span class="detail-label">Date</span>
                    <div class="detail-value">{{ formatDate(showtime.Show_Date) }}</div>
                  </div>
                </div>

                <div class="detail-row">
                  <span class="detail-icon">🕐</span>
                  <div>
                    <span class="detail-label">Time</span>
                    <div class="detail-value time-large">{{ showtime.Start_Time }}</div>
                  </div>
                </div>

                <div class="detail-row">
                  <span class="detail-icon">🎥</span>
                  <div>
                    <span class="detail-label">Format</span>
                    <span class="format-badge">{{ getFormatName(showtime.Format_ID) }}</span>
                  </div>
                </div>

                <div class="detail-row price-row">
                  <span class="detail-icon">💰</span>
                  <div>
                    <span class="detail-label">Price</span>
                    <div class="price-value">€{{ parseFloat(showtime.Price).toFixed(2) }}</div>
                  </div>
                </div>
              </div>

              <!-- Book Button -->
              <button class="btn-book-now">BOOK NOW</button>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="no-results">
          <p>🎬 No showtimes available for the selected filters.</p>
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
  </div>
</template>

<style scoped>
.booking-container {
  background: var(--bg-dark);
  min-height: 100vh;
  padding-bottom: 3rem;
}

.booking-header {
  background: linear-gradient(135deg, var(--primary-orange) 0%, var(--primary-orange-light) 50%, var(--bg-darker) 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.header-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0.5rem 0 0 0;
}

.showtimes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.showtime-item {
  animation: slideIn 0.3s ease-out;
}

.showtime-card {
  background: linear-gradient(135deg, var(--bg-darker) 0%, var(--bg-card) 100%);
  border: 2px solid var(--border-dark);
  border-radius: 12px;
  padding: 1.5rem;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.showtime-card:hover {
  border-color: var(--primary-orange);
  box-shadow: 0 12px 30px rgba(255, 107, 0, 0.3);
  transform: translateY(-5px);
}

.movie-info-header {
  border-bottom: 2px solid var(--primary-orange);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.movie-title {
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  word-wrap: break-word;
}

.showtime-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  color: white;
}

.detail-icon {
  font-size: 1.3rem;
  min-width: 1.5rem;
  text-align: center;
}

.detail-label {
  display: block;
  color: #aaa;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #fff;
  font-weight: 600;
  margin-top: 0.2rem;
}

.time-large {
  font-size: 1.3rem;
  color: var(--primary-orange-light);
}

.format-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--primary-cyan), var(--primary-cyan-dark));
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 0.3rem;
}

.price-row {
  background: linear-gradient(135deg, rgba(255, 107, 0, 0.1), transparent);
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid var(--primary-orange);
}

.price-value {
  font-size: 1.3rem;
  color: var(--primary-cyan);
  font-weight: 700;
}

.btn-book-now {
  width: 100%;
  background: linear-gradient(135deg, var(--primary-orange), var(--primary-orange-light));
  color: white;
  border: none;
  padding: 0.85rem;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 1px;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
}

.btn-book-now:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(255, 107, 0, 0.4);
}

.no-results {
  background: var(--bg-darker);
  padding: 3rem 2rem;
  border-radius: 8px;
  text-align: center;
  color: #999;
  border: 2px dashed var(--border-dark);
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .header-title {
    font-size: 1.8rem;
  }

  .showtimes-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    font-size: 0.9rem;
  }
}
</style>
