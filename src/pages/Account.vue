<script setup>
import { ref, onMounted } from 'vue';
import { useAuth, getAccount, updateAccount } from '../services/auth.js';
import { useRouter } from 'vue-router';

const { user, logout } = useAuth();
const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const message = ref('');
const loading = ref(true);

// Load account info
onMounted(async () => {
  if (!user.value || !user.value.accountId) {
    return;
  }
  
  try {
    const accountData = await getAccount(user.value.accountId);
    if (accountData) {
      firstName.value = accountData.First_Name || '';
      lastName.value = accountData.Last_Name || '';
      email.value = accountData.Email || '';
    }
  } catch (err) {
    console.error('Error fetching account:', err);
    message.value = 'Failed to load account details.';
  } finally {
    loading.value = false;
  }
});

// Save changes
const saveChanges = async () => {
  try {
    const res = await updateAccount(user.value.accountId, firstName.value, lastName.value);
    if (res) {
      message.value = 'Changes saved successfully!';
      setTimeout(() => {
        message.value = '';
      }, 3000);
    }
  } catch (err) {
    message.value = 'Failed to save changes.';
    console.error(err);
  }
};

const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>

<template>
  <div class="container mt-4">
    <h2>Account Settings</h2>
    <p class="text-muted">View and update your account details</p>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else>
      <div v-if="message" class="alert" :class="message.includes('Failed') ? 'alert-danger' : 'alert-success'">
        {{ message }}
      </div>
      
      <form @submit.prevent="saveChanges">
        <div class="mb-3">
          <label class="form-label">First Name</label>
          <input v-model="firstName" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Last Name</label>
          <input v-model="lastName" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" disabled />
          <small class="form-text text-muted">Email cannot be changed</small>
        </div>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </form>
    </div>
  </div>
</template>