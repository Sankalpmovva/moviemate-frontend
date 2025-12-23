<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getMovieById, getShowtimesByMovie } from '../services/api';
import { useAuth, getAccount, createBooking } from '../services/auth.js';

const route = useRoute();
const router = useRouter();
const movieId = route.params.id;

const { user, isLoggedIn } = useAuth();

const movie = ref(null);
const showtimes = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedTheatre = ref('all');
const selectedDate = ref('all');
const currentPage = ref(1);
const itemsPerPage = 5;

// Booking modal state
const showBookingModal = ref(false);
const selectedShowtime = ref(null);
const ticketCount = ref(1);
const userBalance = ref(0);
const bookingLoading = ref(false);
const bookingMessage = ref('');

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

const totalPrice = computed(() => {
  if (!selectedShowtime.value) return 0;
  return parseFloat(selectedShowtime.value.Price) * ticketCount.value;
});

const hasInsufficientBalance = computed(() => {
  return totalPrice.value > userBalance.value;
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
  const match = timeStr.match(/T(\d{2}:\d{2})/);
  if (match) {
    return match[1];
  }
  return timeStr.split('.')[0].substring(0, 5);
};

const openBookingModal = async (show) => {
  if (!isLoggedIn.value) {
    router.push('/login');
    return;
  }

  selectedShowtime.value = show;
  ticketCount.value = 1;
  bookingMessage.value = '';
  
  // Fetch current balance
  try {
    const accountData = await getAccount(user.value.accountId);
    if (accountData) {
      userBalance.value = parseFloat(accountData.Account_Balance) || 0;
    }
  } catch (err) {
    console.error('Error fetching balance:', err);
    userBalance.value = 0;
  }
  
  showBookingModal.value = true;
};

const closeBookingModal = () => {
  showBookingModal.value = false;
  selectedShowtime.value = null;
  ticketCount.value = 1;
  bookingMessage.value = '';
};

const confirmBooking = async () => {
  if (!selectedShowtime.value || !user.value) return;
  
  bookingLoading.value = true;
  bookingMessage.value = '';
  
  try {
    const result = await createBooking(
      selectedShowtime.value.Show_ID,
      user.value.accountId,
      ticketCount.value,
      totalPrice.value
    );
    
    bookingMessage.value = 'Booking successful! Redirecting to your bookings...';
    
    setTimeout(() => {
      closeBookingModal();
      router.push('/bookings');
    }, 2000);
  } catch (err) {
    if (err.response?.data?.error === 'Insufficient balance') {
      bookingMessage.value = `Insufficient balance. You need €${totalPrice.value.toFixed(2)} but have €${userBalance.value.toFixed(2)}. Please add funds to your wallet.`;
    } else {
      bookingMessage.value = err.response?.data?.error || 'Booking failed. Please try again.';
    }
  } finally {
    bookingLoading.value = false;
  }
};

onMounted(async () => {
  try {
    const [movieData, showtimesData] = await Promise.all([
      getMovieById(movieId),
      getShowtimesByMovie(movieId)
    ]);
    
    movie.value = movieData;
    showtimes.value = showtimesData;
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
    <!-- Loading -->
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
                      <div v-for="show in dateGroup.shows" :key="show.Show_ID" class="showtime-card">
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
                        <button class="btn btn-warning btn-book" @click="openBookingModal(show)">
                          BOOK SEAT
                        </button>
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
                  <p>🎬 No showtimes available.</p>
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

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="modal-overlay" @click="closeBookingModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Book Your Seats</h4>
          <button class="btn-close" @click="closeBookingModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedShowtime">
            <div class="booking-details">
              <h5>{{ movie.Title }}</h5>
              <p><strong>Date:</strong> {{ formatDate(selectedShowtime.Show_Date?.split('T')[0]) }}</p>
              <p><strong>Time:</strong> {{ getTimeOnly(selectedShowtime.Start_Time) }}</p>
              <p><strong>Theatre:</strong> {{ getTheatreName(selectedShowtime.theaters) }}, {{ getTheatreCity(selectedShowtime.theaters) }}</p>
              <p><strong>Format:</strong> {{ getFormatName(selectedShowtime.formats) }}</p>
              <p><strong>Price per ticket:</strong> €{{ parseFloat(selectedShowtime.Price).toFixed(2) }}</p>
            </div>
            
            <div class="ticket-selector mt-4">
              <label class="form-label"><strong>Number of Tickets:</strong></label>
              <div class="d-flex align-items-center gap-3">
                <button class="btn btn-outline-secondary" @click="ticketCount = Math.max(1, ticketCount - 1)" :disabled="ticketCount <= 1">-</button>
                <span class="ticket-count">{{ ticketCount }}</span>
                <button class="btn btn-outline-secondary" @click="ticketCount = Math.min(10, ticketCount + 1)" :disabled="ticketCount >= 10">+</button>
              </div>
            </div>
            
            <div class="payment-summary mt-4">
              <div class="summary-row">
                <span>Your Balance:</span>
                <span class="balance-amount">€{{ userBalance.toFixed(2) }}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total Price:</span>
                <span class="total-amount">€{{ totalPrice.toFixed(2) }}</span>
              </div>
              <div v-if="hasInsufficientBalance" class="alert alert-warning mt-3">
                <strong>Insufficient Balance!</strong><br>
                You need €{{ (totalPrice - userBalance).toFixed(2) }} more. 
                <router-link to="/wallet" @click="closeBookingModal">Add funds to wallet</router-link>
              </div>
            </div>
            
            <div v-if="bookingMessage" class="alert mt-3" :class="bookingMessage.includes('successful') ? 'alert-success' : 'alert-danger'">
              {{ bookingMessage }}
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeBookingModal">Cancel</button>
          <button 
            class="btn btn-success" 
            @click="confirmBooking" 
            :disabled="bookingLoading || hasInsufficientBalance"
          >
            {{ bookingLoading ? 'Processing...' : 'Confirm Booking' }}
          </button>
        </div>
      </div>
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
.detail-row {
display: flex;
justify-content: space-between;
margin-bottom: 0.5rem;
}
.detail-label {
color: #999;
font-size: 0.9rem;
}
.detail-value {
color: #fff;
font-weight: 500;
font-size: 0.9rem;
}
.price-tag {
color: var(--primary-cyan);
font-weight: 700;
font-size: 1.1rem;
}
.btn-book {
width: 100%;
font-weight: 700;
padding: 0.75rem;
border-radius: 8px;
transition: all 0.3s ease;
}
.btn-book:hover {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
}
/* Modal Styles */
.modal-overlay {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.8);
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
padding: 1rem;
}
.modal-content {
background: #1a1a1a;
border-radius: 12px;
max-width: 600px;
width: 100%;
max-height: 90vh;
overflow-y: auto;
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}
.modal-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 1.5rem;
border-bottom: 2px solid #333;
}
.modal-header h4 {
margin: 0;
color: #fff;
}
.btn-close {
background: transparent;
border: none;
color: #fff;
font-size: 2rem;
cursor: pointer;
line-height: 1;
padding: 0;
width: 30px;
height: 30px;
}
.modal-body {
padding: 1.5rem;
color: #fff;
}
.booking-details p {
margin-bottom: 0.5rem;
color: #ddd;
}
.ticket-selector {
padding: 1rem;
background: #242424;
border-radius: 8px;
}
.ticket-count {
font-size: 1.5rem;
font-weight: 700;
color: #fff;
min-width: 40px;
text-align: center;
}
.payment-summary {
padding: 1rem;
background: #242424;
border-radius: 8px;
}
.summary-row {
display: flex;
justify-content: space-between;
margin-bottom: 0.75rem;
color: #ddd;
}
.total-row {
font-size: 1.2rem;
font-weight: 700;
padding-top: 0.75rem;
border-top: 2px solid #444;
color: #fff;
}
.balance-amount {
color: #4CAF50;
font-weight: 600;
}
.total-amount {
color: var(--primary-orange);
font-weight: 700;
}
.modal-footer {
padding: 1.5rem;
border-top: 2px solid #333;
display: flex;
justify-content: flex-end;
gap: 1rem;
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
.modal-content {
margin: 1rem;
}
}
</style>