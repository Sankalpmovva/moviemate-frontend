<script setup>
import { ref, onMounted } from 'vue';
import { getUser, addBalance } from '../services/auth';

const user = ref({});
const balance = ref(0);

onMounted(() => {
  const u = getUser();
  if (u) {
    user.value = u;
    balance.value = u.Account_Balance || 0;
  }
});

const addFunds = async () => {
  try {
    const res = await addBalance(user.value.Account_ID, 50);
    if (res?.newBalance !== undefined) {
      balance.value = res.newBalance;
      alert('Added 50€ to wallet!');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to add balance');
  }
};
</script>

<template>
  <div class="container mt-4">
    <h2>Wallet</h2>
    <p><strong>Current Balance:</strong> €{{ balance.toFixed(2) }}</p>
    <button class="btn btn-success" @click="addFunds">Add €50</button>
  </div>
</template>
