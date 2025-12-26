<script setup>
import { ref, onMounted } from 'vue';
import { useAuth, getAccount, addBalance } from '../services/auth.js';
import { useRouter } from 'vue-router';

const { user } = useAuth();
const router = useRouter();

const balance = ref(0);
const loading = ref(true);
const addingBalance = ref(false);
const message = ref('');

const getUserId = () => {
  return user.value?.id || user.value?.accountId;
};

// Load wallet balance
onMounted(async () => {
  const userId = getUserId();
  if (!userId) {
    loading.value = false;
    router.push('/login');
    return;
  }
  
  try {
    const accountData = await getAccount(userId);
    if (accountData && accountData.Account_Balance !== undefined) {
      balance.value = parseFloat(accountData.Account_Balance) || 0;
    }
  } catch (err) {
    console.error('Error fetching wallet balance:', err);
    message.value = 'Failed to load wallet balance.';
  } finally {
    loading.value = false;
  }
});

// Add funds to wallet
const addFunds = async () => {
  addingBalance.value = true;
  message.value = '';
  
  try {
    const res = await addBalance(getUserId(), 50);
    if (res && res.newBalance !== undefined) {
      balance.value = parseFloat(res.newBalance);
      message.value = 'Successfully added €50 to your wallet!';
      setTimeout(() => {
        message.value = '';
      }, 3000);
    } else {
      message.value = 'Failed to add balance. Please try again.';
    }
  } catch (err) {
    console.error(err);
    message.value = 'Failed to add balance. Please try again.';
  } finally {
    addingBalance.value = false;
  }
};
</script>

<template>
  <div class="container mt-4">
    <h2>Wallet</h2>
    <p class="text-muted">Manage your MovieMate wallet balance</p>
    
    <div v-if="message" class="alert" :class="message.includes('Failed') ? 'alert-danger' : 'alert-success'">
      {{ message }}
    </div>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else>
      <div class="card mb-4" style="max-width: 400px;">
        <div class="card-body">
          <h5 class="card-title">Current Balance</h5>
          <h2 class="card-text text-success">€{{ balance.toFixed(2) }}</h2>
        </div>
      </div>
      
      <button class="btn btn-success" @click="addFunds" :disabled="addingBalance">
        {{ addingBalance ? 'Processing...' : 'Add €50' }}
      </button>
    </div>
  </div>
</template>