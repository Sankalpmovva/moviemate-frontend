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
const selectedLanguage = ref('all');
const selectedFormat = ref('all');
const showAllShowtimes = ref(false);

// Booking modal state
const showBookingModal = ref(false);
const selectedShowtime = ref(null);
const ticketCount = ref(1);
const userBalance = ref(0);
const bookingLoading = ref(false);
const bookingMessage = ref('');

// Extract unique languages from showtimes
const uniqueLanguages = computed(() => {
  const languages = [...new Set(showtimes.value.map(s => {
    
    const spokenLang = s.languages_showtimes_Language_IDTolanguages;
    if (spokenLang && typeof spokenLang === 'object') {
      return spokenLang.Name || spokenLang.language_name || 'Unknown';
    }
    return 'Unknown';
  }).filter(Boolean))];
  
  return [
    { id: 'all', label: 'All Languages' },
    ...languages.sort().map(lang => ({
      id: lang,
      label: lang
    }))
  ];
});

// Extract unique formats from showtimes
const uniqueFormats = computed(() => {
  const formats = [...new Set(showtimes.value.map(s => s.formats?.Name || 'Standard').filter(Boolean))];
  return [
    { id: 'all', label: 'All Formats' },
    ...formats.sort().map(format => ({
      id: format,
      label: format
    }))
  ];
});

