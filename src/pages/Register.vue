<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../services/auth';

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const router = useRouter();

const submit = async () => {
  error.value = '';
  loading.value = true;

  try {
    await register(
      firstName.value,
      lastName.value,
      email.value,
      password.value
    );
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mt-5" style="max-width: 480px;">
    <h2 class="text-center mb-4">Create Account</h2>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">First Name</label>
        <input v-model="firstName" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label">Last Name</label>
        <input v-model="lastName" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>

      <button class="btn btn-success w-100" :disabled="loading">
        {{ loading ? 'Creating...' : 'Register' }}
      </button>
    </form>

    <p class="text-center mt-3">
      Already have an account?
      <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>
