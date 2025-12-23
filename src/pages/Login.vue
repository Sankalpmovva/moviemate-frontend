<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../services/auth.js';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);  // Changed from '' to false

const router = useRouter();
const { login } = useAuth();

const submit = async () => {
  error.value = '';
  loading.value = true;
  
  try {
    await login(email.value, password.value);
    router.push('/account');
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mt-5" style="max-width: 420px;">
    <h2 class="text-center mb-4">Login</h2>
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <p class="text-center mt-3">
      No account? <router-link to="/register">Register here</router-link>
    </p>
  </div>
</template>