// Extract unique dates from showtimes
const uniqueDates = computed(() => {
  const dates = [...new Set(showtimes.value.map(s => s.Show_Date?.split('T')[0]).filter(Boolean))];
  return [
    { id: 'all', label: 'All Dates' },
    ...dates.sort().map(date => ({
      id: date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
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
  return [
    { Theatre_ID: 'all', Name: 'All Theatres', City: '' },
    ...Object.values(theatreMap)
  ];
});

// Filtered showtimes based on selection
const filteredShowtimes = computed(() => {
  return showtimes.value.filter(showtime => {
    const dateMatch = selectedDate.value === 'all' || showtime.Show_Date?.split('T')[0] === selectedDate.value;
    
    let theatreMatch = true;
    if (selectedTheatre.value !== 'all') {
      theatreMatch = showtime.Theater_ID === parseInt(selectedTheatre.value);
    }
    
    let languageMatch = true;
    if (selectedLanguage.value !== 'all') {
      const spokenLang = showtime.languages_showtimes_Language_IDTolanguages;
      if (spokenLang && typeof spokenLang === 'object') {
        const languageName = spokenLang.Name || spokenLang.language_name || 'Unknown';
        languageMatch = languageName === selectedLanguage.value;
      } else {
        languageMatch = false;
      }
    }
    
    let formatMatch = true;
    if (selectedFormat.value !== 'all') {
      const showFormat = showtime.formats?.Name || 'Standard';
      formatMatch = showFormat === selectedFormat.value;
    }
    
    return dateMatch && theatreMatch && languageMatch && formatMatch;
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

// Show limited or all showtimes
const displayedShowtimes = computed(() => {
  if (showAllShowtimes.value || groupedShowtimes.value.length === 0) {
    return groupedShowtimes.value;
  }
  
  // Take first 3 dates or until we have 8 showtimes
  const result = [];
  let totalShows = 0;
  
  for (const group of groupedShowtimes.value) {
    const limitedShows = group.shows.slice(0, 8); // Max 8 shows per date
    result.push({
      date: group.date,
      shows: limitedShows
    });
    totalShows += limitedShows.length;
    
    if (result.length >= 3 || totalShows >= 8) break;
  }
  
  return result;
});

const hasMoreShowtimes = computed(() => {
  const totalShows = groupedShowtimes.value.reduce((sum, group) => sum + group.shows.length, 0);
  const displayedShows = displayedShowtimes.value.reduce((sum, group) => sum + group.shows.length, 0);
  return totalShows > displayedShows;
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedTheatre.value !== 'all') count++;
  if (selectedDate.value !== 'all') count++;
  if (selectedLanguage.value !== 'all') count++;
  if (selectedFormat.value !== 'all') count++;
  return count;
});

const resetFilters = () => {
  selectedTheatre.value = 'all';
  selectedDate.value = 'all';
  selectedLanguage.value = 'all';
  selectedFormat.value = 'all';
};

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
  return date.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
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

const getLanguageDisplay = (show) => {
  const spokenLang = show.languages_showtimes_Language_IDTolanguages;
  if (spokenLang && typeof spokenLang === 'object') {
    return spokenLang.Name || spokenLang.language_name || 'Unknown';
  }
  return 'Unknown';
};

const getTimeOnly = (timeStr) => {
  if (!timeStr) return '00:00';
  const date = new Date(timeStr);
  return date.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const openBookingModal = async (show) => {
  if (!isLoggedIn.value) {
    router.push('/login');
    return;
  }

  selectedShowtime.value = show;
  ticketCount.value = 1;
  bookingMessage.value = '';
  
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

// Movie rating in stars
const ratingStars = computed(() => {
  if (!movie.value || !movie.value.Rating) return [];
  const rating = parseFloat(movie.value.Rating);
  const fullStars = Math.floor(rating / 2);
  const halfStar = rating % 2 >= 1 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  return {
    full: fullStars,
    half: halfStar,
    empty: emptyStars
  };
});

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
                  <div class="row g-3">
                    <div class="col-md-6 col-lg-3">
                      <label class="filter-label">Theatre</label>
                      <select v-model="selectedTheatre" class="form-select filter-select">
                        <option value="all">All Theatres</option>
                        <option v-for="theatre in uniqueTheatres.filter(t => t.Theatre_ID !== 'all')" 
                                :key="theatre.Theatre_ID" 
                                :value="theatre.Theatre_ID">
                          {{ theatre.Name }} ({{ theatre.City }})
                        </option>
                      </select>
                    </div>
                    <div class="col-md-6 col-lg-3">
                      <label class="filter-label">Date</label>
                      <select v-model="selectedDate" class="form-select filter-select">
                        <option v-for="date in uniqueDates" :key="date.id" :value="date.id">
                          {{ date.label }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-6 col-lg-3">
                      <label class="filter-label">Language</label>
                      <select v-model="selectedLanguage" class="form-select filter-select">
                        <option v-for="lang in uniqueLanguages" :key="lang.id" :value="lang.id">
                          {{ lang.label }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-6 col-lg-3">
                      <label class="filter-label">Format</label>
                      <select v-model="selectedFormat" class="form-select filter-select">
                        <option v-for="format in uniqueFormats" :key="format.id" :value="format.id">
                          {{ format.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div v-if="filteredShowtimes.length" class="showtimes-wrapper">
                  <!-- Showtimes Grid by Date -->
                  <div v-for="dateGroup in displayedShowtimes" :key="dateGroup.date" class="date-group">
                    <h6 class="date-header">{{ formatDate(dateGroup.date) }}</h6>
                    <div class="showtimes-grid">
                      <div v-for="show in dateGroup.shows" :key="show.Show_ID" class="showtime-card">
                        <div class="showtime-header">
                          <div class="time-display">{{ getTimeOnly(show.Start_Time) }}</div>
                          <div class="badges">
                            <span class="format-badge">{{ getFormatName(show.formats) }}</span>
                            <span class="language-badge">{{ getLanguageDisplay(show) }}</span>
                          </div>
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
                            <span class="detail-label">Seats:</span>
                            <span class="detail-value">{{ show.Available_Seats || 'N/A' }} available</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Price:</span>
                            <span class="price-tag">€{{ parseFloat(show.Price).toFixed(2) }}</span>
                          </div>
                        </div>
                        <button class="btn btn-warning btn-book" @click="openBookingModal(show)">
                          BOOK TICKETS
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Load More Button -->
                  <div v-if="hasMoreShowtimes" class="text-center mt-4">
                    <button class="btn btn-outline-warning" @click="showAllShowtimes = true">
                      View All {{ filteredShowtimes.length }} Showtimes
                    </button>
                  </div>
                </div>
                <div v-else class="no-showtimes">
                  <div class="empty-state">
                    <h6>No showtimes found</h6>
                    <p>Try adjusting your filters or check back later for new showtimes.</p>
                    <button class="btn btn-outline-secondary" @click="resetFilters">
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              <!-- Recommendations Section -->
              <div class="recommendations-section" v-if="false"> 
                <h5 class="section-title">You Might Also Like</h5>
                <div class="recommendations-grid">
                  <!-- Add recommendation cards here -->
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

.quick-info-card {
  background: var(--bg-darker);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid #333;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #333;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #999;
  font-size: 0.9rem;
}

.info-value {
  color: #fff;
  font-weight: 600;
}

.star-rating {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
}

.star.full {
  color: #FFD700;
}

.star.half {
  color: #FFD700;
  opacity: 0.7;
}

.star.empty {
  color: #555;
}

.rating-number {
  margin-left: 0.5rem;
  color: #fff;
  font-weight: 600;
}

.movie-header {
  margin-bottom: 2rem;
}

.movie-tagline {
  color: #ff6b00;
  font-style: italic;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.movie-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 10px;
  border: 1px solid #333;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-orange);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #999;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.additional-info {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--bg-darker);
  border-radius: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.info-card {
  padding: 1rem;
  background: #242424;
  border-radius: 8px;
  border-left: 3px solid var(--primary-orange);
}

.info-card h6 {
  color: #ff6b00;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-card p {
  color: #ddd;
  margin: 0;
  font-size: 0.95rem;
}

.age-rating {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #333;
  color: #fff;
  border-radius: 4px;
  font-weight: 700;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-summary {
  color: #999;
  font-size: 0.9rem;
}

.btn-clear-filters {
  background: transparent;
  border: none;
  color: #ff6b00;
  margin-left: 0.5rem;
  cursor: pointer;
  text-decoration: underline;
}

.btn-clear-filters:hover {
  color: #ff9500;
}

.badges {
  display: flex;
  gap: 0.5rem;
}

.language-badge {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: var(--bg-darker);
  border-radius: 10px;
  border: 2px dashed #444;
}

.empty-state h6 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #999;
  margin-bottom: 1.5rem;
}

.recommendations-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #333;
}

@media (max-width: 768px) {
  .movie-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .showtime-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .badges {
    width: 100%;
  }
}

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