<template>
  <div class="admin-container">
    <div class="container mt-4">
      <!-- Header -->
      <div class="admin-header">
        <h2>Admin Dashboard</h2>
        <div class="header-actions">
          <span class="text-muted">Last updated: {{ lastUpdated }}</span>
          <button class="btn btn-sm btn-outline-light ms-2" @click="refreshDashboard" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
        <p class="mt-2 text-muted">Loading dashboard data...</p>
      </div>

      <!-- Statistics Cards -->
      <div v-else class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="stat-card revenue">
            <div class="stat-icon">€</div>
            <div class="stat-content">
              <h3 class="text-success">{{ formatCurrency(stats.totalRevenue) }}</h3>
              <p>Total Revenue</p>
              <small :class="stats.revenueChange > 0 ? 'text-success' : 'text-danger'">
                {{ stats.revenueChange > 0 ? '+' : '' }}{{ stats.revenueChange }}% this month
              </small>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card users">
            <div class="stat-icon">U</div>
            <div class="stat-content">
              <h3>{{ formatNumber(stats.totalUsers) }}</h3>
              <p>Active Users</p>
              <small class="text-muted" v-if="stats.newUsers > 0">
                +{{ stats.newUsers }} new this week
              </small>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card bookings">
            <div class="stat-icon">B</div>
            <div class="stat-content">
              <h3>{{ formatNumber(stats.totalBookings) }}</h3>
              <p>Total Bookings</p>
              <small class="text-muted">
                {{ stats.todayBookings }} today
              </small>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card showtimes">
            <div class="stat-icon">S</div>
            <div class="stat-content">
              <h3>{{ formatNumber(stats.activeShowtimes) }}</h3>
              <p>Active Showtimes</p>
              <small class="text-muted">
                {{ stats.upcomingShowtimes }} upcoming
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="row g-4 mb-4">
        <div class="col-md-8">
          <div class="dashboard-card">
            <div class="card-header">
              <h5>Revenue Trend (Last 7 Days)</h5>
            </div>
            <div class="card-body">
              <div v-if="stats.revenueData7Days && stats.revenueData7Days.length > 0" class="revenue-chart">
                <div class="chart-bars">
                  <div v-for="(item, index) in stats.revenueData7Days" :key="index" class="chart-bar-container">
                    <div class="d-flex flex-column align-items-center">
                      <div class="chart-bar" :style="{ height: getBarHeight(item.amount) + 'px' }">
                        <div class="chart-value">{{ formatCurrency(item.amount) }}</div>
                      </div>
                      <small class="text-muted mt-2">{{ item.day }}</small>
                    </div>
                  </div>
                </div>
                <div class="chart-legend mt-3">
                  <div class="legend-item">
                    <span class="legend-color"></span>
                    <span class="text-muted">Daily Revenue (EUR)</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-muted py-4">
                <p>No revenue data available</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="dashboard-card">
            <div class="card-header">
              <h5>Top Movies</h5>
            </div>
            <div class="card-body">
              <div v-if="stats.topMovies && stats.topMovies.length > 0">
                <div v-for="(movie, index) in stats.topMovies" :key="index" class="top-movie-item">
                  <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                    <div>
                      <strong class="d-block text-light">{{ movie.movieTitle }}</strong>
                      <small class="text-muted">{{ movie.bookingCount }} bookings</small>
                    </div>
                    <span class="badge rank-badge">#{{ index + 1 }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-muted py-4">
                <p>No booking data available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Quick Actions -->
      <div class="row g-4">
        <!-- Recent Activity -->
        <div class="col-md-8">
          <div class="dashboard-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Recent Activity</h5>
              <button class="btn btn-sm btn-outline-light" @click="loadRecentActivity" :disabled="loading">
                Refresh
              </button>
            </div>
            <div class="card-body">
              <div v-if="recentActivity.length > 0">
                <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                  <div class="activity-icon" :class="activity.type">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <p class="mb-1 text-light">{{ activity.message }}</p>
                    <small class="text-muted">{{ formatTimeAgo(activity.timestamp) }}</small>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-muted py-4">
                <p>No recent activity</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-md-4">
          <div class="dashboard-card">
            <div class="card-header">
              <h5>Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <router-link to="/admin/movies" class="quick-action-btn">
                  <span class="action-icon">M</span>
                  <span>Manage Movies</span>
                </router-link>
                
                <router-link to="/admin/showtimes" class="quick-action-btn">
                  <span class="action-icon">S</span>
                  <span>Manage Showtimes</span>
                </router-link>
                
                <router-link to="/admin/accounts" class="quick-action-btn">
                  <span class="action-icon">U</span>
                  <span>Manage Users</span>
                </router-link>
                
                <router-link to="/admin/bookings" class="quick-action-btn">
                  <span class="action-icon">B</span>
                  <span>View Bookings</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../services/auth.js';
import axios from 'axios';

const API_BASE = 'http://localhost:2112/admin';
const router = useRouter();
const { user, isLoggedIn } = useAuth();

// Check if user is admin
if (!isLoggedIn.value || !user.value?.isAdmin) {
  router.push('/login');
}

// State
const stats = ref({
  totalRevenue: 0,
  totalUsers: 0,
  totalBookings: 0,
  activeShowtimes: 0,
  revenueChange: 0,
  newUsers: 0,
  todayBookings: 0,
  upcomingShowtimes: 0,
  topMovies: [],
  revenueData7Days: []
});

