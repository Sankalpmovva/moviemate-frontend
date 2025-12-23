<template>
  <div class="admin-container">
    <div class="container mt-4">
      <!-- Header -->
      <div class="admin-header">
        <h2>Showtime Management</h2>
        <router-link to="/admin" class="btn btn-outline-light btn-sm">
          ← Back to Admin
        </router-link>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>

      <!-- Main Content -->
      <div class="row">
        <!-- Left: Add Showtime Form -->
        <div class="col-md-4">
          <div class="card bg-dark text-light mb-4">
            <div class="card-header">
              <h5>➕ Add New Showtime</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="addShowtime">
                <!-- Movie Selection -->
                <div class="mb-3">
                  <label class="form-label">Movie *</label>
                  <select v-model="newShowtime.Movie_ID" class="form-select" required>
                    <option value="">Select Movie</option>
                    <option v-for="movie in movies" :key="movie.Movie_ID" :value="movie.Movie_ID">
                      {{ movie.Title }}
                    </option>
                  </select>
                </div>

                <!-- Theatre Selection -->
                <div class="mb-3">
                  <label class="form-label">Theatre *</label>
                  <select v-model="newShowtime.Theater_ID" class="form-select" required>
                    <option value="">Select Theatre</option>
                    <option v-for="theatre in theatres" :key="theatre.Theatre_ID" :value="theatre.Theatre_ID">
                      {{ theatre.Name }}, {{ theatre.City }}
                    </option>
                  </select>
                </div>

                <!-- Show Date -->
                <div class="mb-3">
                  <label class="form-label">Date *</label>
                  <input 
                    v-model="newShowtime.Show_Date" 
                    type="date" 
                    class="form-control" 
                    required
                  />
                </div>

                <!-- Start Time -->
                <div class="mb-3">
                  <label class="form-label">Start Time *</label>
                  <input 
                    v-model="newShowtime.Start_Time" 
                    type="time" 
                    class="form-control" 
                    required
                  />
                </div>

                <!-- Price -->
                <div class="mb-3">
                  <label class="form-label">Price (€) *</label>
                  <input 
                    v-model="newShowtime.Price" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    class="form-control" 
                    required
                    placeholder="12.50"
                  />
                </div>

                <!-- Format -->
                <div class="mb-3">
                  <label class="form-label">Format *</label>
                  <select v-model="newShowtime.Format_ID" class="form-select" required>
                    <option value="">Select Format</option>
                    <option v-for="format in formats" :key="format.Format_ID" :value="format.Format_ID">
                      {{ format.Name }}
                    </option>
                  </select>
                </div>

                <!-- Language -->
                <div class="mb-3">
                  <label class="form-label">Language *</label>
                  <select v-model="newShowtime.Language_ID" class="form-select" required>
                    <option value="">Select Language</option>
                    <option v-for="language in languages" :key="language.Language_ID" :value="language.Language_ID">
                      {{ language.Name }}
                    </option>
                  </select>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Add Showtime
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Right: Showtimes List -->
        <div class="col-md-8">
          <div class="card bg-dark text-light">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5>All Showtimes ({{ filteredShowtimes.length }})</h5>
      <button class="btn btn-sm btn-outline-light" @click="loadShowtimes" :disabled="loading">
        Refresh
      </button>
    </div>

    <!-- Filters Panel -->
    <div class="card-body border-bottom" style="background: #0a0a0a;">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label small text-muted">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm"
            placeholder="Movie or theatre..."
          />
        </div>

        <div class="col-md-2">
          <label class="form-label small text-muted">Movie</label>
          <select v-model="movieFilter" class="form-select form-select-sm">
            <option value="all">All Movies</option>
            <option v-for="movie in movies" :key="movie.Movie_ID" :value="movie.Movie_ID">
              {{ movie.Title }}
            </option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label small text-muted">Theatre</label>
          <select v-model="theatreFilter" class="form-select form-select-sm">
            <option value="all">All Theatres</option>
            <option v-for="theatre in theatres" :key="theatre.Theatre_ID" :value="theatre.Theatre_ID">
              {{ theatre.Name }}
            </option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label small text-muted">From Date</label>
          <input v-model="dateFrom" type="date" class="form-control form-control-sm" />
        </div>

        <div class="col-md-2">
          <label class="form-label small text-muted">To Date</label>
          <input v-model="dateTo" type="date" class="form-control form-control-sm" />
        </div>

    <div class="col-md-1 d-flex align-items-end">
      <button class="btn btn-sm btn-secondary w-100" @click="resetFilters">
        Reset
      </button>
    </div>
  </div>
</div>

<div class="card-body">
              <!-- Loading -->
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-warning"></div>
              </div>

              <!-- No Showtimes -->
              <div v-else-if="filteredShowtimes.length === 0" class="text-center py-4 text-muted">
                <p>No showtimes match your filters.</p>
                <button class="btn btn-sm btn-outline-light" @click="resetFilters">Clear Filters</button>
              </div>

              <!-- Showtimes Table -->
              <div v-else class="table-responsive">
                <table class="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th>Movie</th>
                      <th>Theatre</th>
                      <th>Date & Time</th>
                      <th>Format</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="showtime in filteredShowtimes" :key="showtime.Show_ID">
                      <td>
                        <strong>{{ showtime.movies?.Title }}</strong>
                      </td>
                      <td>{{ showtime.theaters?.Name }}, {{ showtime.theaters?.City }}</td>
                      <td>
                        {{ formatDate(showtime.Show_Date) }}<br>
                        <small class="text-warning">{{ formatTime(showtime.Start_Time) }}</small>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ showtime.formats?.Name }}</span>
                      </td>
                      <td class="text-success">€{{ showtime.Price }}</td>
                      <td>
                        <button 
                          class="btn btn-sm btn-danger" 
                          @click="deleteShowtime(showtime.Show_ID)"
                          :disabled="loading"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = 'http://localhost:2112/admin';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../services/auth.js';
