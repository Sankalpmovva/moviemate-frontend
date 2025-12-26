<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h3>Notifications</h3>

    </div>

    <div class="filter-dropdown">
      <label class="filter-label">Filter by Category:</label>
      <select v-model="filter" class="status-select">
        <option value="all">All Notifications</option>
        <option value="booking_confirmation">Confirmed Bookings</option>
        <option value="booking_cancellation">Cancelled Bookings</option>
        <option value="promotion">Wallet Top-up</option>
      </select>
    </div>
    
    <div v-if="filteredNotifications.length === 0" class="no-notifications">
      <p>No notifications found</p>
    </div>
    
    <div v-else class="notifications-list">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.Notification_ID"
        class="notification-item"
        :class="getPurposeClass(notification.Purpose)"
      >
        <div class="notification-content">
          <div class="notification-purpose">{{ formatPurpose(notification.Purpose) }}</div>
          <div class="notification-message">{{ notification.Message }}</div>
          <div class="notification-meta">
            <span class="notification-time">{{ formatTime(notification.Sent_At) }}</span>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const notifications = ref([]);
const userId = ref(null);
const filter = ref('all');

// Computed property for filtered notifications
const filteredNotifications = computed(() => {
  if (filter.value === 'all') {
    return notifications.value;
  }
  return notifications.value.filter(n => n.Purpose === filter.value);
});

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  userId.value = user.id;
  
  console.log('User ID from localStorage:', userId.value);
  
  if (userId.value) {
    fetchNotifications();
  } else {
    console.error('No user ID found in localStorage');
  }
});

const fetchNotifications = async () => {
  try {
    console.log('Fetching notifications for user:', userId.value);
    const response = await axios.get(`http://localhost:2112/api/notifications/user/${userId.value}`);
    console.log('Notifications received:', response.data);
    notifications.value = response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

const deleteNotification = async (id) => {
  try {
    await axios.delete(`http://localhost:2112/api/notifications/${id}`);
    notifications.value = notifications.value.filter(n => n.Notification_ID !== id);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};



const getPurposeClass = (purpose) => {
  return purpose ? purpose.replace('_', '-') : '';
};

const formatPurpose = (purpose) => {
  if (!purpose) return 'Notification';
  return purpose.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
  
  return date.toLocaleDateString();
};
</script>

<style scoped>
.notifications-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notifications-header h3 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.clear-all-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.clear-all-btn:hover {
  background: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
}

/* Filter Dropdown */
.filter-dropdown {
  margin-bottom: 25px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.status-select {
  width: 100%;
  max-width: 300px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-select:focus {
  outline: none;
  border-color: #ff6b00;
  box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
}

.status-select:hover {
  border-color: #bbb;
}

/* No Notifications */
.no-notifications {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

/* Notifications List */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Notification Item */
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Purpose-specific border colors */
.notification-item.booking-confirmation {
  border-left-color: #4CAF50;
}

.notification-item.booking-cancellation {
  border-left-color: #f44336;
}

.notification-item.promotion {
  border-left-color: #2196F3;
}

/* Notification Content */
.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-purpose {
  font-weight: 700;
  color: #333;
  font-size: 15px;
  padding: 4px 0;
}

.notification-message {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 4px 0;
  white-space: pre-line;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.notification-time {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #ccc;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  color: #f44336;
  background: #ffebee;
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-container {
    padding: 15px;
    margin: 10px auto;
  }
  
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .clear-all-btn {
    align-self: flex-start;
  }
  
  .status-select {
    max-width: 100%;
  }
  
  .notification-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .delete-btn {
    align-self: flex-end;
  }
}
</style>