const recentActivity = ref([]);
const loading = ref(false);
const lastUpdated = ref('');

// Format number with commas
const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString();
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Load dashboard data
const loadDashboardData = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    
    // Load all dashboard stats
    const response = await axios.get(`${API_BASE}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Update stats with data from backend
    const dashboardData = response.data;
    stats.value = {
      totalRevenue: dashboardData.totalRevenue || 0,
      totalUsers: dashboardData.totalUsers || 0,
      totalBookings: dashboardData.totalBookings || 0,
      activeShowtimes: dashboardData.activeShowtimes || 0,
      revenueChange: dashboardData.revenueChange || 0,
      newUsers: dashboardData.newUsers || 0,
      todayBookings: dashboardData.todayBookings || 0,
      upcomingShowtimes: dashboardData.upcomingShowtimes || 0,
      topMovies: dashboardData.topMovies || [],
      revenueData7Days: dashboardData.revenueData7Days || []
    };
    
    // Load recent activity
    await loadRecentActivity();
    
    // Update timestamp
    lastUpdated.value = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    // Fallback: Load individual endpoints if combined endpoint fails
    await loadFallbackData();
  } finally {
    loading.value = false;
  }
};

// Fallback data loading
const loadFallbackData = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Load individual stats
    const [quickStats, revenueData, topMovies, activity] = await Promise.all([
      axios.get(`${API_BASE}/dashboard/quick-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_BASE}/dashboard/revenue-data?days=7`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_BASE}/dashboard/top-movies`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_BASE}/dashboard/recent-activity?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    
    // Update stats
    stats.value = {
      ...stats.value,
      totalRevenue: quickStats.data.totalRevenue || 0,
      totalUsers: quickStats.data.totalUsers || 0,
      totalBookings: quickStats.data.totalBookings || 0,
      activeShowtimes: quickStats.data.activeShowtimes || 0,
      revenueData7Days: revenueData.data || [],
      topMovies: topMovies.data || []
    };
    
    recentActivity.value = activity.data || [];
    
  } catch (err) {
    console.error('Error loading fallback data:', err);
  }
};

// Calculate bar height for chart
const getBarHeight = (amount) => {
  if (!stats.value.revenueData7Days || stats.value.revenueData7Days.length === 0) return 0;
  
  const maxAmount = Math.max(...stats.value.revenueData7Days.map(item => item.amount));
  if (maxAmount === 0) return 0;
  
  return (amount / maxAmount) * 100;
};

// Load recent activity
const loadRecentActivity = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE}/dashboard/recent-activity?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    recentActivity.value = response.data || [];
    
  } catch (err) {
    console.error('Error loading recent activity:', err);
    // Create mock activity if API fails
    recentActivity.value = [
      {
        id: 1,
        type: 'booking',
        message: 'Booking for "Inception" by John Doe',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        type: 'user',
        message: 'New user registered: Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        type: 'movie',
        message: 'New movie added: "The Matrix"',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  }
};

// Get activity icon
const getActivityIcon = (type) => {
  switch (type) {
    case 'booking': return 'bi bi-ticket';
    case 'user': return 'bi bi-person';
    case 'movie': return 'bi bi-film';
    default: return 'bi bi-info-circle';
  }
};

// Format time ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// Refresh dashboard
const refreshDashboard = () => {
  loadDashboardData();
};

onMounted(async () => {
  await loadDashboardData();
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

/* Stat Cards */
.stat-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  border-color: #ff6b00;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #2a2a2a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6b00;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-content p {
  margin: 0.25rem 0 0 0;
  color: #aaa;
  font-size: 0.9rem;
}

.stat-content small {
  font-size: 0.8rem;
}

/* Dashboard Cards */
.dashboard-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  height: 100%;
}

.dashboard-card .card-header {
  background: #242424;
  border-bottom: 1px solid #333;
  padding: 1rem 1.5rem;
}

.dashboard-card .card-header h5 {
  margin: 0;
  color: #ff6b00;
  font-weight: 600;
}

.dashboard-card .card-body {
  padding: 1.5rem;
}

/* Revenue Chart */
.revenue-chart {
  height: 250px;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding: 0 1rem;
}

.chart-bar-container {
  flex: 1;
  margin: 0 0.25rem;
}

.chart-bar {
  width: 20px;
  background: linear-gradient(to top, #ff6b00, #ff9500);
  border-radius: 4px 4px 0 0;
  margin: 0 auto;
}

.chart-legend {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* Top Movies */
.top-movie-item:last-child .border-bottom {
  border-bottom: none !important;
}

.rank-badge {
  background: #333;
  color: #ff6b00;
  font-weight: 600;
  min-width: 32px;
}

/* Recent Activity */
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #333;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  background: #2a2a2a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b00;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0;
  line-height: 1.4;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 6px;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: #333;
  border-color: #ff6b00;
  text-decoration: none;
  color: white;
}

.action-icon {
  width: 32px;
  height: 32px;
  background: #1a1a1a;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #ff6b00;
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .chart-bars {
    padding: 0 0.5rem;
  }
  
  .chart-bar {
    width: 12px;
  }
}
</style>