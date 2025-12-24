<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const email = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

const requestReset = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    await axios.post('http://localhost:2112/passwordreset/request', {
      email: email.value
    });

    success.value = 'If that email exists, a reset code has been sent. Check your inbox.';
    
    // Redirect to reset page after 2 seconds
    setTimeout(() => {
      router.push({ 
        name: 'reset-password', 
        query: { email: email.value } 
      });
    }, 2000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send reset code';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mt-5" style="max-width: 420px;">
    <h2 class="text-center mb-4">Forgot Password</h2>
    <p class="text-center text-muted mb-4">
      Enter your email address and we'll send you a reset code.
    </p>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <form @submit.prevent="requestReset">
      <div class="mb-3">
        <label class="form-label">Email Address</label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          required
          placeholder="your-email@example.com"
        />
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send Reset Code' }}
      </button>
    </form>

    <p class="text-center mt-3">
      <router-link to="/login">Back to Login</router-link>
    </p>
  </div>
</template>