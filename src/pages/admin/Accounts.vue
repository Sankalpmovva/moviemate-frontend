<template>
  <div class="admin-container">
    <div class="container mt-4">
      <!-- Header -->
      <div class="admin-header">
        <h2>User Management</h2>
        <router-link to="/admin" class="btn btn-outline-light btn-sm">
          Back to Admin
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
      <div class="card bg-dark text-light">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5>User Accounts ({{ filteredUsers.length }})</h5>
          <button class="btn btn-sm btn-outline-light" @click="loadUsers" :disabled="loading">
            Refresh
          </button>
        </div>

        <!-- Filters Panel -->
        <div class="card-body border-bottom" style="background: #0a0a0a;">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Search</label>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control form-control-sm"
                placeholder="Name or email..."
              />
            </div>

            <div class="col-md-2">
              <label class="form-label small text-muted">Status</label>
              <select v-model="statusFilter" class="form-select form-select-sm">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div class="col-md-2">
              <label class="form-label small text-muted">Role</label>
              <select v-model="roleFilter" class="form-select form-select-sm">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div class="col-md-2">
              <label class="form-label small text-muted">Sort By</label>
              <select v-model="sortBy" class="form-select form-select-sm">
                <option value="created">Registration Date</option>
                <option value="name">Name</option>
                <option value="balance">Balance</option>
              </select>
            </div>

            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-sm btn-secondary w-100" @click="resetFilters">
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card-body">
          <!-- Loading -->
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-warning"></div>
          </div>

          <!-- No Users -->
          <div v-else-if="filteredUsers.length === 0" class="text-center py-4 text-muted">
            <p>No users match your filters.</p>
            <button class="btn btn-sm btn-outline-light" @click="resetFilters">Clear Filters</button>
          </div>

          <!-- Users Table -->
          <div v-else class="table-responsive">
            <table class="table table-dark table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Balance</th>
                  <th>Bookings</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.Account_ID">
                  <td>
                    <strong>{{ user.First_Name }} {{ user.Last_Name }}</strong>
                  </td>
                  <td>
                    <small>{{ user.Email }}</small>
                  </td>
                  <td class="text-success">
                    €{{ user.Account_Balance }}
                  </td>
                  <td>
                    <span class="badge bg-info">{{ user._count?.bookings || 0 }}</span>
                  </td>
                  <td>
                    <small>{{ formatDate(user.Created_At) }}</small>
                  </td>
                  <td>
                    <span :class="user.IsActive ? 'badge bg-success' : 'badge bg-danger'">
                      {{ user.IsActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <span :class="user.IsAdmin ? 'badge bg-warning' : 'badge bg-secondary'">
                      {{ user.IsAdmin ? 'Admin' : 'User' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-info"
                        @click="viewUserDetails(user)"
                        title="View Details"
                      >
                        Details
                      </button>
                      <button 
                        class="btn" 
                        :class="user.IsActive ? 'btn-outline-danger' : 'btn-outline-success'"
                        @click="toggleUserStatus(user)"
                        :title="user.IsActive ? 'Deactivate User' : 'Activate User'"
                      >
                        {{ user.IsActive ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button 
                        class="btn" 
                        :class="user.IsAdmin ? 'btn-outline-secondary' : 'btn-outline-warning'"
                        @click="toggleAdminStatus(user)"
                        :title="user.IsAdmin ? 'Remove Admin' : 'Make Admin'"
                      >
                        {{ user.IsAdmin ? 'Remove Admin' : 'Make Admin' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="selectedUser" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">User Details</h5>
          <button type="button" class="btn-close btn-close-white" @click="selectedUser = null"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">{{ selectedUser.First_Name }} {{ selectedUser.Last_Name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ selectedUser.Email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Account Balance:</span>
                <span class="detail-value text-success">€{{ selectedUser.Account_Balance }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Spent:</span>
                <span class="detail-value text-warning">€{{ selectedUser.totalSpent || 0 }}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-item">
                <span class="detail-label">Account Created:</span>
                <span class="detail-value">{{ formatDate(selectedUser.Created_At) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span :class="selectedUser.IsActive ? 'badge bg-success' : 'badge bg-danger'">
                  {{ selectedUser.IsActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Role:</span>
                <span :class="selectedUser.IsAdmin ? 'badge bg-warning' : 'badge bg-secondary'">
                  {{ selectedUser.IsAdmin ? 'Admin' : 'User' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Bookings:</span>
                <span class="detail-value">{{ selectedUser._count?.bookings || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Bookings -->
          <div v-if="selectedUser.bookings?.length > 0" class="mt-4">
            <h6 class="border-bottom pb-2 mb-3">Recent Bookings</h6>
            <div class="booking-list">
              <div v-for="booking in selectedUser.bookings" :key="booking.Booking_ID" class="booking-item">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <strong>{{ booking.showtimes?.movies?.Title }}</strong>
                    <div class="text-muted small">
                      {{ formatDate(booking.showtimes?.Show_Date) }} at {{ formatTime(booking.showtimes?.Start_Time) }}
                    </div>
                  </div>
                  <div class="col-md-3">
                    <span class="text-warning">{{ booking.Tickets }} tickets</span>
                  </div>
                  <div class="col-md-2 text-end">
                    <span class="text-success">€{{ booking.Total_Price }}</span>
                  </div>
                  <div class="col-md-1 text-end">
                    <span :class="booking.IsActive ? 'badge bg-success' : 'badge bg-danger'">
                      {{ booking.IsActive ? 'Active' : 'Cancelled' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="mt-4 text-center text-muted">
            <p>No booking history</p>
          </div>
        </div>
        <div class="modal-footer">
          <div class="btn-group w-100">
            <button 
              class="btn" 
              :class="selectedUser.IsActive ? 'btn-danger' : 'btn-success'"
              @click="toggleUserStatus(selectedUser)"
            >
              {{ selectedUser.IsActive ? 'Deactivate Account' : 'Activate Account' }}
            </button>
            <button 
              class="btn" 
              :class="selectedUser.IsAdmin ? 'btn-secondary' : 'btn-warning'"
              @click="toggleAdminStatus(selectedUser)"
            >
              {{ selectedUser.IsAdmin ? 'Remove Admin Role' : 'Grant Admin Role' }}
            </button>
            <button class="btn btn-outline-light" @click="selectedUser = null">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = 'http://localhost:2112/admin';
import { ref, onMounted, computed, watch } from 'vue'; // Added watch
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
const users = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const selectedUser = ref(null);

// Filter state
const searchQuery = ref('');
const statusFilter = ref('all');
const roleFilter = ref('all');
const sortBy = ref('created');

// Watch for filter changes and reload
watch([searchQuery, statusFilter, roleFilter], () => {
  // Debounce the search to avoid too many API calls
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadUsers();
  }, 500);
});

let searchTimeout;

// Load users
const loadUsers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    const params = {};
    
    // Only add params if they have values
    if (searchQuery.value && searchQuery.value.trim() !== '') {
      params.search = searchQuery.value.trim();
    }
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value;
    }
    if (roleFilter.value !== 'all') {
      params.role = roleFilter.value;
    }
    
    console.log('Sending params:', params); // Debug log
    
    const response = await axios.get(`${API_BASE}/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    users.value = response.data;
    console.log('Received users:', users.value.length); // Debug log
  } catch (err) {
    console.error('Error loading users:', err);
    console.error('Error details:', err.response?.data); // Debug log
    error.value = err.response?.data?.error || 'Failed to load users';
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
  const match = timeString.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  return timeString.substring(0, 5);
};

// View user details
const viewUserDetails = async (user) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE}/accounts/${user.Account_ID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    selectedUser.value = response.data;
  } catch (err) {
    console.error('Error loading user details:', err);
    error.value = 'Failed to load user details';
  }
};

// Toggle user active status
const toggleUserStatus = async (user) => {
  const newStatus = !user.IsActive;
  const action = newStatus ? 'activate' : 'deactivate';
  const message = newStatus 
    ? `Are you sure you want to activate ${user.First_Name} ${user.Last_Name}?` 
    : `Are you sure you want to deactivate ${user.First_Name} ${user.Last_Name}?`;
  
  if (!confirm(message)) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_BASE}/accounts/${user.Account_ID}`, {
      IsActive: newStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    success.value = `User ${action}d successfully`;
    
    // Update local state
    user.IsActive = newStatus;
    if (selectedUser.value?.Account_ID === user.Account_ID) {
      selectedUser.value.IsActive = newStatus;
    }
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
    
  } catch (err) {
    console.error(`Error ${action}ing user:`, err);
    error.value = err.response?.data?.error || `Failed to ${action} user`;
  } finally {
    loading.value = false;
  }
};

// Toggle admin status
const toggleAdminStatus = async (user) => {
  const newAdminStatus = !user.IsAdmin;
  const action = newAdminStatus ? 'grant admin role to' : 'remove admin role from';
  const message = `Are you sure you want to ${action} ${user.First_Name} ${user.Last_Name}?`;
  
  if (!confirm(message)) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_BASE}/accounts/${user.Account_ID}`, {
      IsAdmin: newAdminStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    success.value = `Admin role ${newAdminStatus ? 'granted' : 'removed'} successfully`;
    
    // Update local state
    user.IsAdmin = newAdminStatus;
    if (selectedUser.value?.Account_ID === user.Account_ID) {
      selectedUser.value.IsAdmin = newAdminStatus;
    }
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
    
  } catch (err) {
    console.error('Error updating admin status:', err);
    error.value = err.response?.data?.error || 'Failed to update admin role';
  } finally {
    loading.value = false;
  }
};

// Filtered users (client-side fallback)
const filteredUsers = computed(() => {
  let result = [...users.value];
  
  // Client-side filtering as fallback
  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(user => 
      user.First_Name?.toLowerCase().includes(query) ||
      user.Last_Name?.toLowerCase().includes(query) ||
      user.Email?.toLowerCase().includes(query)
    );
  }
  
  if (statusFilter.value !== 'all') {
    const targetStatus = statusFilter.value === 'active';
    result = result.filter(user => user.IsActive === targetStatus);
  }
  
  if (roleFilter.value !== 'all') {
    const targetRole = roleFilter.value === 'admin';
    result = result.filter(user => user.IsAdmin === targetRole);
  }
  
  // Apply sorting
  if (sortBy.value === 'name') {
    result.sort((a, b) => {
      const nameA = `${a.First_Name || ''} ${a.Last_Name || ''}`.toLowerCase().trim();
      const nameB = `${b.First_Name || ''} ${b.Last_Name || ''}`.toLowerCase().trim();
      return nameA.localeCompare(nameB);
    });
  } else if (sortBy.value === 'balance') {
    result.sort((a, b) => parseFloat(b.Account_Balance || 0) - parseFloat(a.Account_Balance || 0));
  }
  // Default: created date (already sorted by backend)
  
  return result;
});

// Reset filters
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  roleFilter.value = 'all';
  sortBy.value = 'created';
};

onMounted(async () => {
  await loadUsers();
});

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

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: #1a1a1a;
  border: 2px solid #ff6b00;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  color: #ff6b00;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #444;
}

/* Detail Items */
.detail-item {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #888;
  font-weight: 500;
}

.detail-value {
  color: white;
  font-weight: 600;
}

/* Booking List */
.booking-list {
  max-height: 300px;
  overflow-y: auto;
}

.booking-item {
  padding: 0.75rem;
  border-bottom: 1px solid #333;
  transition: background-color 0.2s;
}

.booking-item:hover {
  background-color: #222;
}

.booking-item:last-child {
  border-bottom: none;
}

/* Table Styles */
.table-dark {
  --bs-table-bg: #1a1a1a;
  --bs-table-striped-bg: #222;
  --bs-table-hover-bg: #333;
}

.table th {
  border-bottom: 2px solid #444;
  color: #ff6b00;
}

.table td {
  vertical-align: middle;
  border-color: #333;
}

/* Badge Styles */
.badge {
  font-size: 0.75em;
  font-weight: 600;
  padding: 0.35em 0.65em;
}

/* Button Styles */
.btn-outline-light:hover {
  color: #0a0a0a;
}
</style>