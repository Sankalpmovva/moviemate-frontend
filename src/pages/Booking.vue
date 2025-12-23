<script setup>
import { ref, onMounted } from 'vue';
import { useAuth, getUserBookings, cancelBooking } from '../services/auth.js';
import { useRouter } from 'vue-router';

const { user, isLoggedIn } = useAuth();
const router = useRouter();

const bookings = ref([]);
const loading = ref(true);
const error = ref(null);
const cancellingBooking = ref(null);

onMounted(async () => {
  if (!isLoggedIn.value || !user.value) {
    router.push('/login');
    return;
  }

  try {
    const data = await getUserBookings(user.value.accountId);
    bookings.value = data || [];
  } catch (err) {
    error.value = 'Failed to load bookings';
    console.error('Error fetching bookings:', err);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '00:00';
  const match = timeStr.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : timeStr.substring(0, 5);
};

const handleCancelBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to cancel this booking? The amount will be refunded to your wallet.')) {
    return;
  }
  
  cancellingBooking.value = bookingId;
  
  try {
    const result = await cancelBooking(bookingId);
    alert(`Booking cancelled! €${result.refundedAmount} has been refunded to your wallet.`);
    
    // Refresh bookings
    const data = await getUserBookings(user.value.accountId);
    bookings.value = data || [];
  } catch (err) {
    alert('Failed to cancel booking: ' + (err.response?.data?.error || err.message));
  } finally {
    cancellingBooking.value = null;
  }
};
</script>

<template>
  <div class="container mt-4">
    <h2>My Bookings</h2>
    <p class="text-muted">View all your movie bookings</p>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="bookings.length === 0" class="alert alert-info">
      You don't have any bookings yet. <router-link to="/">Browse movies</router-link> to make your first booking!
    </div>

    <div v-else class="bookings-list">
      <div v-for="booking in bookings" :key="booking.Booking_ID" class="booking-card">
          <div class="booking-header">
            <h5>{{ booking.showtimes?.movies?.Title || 'Unknown Movie' }}</h5>
            <div class="d-flex gap-2 align-items-center">
              <span v-if="booking.IsActive" class="badge bg-success">Confirmed</span>
              <span v-else class="badge bg-secondary">Cancelled</span>
              <button 
                v-if="booking.IsActive" 
                class="btn btn-sm btn-danger" 
                @click="handleCancelBooking(booking.Booking_ID)"
                :disabled="cancellingBooking === booking.Booking_ID"
              >
                {{ cancellingBooking === booking.Booking_ID ? 'Cancelling...' : 'Cancel' }}
              </button>
            </div>
          </div>
        <div class="booking-details">
          <div class="detail-item">
            <strong>Date:</strong> {{ formatDate(booking.showtimes?.Show_Date) }}
          </div>
          <div class="detail-item">
            <strong>Time:</strong> {{ formatTime(booking.showtimes?.Start_Time) }}
          </div>
          <div class="detail-item">
            <strong>Theatre:</strong> {{ booking.showtimes?.theaters?.Name || 'Unknown' }}, {{ booking.showtimes?.theaters?.City || 'Unknown' }}
          </div>
          <div class="detail-item">
            <strong>Format:</strong> {{ booking.showtimes?.formats?.Name || 'Standard' }}
          </div>
          <div class="detail-item">
            <strong>Tickets:</strong> {{ booking.Tickets }}
          </div>
          <div class="detail-item">
            <strong>Total Paid:</strong> <span class="price">€{{ parseFloat(booking.Total_Price).toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <strong>Booked on:</strong> {{ formatDate(booking.Booking_Date) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bookings-list {
  display: grid;
  gap: 1.5rem;
}

.booking-card {
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.booking-card:hover {
  border-color: var(--primary-orange);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #333;
}

.booking-header h5 {
  margin: 0;
  color: #fff;
}

.booking-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.detail-item {
  color: #ddd;
}

.detail-item strong {
  color: #999;
  margin-right: 0.5rem;
}

.price {
  color: var(--primary-cyan);
  font-weight: 700;
  font-size: 1.1rem;
}
</style>