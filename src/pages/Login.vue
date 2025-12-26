<template>
  <div class="container mt-5" style="max-width: 420px;">
    <h2 class="text-center mb-4">Login</h2>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Email/password login -->
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>

      <button
        type="submit"
        class="btn btn-primary w-100 mb-3"
        :disabled="loading"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <!-- Divider -->
    <div class="divider d-flex align-items-center my-4">
      <p class="text-center mx-3 mb-0 text-muted">OR</p>
    </div>

    <!-- Google OAuth login -->
    <button
      class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
      @click="handleGoogleLogin"
      :disabled="loading"
    >
      <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-google me-2" viewBox="0 0 16 16">
        <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
      </svg>
      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
      Login with Google
    </button>

      <p class="text-center mt-3">
        <router-link to="/forgot-password">Forgot Password?</router-link>
     </p>
    <p class="text-center mt-3">
      No account?
      <router-link to="/register">Register here</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth, handleGoogleCallback, googleLoginRedirect } from '../services/auth.js';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const router = useRouter();
const { login, googleLogin } = useAuth();

onMounted(async () => {
  console.log('Login page loaded - checking for Google callback');
  
  // Check for Google callback parameters
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const errorParam = params.get('error');
  const success = params.get('success');
  
  console.log('URL parameters found:', { 
    token: token ? 'Present' : 'Missing', 
    error: errorParam || 'None',
    success: success || 'None'
  });
  
  if (token) {
    console.log('Google token found, processing login...');
    loading.value = true;
    
    try {
      // Store the token immediately
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage');
      
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      
      // Create user object
      const userData = {
        id: payload.accountId,
        email: payload.email,
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        isAdmin: payload.isAdmin || false,
        balance: 0
      };
      
      console.log('User data:', userData);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User stored in localStorage');
      
      // Update the auth state immediately
      const { user: authUser } = useAuth();
      authUser.value = userData;
      
      console.log('Google login successful! Redirecting...');
      
      // Clear the URL parameters (remove ?token=... from address bar)
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('URL parameters cleared');
      
      // Redirect based on user role
      if (userData.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
      
    } catch (err) {
      console.error('Error processing Google token:', err);
      error.value = 'Failed to process Google login. Please try again.';
      loading.value = false;
    }
    
  } else if (errorParam) {
    console.error('Google returned error:', errorParam);
    error.value = `Google login failed: ${errorParam}`;
    loading.value = false;
  }
  
  console.log('No Google callback detected, showing normal login form');
});





// Centralized redirect logic
const redirectAfterLogin = (user) => {
  if (user?.isAdmin) {
    router.push('/admin');
  } else {
    router.push('/');
  }
};

// Email/password login
const submit = async () => {
  error.value = '';
  loading.value = true;

  try {
    const user = await login(email.value, password.value);
    redirectAfterLogin(user);
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
};

// Google OAuth login
const handleGoogleLogin = () => {
  error.value = '';
  loading.value = true;
  
  setTimeout(() => {
    googleLoginRedirect(); 
  }, 100);
};
</script>

<style scoped>
.divider {
  color: #6c757d;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #dee2e6;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.bi-google {
  margin-bottom: 2px;
}
</style>