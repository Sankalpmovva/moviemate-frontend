<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();

const email = ref('');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

onMounted(() => {
  email.value = route.query.email || '';
});

const resetPassword = async () => {
  error.value = '';
  success.value = '';

  // Validation
  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;

  try {
    await axios.post('http://localhost:2112/passwordreset/verify', {
      email: email.value,
      code: code.value,
      newPassword: newPassword.value
    });

    success.value = 'Password reset successfully! Redirecting to login...';
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to reset password';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mt-5" style="max-width: 420px;">
    <h2 class="text-center mb-4">Reset Password</h2>
    <p class="text-center text-muted mb-4">
      Enter the code sent to your email and your new password.
    </p>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <form @submit.prevent="resetPassword">
      <div class="mb-3">
        <label class="form-label">Email Address</label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          required
          :disabled="route.query.email"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Reset Code</label>
        <input
          v-model="code"
          type="text"
          class="form-control"
          required
          placeholder="Enter 6-digit code"
          maxlength="6"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">New Password</label>
        <input
          v-model="newPassword"
          type="password"
          class="form-control"
          required
          placeholder="At least 6 characters"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Confirm New Password</label>
        <input
          v-model="confirmPassword"
          type="password"
          class="form-control"
          required
          placeholder="Re-enter password"
        />
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Resetting...' : 'Reset Password' }}
      </button>
    </form>

    <p class="text-center mt-3">
      <router-link to="/login">Back to Login</router-link>
    </p>
  </div>
</template>