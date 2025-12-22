<template>
  <div id="app">
    <header class="p-4 bg-gray-800 text-white">
      <h1 class="text-2xl font-bold">MovieMate</h1>
    </header>

    <router-view></router-view> <!-- This is where Home, Booking, etc will appear -->

    <footer class="p-4 text-center border-t mt-4">
      &copy; 2025 MovieMate
    </footer>
  </div>
</template>

<script setup>
// nothing special needed here yet
</script>
