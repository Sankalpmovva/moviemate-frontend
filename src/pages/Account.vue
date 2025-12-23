<script setup>
import { ref, onMounted } from 'vue';
import { useAuth, getAccount, updateAccount } from '../services/auth.js';
import { useRouter } from 'vue-router';

const { user, isLoggedIn, logout } = useAuth();
const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const message = ref('');

// Check if logged in before mounting
if (!isLoggedIn.value) {
  router.push('/login');
}

// Load account info
onMounted(async () => {
  if (!user.value || !user.value.accountId) {
    router.push('/login');
    return;
  }
  
  try {
    const accountData = await getAccount(user.value.accountId);
    if (accountData) {
      firstName.value = accountData.First_Name;
      lastName.value = accountData.Last_Name;
      email.value = accountData.Email;
    }
  } catch (err) {
    console.error('Error fetching account:', err);
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
    <h2>Your Account</h2>
    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <form @submit.prevent="saveChanges">
      <div class="mb-3">
        <label class="form-label">First Name</label>
        <input v-model="firstName" type="text" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Last Name</label>
        <input v-model="lastName" type="text" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" disabled />
      </div>
      <button type="submit" class="btn btn-primary">Save Changes</button>
    </form>
  </div>
</template>