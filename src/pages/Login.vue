<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuth } from '../services/auth';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const { login } = useAuth();

const submit = async () => {
  try {
    const res = await axios.post('http://localhost:2112/accounts/login', {
      email: email.value,
      password: password.value
    });

    login({
      token: res.data.token,
      accountId: res.data.accountId,
      email: email.value
    });

    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed';
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

      <button class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <p class="text-center mt-3">
      No account?
      <router-link to="/register">Register here</router-link>
    </p>
  </div>
</template>
