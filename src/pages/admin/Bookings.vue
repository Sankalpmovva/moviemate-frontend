<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../services/auth.js';
import axios from 'axios';

const router = useRouter();
const { user, isLoggedIn } = useAuth();

// Check if user is admin
if (!isLoggedIn.value || !user.value) {
  router.push('/login');
}

const API_BASE = 'http://localhost:2112/admin';

// State
const bookings = ref([]);
const stats = ref(null);
const loading = ref(false);
const error = ref('');
const success = ref('');

// Filters
const searchQuery = ref('');
const statusFilter = ref('all');
const dateFrom = ref('');
const dateTo = ref('');
const sortBy = ref('Booking_Date');
const sortOrder = ref('desc');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalPages = ref(1);

// Selected booking for details
const selectedBooking = ref(null);
const showDetailsModal = ref(false);

// Fetch bookings
const fetchBookings = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = localStorage.getItem('token');
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      status: statusFilter.value,
      search: searchQuery.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    };

    if (dateFrom.value) params.dateFrom = dateFrom.value;
    if (dateTo.value) params.dateTo = dateTo.value;

    const res = await axios.get(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });

    bookings.value = res.data.bookings;
    totalPages.value = res.data.pagination.totalPages;
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load bookings';
  } finally {
    loading.value = false;
  }
};

// Fetch statistics
const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE}/bookings/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    stats.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

// View booking details
const viewDetails = async (bookingId) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    selectedBooking.value = res.data;
    showDetailsModal.value = true;
  } catch (err) {
    error.value = 'Failed to load booking details';
  }
};

// Cancel booking
const cancelBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to cancel this booking? The amount will be refunded.')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_BASE}/bookings/${bookingId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    success.value = 'Booking cancelled successfully';
    await fetchBookings();
    await fetchStats();
    setTimeout(() => success.value = '', 3000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to cancel booking';
  }
};

// Reactivate booking
const reactivateBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to reactivate this booking?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_BASE}/bookings/${bookingId}/reactivate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    success.value = 'Booking reactivated successfully';
    await fetchBookings();
    await fetchStats();
    setTimeout(() => success.value = '', 3000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to reactivate booking';
  }
};

// Reset filters
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  dateFrom.value = '';
  dateTo.value = '';
  currentPage.value = 1;
  fetchBookings();
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '00:00';
  const match = timeStr.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : timeStr.substring(0, 5);
};

// Watch filters
watch([searchQuery, statusFilter, dateFrom, dateTo, sortBy, sortOrder], () => {
  currentPage.value = 1;
  fetchBookings();
});

// Pagination
const goToPage = (page) => {
  currentPage.value = page;
  fetchBookings();
};

onMounted(async () => {
  await fetchStats();
  await fetchBookings();
});
</script>

