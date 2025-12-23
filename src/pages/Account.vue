<script setup>
import { ref, onMounted } from 'vue';
import { getUser, updateAccount } from '../services/auth';

const user = ref({});

const firstName = ref('');
const lastName = ref('');

onMounted(() => {
  const u = getUser();
  if (u) {
    user.value = u;
    firstName.value = u.First_Name || '';
    lastName.value = u.Last_Name || '';
  }
});

const saveChanges = async () => {
  try {
    const res = await updateAccount(user.value.Account_ID, firstName.value, lastName.value);
    if (res?.success) {
      alert('Profile updated!');
      user.value.First_Name = firstName.value;
      user.value.Last_Name = lastName.value;
    }
  } catch (err) {
    console.error(err);
    alert('Failed to update profile');
  }
};
</script>

<template>
  <div class="container mt-4">
    <h2>My Account</h2>
    <div v-if="user">
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
        <input :value="user.Email" class="form-control" disabled />
      </div>
      <button class="btn btn-primary" @click="saveChanges">Save Changes</button>
    </div>
    <div v-else>
      <p>No user logged in.</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
}
</style>
