<script setup>
import { ref, onMounted } from 'vue';
import { getUser } from '../services/auth';
import axios from 'axios';

const API_BASE = 'http://localhost:2112';

const bookings = ref([]);
const user = getUser();

onMounted(async () => {
  if (user) {
    try {
      const res = await axios.get(`${API_BASE}/bookings`, {
        params: { accountId: user.Account_ID }
      });
      bookings.value = res.data || [];
    } catch (err) {
      console.error(err);
    }
  }
});
</script>

<template>
  <div class="container mt-4">
    <h2>My Bookings</h2>
    <div v-if="!user">
      <p>Please login to see your bookings.</p>
    </div>
    <div v-else-if="bookings.length === 0">
      <p>You have not made any bookings yet.</p>
    </div>
    <div v-else>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Movie</th>
            <th>Theater</th>
            <th>Date</th>
            <th>Time</th>
            <th>Tickets</th>
            <th>Price (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in bookings" :key="b.Booking_ID">
            <td>{{ b.movie.Title }}</td>
            <td>{{ b.theater.Name }}</td>
            <td>{{ b.Show_Date }}</td>
            <td>{{ b.Start_Time }}</td>
            <td>{{ b.Number_of_Tickets }}</td>
            <td>{{ b.Total_Price.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