<template>
  <div class="admin-container">
    <div class="container-fluid mt-4">
      <!-- Header -->
      <div class="admin-header">
        <h2>Booking Management</h2>
        <router-link to="/admin/dashboard" class="btn btn-outline-light">
          Back to Dashboard
        </router-link>
      </div>

      <!-- Alerts -->
      <div v-if="error" class="alert alert-danger alert-dismissible fade show">
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" @click="error = ''"></button>
      </div>
      <div v-if="success" class="alert alert-success alert-dismissible fade show">
        <strong>Success:</strong> {{ success }}
        <button type="button" class="btn-close" @click="success = ''"></button>
      </div>

      <!-- Statistics Cards -->
      <div v-if="stats" class="stats-grid mb-4">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Bookings</div>
            <div class="stat-value">{{ stats.totalBookings }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon active">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Active Bookings</div>
            <div class="stat-value">{{ stats.activeBookings }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon cancelled">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Cancelled</div>
            <div class="stat-value">{{ stats.cancelledBookings }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value">€{{ stats.totalRevenue.toFixed(2) }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon today">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Today's Bookings</div>
            <div class="stat-value">{{ stats.todayBookings }}</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-panel">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Email or movie title..."
            />
          </div>

          <div class="col-md-2">
            <label class="form-label">Status</label>
            <select v-model="statusFilter" class="form-select">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">From Date</label>
            <input v-model="dateFrom" type="date" class="form-control" />
          </div>

          <div class="col-md-2">
            <label class="form-label">To Date</label>
            <input v-model="dateTo" type="date" class="form-control" />
          </div>

          <div class="col-md-2">
            <label class="form-label">Sort By</label>
            <select v-model="sortBy" class="form-select">
              <option value="Booking_Date">Booking Date</option>
              <option value="Total_Price">Price</option>
              <option value="Tickets">Tickets</option>
            </select>
          </div>

          <div class="col-md-1">
            <label class="form-label">Order</label>
            <select v-model="sortOrder" class="form-select">
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>

        <div class="mt-3">
          <button class="btn btn-secondary btn-sm" @click="resetFilters">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="table-container">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <table v-else class="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Movie</th>
              <th>Theatre</th>
              <th>Show Date</th>
              <th>Show Time</th>
              <th>Tickets</th>
              <th>Total</th>
              <th>Booked On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.Booking_ID">
              <td>#{{ booking.Booking_ID }}</td>
              <td>
                <div class="customer-info">
                  <div class="customer-name">
                    {{ booking.accounts?.First_Name }} {{ booking.accounts?.Last_Name }}
                  </div>
                  <div class="customer-email">{{ booking.accounts?.Email }}</div>
                </div>
              </td>
              <td>
                <div class="movie-info">
                  {{ booking.showtimes?.movies?.Title || 'N/A' }}
                </div>
              </td>
              <td>{{ booking.showtimes?.theaters?.Name || 'N/A' }}</td>
              <td>{{ formatDate(booking.showtimes?.Show_Date).split(',')[0] }}</td>
              <td>{{ formatTime(booking.showtimes?.Start_Time) }}</td>
              <td>{{ booking.Tickets }}</td>
              <td class="price-cell">€{{ parseFloat(booking.Total_Price).toFixed(2) }}</td>
              <td>{{ formatDate(booking.Booking_Date) }}</td>
              <td>
                <span class="badge" :class="booking.IsActive ? 'bg-success' : 'bg-secondary'">
                  {{ booking.IsActive ? 'Active' : 'Cancelled' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn btn-sm btn-info"
                    @click="viewDetails(booking.Booking_ID)"
                  >
                    View
                  </button>
                  <button 
                    v-if="booking.IsActive"
                    class="btn btn-sm btn-danger"
                    @click="cancelBooking(booking.Booking_ID)"
                  >
                    Cancel
                  </button>
                  <button 
                    v-else
                    class="btn btn-sm btn-success"
                    @click="reactivateBooking(booking.Booking_ID)"
                  >
                    Reactivate
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!loading && bookings.length === 0" class="empty-state">
          <p>No bookings found</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                Previous
              </button>
            </li>
            <li 
              v-for="page in totalPages" 
              :key="page" 
              class="page-item" 
              :class="{ active: currentPage === page }"
            >
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal && selectedBooking" class="modal-overlay" @click="showDetailsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Booking Details #{{ selectedBooking.Booking_ID }}</h4>
          <button class="btn-close" @click="showDetailsModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h6>Customer Information</h6>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Name:</span>
                <span class="value">{{ selectedBooking.accounts?.First_Name }} {{ selectedBooking.accounts?.Last_Name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ selectedBooking.accounts?.Email }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Balance:</span>
                <span class="value">€{{ parseFloat(selectedBooking.accounts?.Account_Balance || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h6>Show Information</h6>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Movie:</span>
                <span class="value">{{ selectedBooking.showtimes?.movies?.Title }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Theatre:</span>
                <span class="value">{{ selectedBooking.showtimes?.theaters?.Name }}, {{ selectedBooking.showtimes?.theaters?.City }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Format:</span><span class="value">{{ selectedBooking.showtimes?.formats?.Name }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Show Date:</span>
            <span class="value">{{ formatDate(selectedBooking.showtimes?.Show_Date).split(',')[0] }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Show Time:</span>
            <span class="value">{{ formatTime(selectedBooking.showtimes?.Start_Time) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h6>Booking Information</h6>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Number of Tickets:</span>
            <span class="value">{{ selectedBooking.Tickets }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Total Price:</span>
            <span class="value price">€{{ parseFloat(selectedBooking.Total_Price).toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Payment Method:</span>
            <span class="value">{{ selectedBooking.Payment_Method || 'Wallet' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Booking Date:</span>
            <span class="value">{{ formatDate(selectedBooking.Booking_Date) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Status:</span>
            <span class="badge" :class="selectedBooking.IsActive ? 'bg-success' : 'bg-secondary'">
              {{ selectedBooking.IsActive ? 'Active' : 'Cancelled' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" @click="showDetailsModal = false">Close</button>
      <button 
        v-if="selectedBooking.IsActive"
        class="btn btn-danger"
        @click="cancelBooking(selectedBooking.Booking_ID); showDetailsModal = false"
      >
        Cancel Booking
      </button>
      <button 
        v-else
        class="btn btn-success"
        @click="reactivateBooking(selectedBooking.Booking_ID); showDetailsModal = false"
      >
        Reactivate Booking
      </button>
    </div>
  </div>
</div>
  </div>
</template>
<style scoped>
.admin-container {
  background: #0a0a0a;
  min-height: 100vh;
  padding-bottom: 3rem;
  color: #fff;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ff6b00;
}

.admin-header h2 {
  margin: 0;
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #ff6b00;
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.cancelled {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #fad961 0%, #ff6b00 100%);
}

.stat-icon.today {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #999;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
}

/* Filters Panel */
.filters-panel {
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-control,
.form-select {
  background: #0a0a0a;
  border: 2px solid #333;
  color: #fff;
}

.form-control:focus,
.form-select:focus {
  background: #0a0a0a;
  border-color: #ff6b00;
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
}

.form-label {
  color: #999;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

/* Table */
.table-container {
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.table {
  margin: 0;
  color: #fff;
}

.table thead {
  background: #0a0a0a;
  border-bottom: 2px solid #333;
}

.table thead th {
  border: none;
  padding: 1rem;
  font-weight: 600;
  color: #ff6b00;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.table tbody tr {
  border-bottom: 1px solid #333;
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background: #222;
}

.table tbody td {
  padding: 1rem;
  vertical-align: middle;
  border: none;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #fff;
}

.customer-email {
  font-size: 0.85rem;
  color: #999;
}

.movie-info {
  font-weight: 500;
}

.price-cell {
  color: #4facfe;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

/* Pagination */
.pagination-container {
  margin-top: 2rem;
}

.pagination .page-link {
  background: #1a1a1a;
  border: 2px solid #333;
  color: #fff;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
}

.pagination .page-link:hover {
  background: #ff6b00;
  border-color: #ff6b00;
  color: #fff;
}

.pagination .page-item.active .page-link {
  background: #ff6b00;
  border-color: #ff6b00;
}

.pagination .page-item.disabled .page-link {
  background: #0a0a0a;
  border-color: #333;
  color: #666;
}

/* Modal */
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
  max-width: 800px;
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
  color: #ff6b00;
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
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h6 {
  color: #ff6b00;
  margin-bottom: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #0a0a0a;
  border-radius: 6px;
  border: 1px solid #333;
}

.detail-item .label {
  color: #999;
  font-weight: 500;
}

.detail-item .value {
  color: #fff;
  font-weight: 500;
  text-align: right;
}

.detail-item .value.price {
  color: #4facfe;
  font-weight: 600;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 2px solid #333;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>