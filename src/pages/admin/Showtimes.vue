<template>
  <div class="admin-container">
    <div class="container mt-4">
      <!-- Header -->
      <div class="admin-header">
        <h2>Showtime Management</h2>
        <router-link to="/admin/dashboard" class="btn btn-outline-light btn-sm">
        Back to Dashboard
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

        <div class="col-md-3">
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
      <button class="btn btn-sm btn-secondary w-150" @click="resetFilters">
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
                          class="btn btn-sm btn-info" 
                          @click="openActionsModal(showtime)"
                        >
                          Actions
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

  <!-- Actions Modal -->
<div v-if="showActionsModal && selectedShowtimeForAction" class="modal-overlay" @click="closeActionsModal">
  <div class="modal-content-custom" @click.stop>
    <div class="modal-header-custom">
      <h5>Manage Showtime</h5>
      <button class="btn-close-custom" @click="closeActionsModal">&times;</button>
    </div>
    
    <div class="modal-body-custom">
      <!-- Showtime Info -->
      <div class="showtime-info-box">
        <h6>{{ selectedShowtimeForAction.movies?.Title }}</h6>
        <p class="text-muted mb-0">
          {{ formatDate(selectedShowtimeForAction.Show_Date) }} at {{ formatTime(selectedShowtimeForAction.Start_Time) }}
        </p>
        <p class="text-muted mb-0">{{ selectedShowtimeForAction.theaters?.Name }}</p>
      </div>

      <!-- Current Status -->
      <div class="status-box">
        <div class="status-row">
          <span>Booking Status:</span>
          <span :class="selectedShowtimeForAction.Booking_Enabled ? 'badge bg-success' : 'badge bg-secondary'">
            {{ selectedShowtimeForAction.Booking_Enabled ? 'Open' : 'Closed' }}
          </span>
        </div>
        <div class="status-row">
          <span>Capacity:</span>
          <span class="fw-bold">{{ selectedShowtimeForAction.Total_Capacity || 5 }} seats</span>
        </div>
        <div class="status-row">
          <span>Booked:</span>
          <span class="fw-bold">{{ selectedShowtimeForAction.Booked_Seats || 0 }} seats</span>
        </div>
        <div class="status-row">
          <span>Available:</span>
          <span class="fw-bold text-success">
            {{ (selectedShowtimeForAction.Total_Capacity || 5) - (selectedShowtimeForAction.Booked_Seats || 0) }} seats
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <h6 class="mb-3">Actions</h6>
        
        <!-- Toggle Booking -->
        <button 
          class="action-btn"
          :class="selectedShowtimeForAction.Booking_Enabled ? 'btn-danger' : 'btn-success'"
          @click="toggleBookingStatus"
        >
          {{ selectedShowtimeForAction.Booking_Enabled ? 'Close Booking' : 'Open Booking' }}
        </button>

        <!-- Change Capacity -->
        <div class="capacity-actions">
          <label class="action-label">Change Capacity:</label>
          <div class="capacity-buttons">
            <button class="btn btn-sm btn-outline-light" @click="updateCapacity(5)">5</button>
            <button class="btn btn-sm btn-outline-light" @click="updateCapacity(10)">10</button>
            <button class="btn btn-sm btn-outline-light" @click="updateCapacity(20)">20</button>
            <button class="btn btn-sm btn-outline-light" @click="updateCapacity(50)">50</button>
            <button class="btn btn-sm btn-outline-light" @click="updateCapacity(100)">100</button>
          </div>
        </div>

        <!-- Delete -->
        <button 
          class="action-btn btn-danger-outline mt-3"
          @click="deleteShowtime(selectedShowtimeForAction.Show_ID); closeActionsModal()"
        >
          Delete Showtime
        </button>
      </div>
    </div>

    <div class="modal-footer-custom">
      <button class="btn btn-secondary" @click="closeActionsModal">Close</button>
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
const showActionsModal = ref(false);
const selectedShowtimeForAction = ref(null);

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

//admin feat: open/close booking and update capacity

const openActionsModal = (showtime) => {
  selectedShowtimeForAction.value = showtime;
  showActionsModal.value = true;
};

const closeActionsModal = () => {
  showActionsModal.value = false;
  selectedShowtimeForAction.value = null;
};

const toggleBookingStatus = async () => {
  if (!selectedShowtimeForAction.value) return;
  
  const newStatus = !selectedShowtimeForAction.value.Booking_Enabled;
  const action = newStatus ? 'open' : 'close';
  
  if (!confirm(`Are you sure you want to ${action} booking for this showtime?`)) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${API_BASE}/showtimes/${selectedShowtimeForAction.value.Show_ID}/capacity`,
      { Booking_Enabled: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    success.value = `Booking ${action}ed successfully!`;
    closeActionsModal();
    await loadShowtimes();
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    error.value = `Failed to ${action} booking`;
  }
};

const updateCapacity = async (newCapacity) => {
  if (!selectedShowtimeForAction.value) return;
  
  if (!confirm(`Change capacity to ${newCapacity} seats?`)) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${API_BASE}/showtimes/${selectedShowtimeForAction.value.Show_ID}/capacity`,
      { Total_Capacity: newCapacity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    success.value = 'Capacity updated successfully!';
    closeActionsModal();
    await loadShowtimes();
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    error.value = 'Failed to update capacity';
  }
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

/* Actions Modal */
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

.modal-content-custom {
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #333;
}

.modal-header-custom h5 {
  margin: 0;
  color: #ff6b00;
}

.btn-close-custom {
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

.modal-body-custom {
  padding: 1.5rem;
}

.showtime-info-box {
  background: #0a0a0a;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.showtime-info-box h6 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.status-box {
  background: #0a0a0a;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.status-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #222;
}

.status-row:last-child {
  border-bottom: none;
}

.actions-section h6 {
  color: #ff6b00;
  font-weight: 600;
}

.action-btn {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #333;
  border-radius: 8px;
  background: #0a0a0a;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

.action-btn.btn-danger {
  border-color: #dc3545;
  background: #dc3545;
}

.action-btn.btn-danger:hover {
  background: #bb2d3b;
}

.action-btn.btn-success {
  border-color: #28a745;
  background: #28a745;
}

.action-btn.btn-success:hover {
  background: #218838;
}

.action-btn.btn-danger-outline {
  border-color: #dc3545;
  background: transparent;
  color: #dc3545;
}

.action-btn.btn-danger-outline:hover {
  background: #dc3545;
  color: #fff;
}

.capacity-actions {
  margin-top: 1rem;
}

.action-label {
  display: block;
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.capacity-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.capacity-buttons .btn {
  flex: 1;
  min-width: 60px;
  background: #0a0a0a;
  border: 2px solid #333;
  color: #fff;
}

.capacity-buttons .btn:hover {
  border-color: #ff6b00;
  background: #ff6b00;
}

.modal-footer-custom {
  padding: 1.5rem;
  border-top: 2px solid #333;
  text-align: right;
}
</style>