import axios from 'axios';

const router = useRouter();
const { user, isLoggedIn } = useAuth();

// Check if user is admin
if (!isLoggedIn.value || !user.value?.isAdmin) {
  router.push('/login');
}

// State
const showtimes = ref([]);
const movies = ref([]);
const theatres = ref([]);
const formats = ref([]);
const languages = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');

// New showtime form
const newShowtime = ref({
  Movie_ID: '',
  Theater_ID: '',
  Show_Date: new Date().toISOString().split('T')[0],
  Start_Time: '19:00',
  Price: '12.50',
  Format_ID: '',
  Language_ID: ''
});

// Load dropdown data
const loadDropdowns = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE}/showtimes/dropdowns`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    movies.value = response.data.movies;
    theatres.value = response.data.theatres;
    formats.value = response.data.formats;
    languages.value = response.data.languages;
  } catch (err) {
    console.error('Error loading dropdowns:', err);
    error.value = 'Failed to load data';
  }
};

// Load showtimes
const loadShowtimes = async () => {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE}/showtimes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    showtimes.value = response.data;
  } catch (err) {
    console.error('Error loading showtimes:', err);
    error.value = 'Failed to load showtimes';
  } finally {
    loading.value = false;
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  // Handle ISO timestamp format
  const match = timeString.match(/T(\d{2}:\d{2})/);
  if (match) {
    return match[1];
  }
  // Handle HH:MM:SS format
  return timeString.substring(0, 5);
};

// Add new showtime
const addShowtime = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';
  
  try {
    const token = localStorage.getItem('token');
    await axios.post(`${API_BASE}/showtimes`, newShowtime.value, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    success.value = 'Showtime added successfully!';
    
    // Reset form
    newShowtime.value = {
      Movie_ID: '',
      Theater_ID: '',
      Show_Date: new Date().toISOString().split('T')[0],
      Start_Time: '19:00',
      Price: '12.50',
      Format_ID: '',
      Language_ID: ''
    };
    
    // Reload showtimes
    await loadShowtimes();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = '';
    }, 3000);
    
  } catch (err) {
    console.error('Error adding showtime:', err);
    error.value = err.response?.data?.error || 'Failed to add showtime';
  } finally {
    loading.value = false;
  }
};

// Delete showtime
const deleteShowtime = async (showtimeId) => {
  if (!confirm('Are you sure you want to delete this showtime?')) {
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE}/showtimes/${showtimeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    success.value = 'Showtime deleted successfully!';
    await loadShowtimes();
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
    
  } catch (err) {
    console.error('Error deleting showtime:', err);
    error.value = err.response?.data?.error || 'Failed to delete showtime';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadDropdowns();
  await loadShowtimes();
});

// Filter state
const searchQuery = ref('');
const movieFilter = ref('all');
const theatreFilter = ref('all');
const dateFrom = ref('');
const dateTo = ref('');

// Filtered showtimes
const filteredShowtimes = computed(() => {
  let result = [...showtimes.value];
  
  // Search filter (movie title or theatre name)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(showtime => 
      showtime.movies?.Title?.toLowerCase().includes(query) ||
      showtime.theaters?.Name?.toLowerCase().includes(query) ||
      showtime.theaters?.City?.toLowerCase().includes(query)
    );
  }
  
  // Movie filter
  if (movieFilter.value !== 'all') {
    result = result.filter(showtime => 
      showtime.Movie_ID === parseInt(movieFilter.value)
    );
  }
  
  // Theatre filter
  if (theatreFilter.value !== 'all') {
    result = result.filter(showtime => 
      showtime.Theater_ID === parseInt(theatreFilter.value)
    );
  }
  
  // Date range filter
  if (dateFrom.value) {
    const fromDate = new Date(dateFrom.value);
    result = result.filter(showtime => {
      const showtimeDate = new Date(showtime.Show_Date);
      return showtimeDate >= fromDate;
    });
  }
  
  if (dateTo.value) {
    const toDate = new Date(dateTo.value);
    toDate.setHours(23, 59, 59, 999); // End of day
    result = result.filter(showtime => {
      const showtimeDate = new Date(showtime.Show_Date);
      return showtimeDate <= toDate;
    });
  }
  
  return result;
});

// Reset filters function
const resetFilters = () => {
  searchQuery.value = '';
  movieFilter.value = 'all';
  theatreFilter.value = 'all';
  dateFrom.value = '';
  dateTo.value = '';
};
</script>

<style scoped>
.admin-container {
  background: #0a0a0a;
  min-height: 100vh;
  padding-bottom: 3rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ff6b00;
}

.form-control, .form-select {
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: white;
}

.form-control:focus, .form-select:focus {
  background-color: #1a1a1a;
  border-color: #ff6b00;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
}

.btn-primary {
  background-color: #ff6b00;
  border-color: #ff6b00;
}

.btn-primary:hover {
  background-color: #ff9500;
  border-color: #ff9500;
}
</style>