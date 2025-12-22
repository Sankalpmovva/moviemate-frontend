<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Booking</h1>
    <p>Showtime ID: {{ route.params.showtimeId }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
