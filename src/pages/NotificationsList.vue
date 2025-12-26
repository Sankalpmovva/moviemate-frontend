<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h3>Notifications</h3>
      <button v-if="notifications.length > 0" @click="clearAll" class="clear-all-btn">
        Clear All
      </button>
    </div>
    
    <div v-if="notifications.length === 0" class="no-notifications">
      <p>No notifications yet</p>
    </div>
    
    <div v-else class="notifications-list">
      <div 
        v-for="notification in notifications" 
        :key="notification.Notification_ID"
        class="notification-item"
        :class="getPurposeClass(notification.Purpose)"
      >

        <div class="notification-content">
          <div class="notification-purpose">{{ formatPurpose(notification.Purpose) }}</div>
          <div class="notification-message">{{ notification.Message }}</div>
          <div class="notification-time">{{ formatTime(notification.Sent_At) }}</div>
        </div>
        <button @click="deleteNotification(notification.Notification_ID)" class="delete-btn">
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NotificationsList',
  data() {
    return {
      notifications: [],
      userId: null
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id;
    
    console.log('User ID from localStorage:', this.userId);
    
    if (this.userId) {
      this.fetchNotifications();
    } else {
      console.error('No user ID found in localStorage');
    }
  },
  methods: {
    async fetchNotifications() {
      try {
        console.log('Fetching notifications for user:', this.userId);
        const response = await axios.get(`http://localhost:2112/api/notifications/user/${this.userId}`);
        console.log('Notifications received:', response.data);
        this.notifications = response.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },
    
    async deleteNotification(id) {
      try {
        await axios.delete(`http://localhost:2112/api/notifications/${id}`);
        this.notifications = this.notifications.filter(n => n.Notification_ID !== id);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    },
    
    async clearAll() {
      if (!confirm('Clear all notifications?')) return;
      
      try {
        await axios.delete(`http://localhost:2112/api/notifications/user/${this.userId}/all`);
        this.notifications = [];
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    },
    
    
    getPurposeClass(purpose) {
      return purpose ? purpose.replace('_', '-') : '';
    },
    
    formatPurpose(purpose) {
      if (!purpose) return 'Notification';
      return purpose.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
      if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
      if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
      
      return date.toLocaleDateString();
    }
  }
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
}

.clear-all-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-all-btn:hover {
  background: #d32f2f;
}

.no-notifications {
  text-align: center;
  padding: 40px;
  color: #666;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.notification-item.booking-confirmation {
  border-left-color: #4CAF50;
}

.notification-item.booking-cancellation {
  border-left-color: #f44336;
}

.notification-item.wallet-topup {
  border-left-color: #2196F3;
}

.notification-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-purpose {
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
}

.notification-message {
  color: #666;
  font-size: 14px;
  white-space: pre-line;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.delete-btn:hover {
  color: #f44336;
}
</style>