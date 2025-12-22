<script setup>
import { ref, onMounted } from 'vue';
import { getMovies } from '../services/api';

const movies = ref([]);

onMounted(async () => {
  movies.value = await getMovies();
});
</script>

<template>
  <div class="home">
    <h1 class="text-3xl font-bold mb-4">Now Showing</h1>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="movie in movies" :key="movie.Movie_ID" class="movie-card">
        <img :src="movie.Poster_URL || 'placeholder.jpg'" alt="" class="w-full h-auto rounded-lg"/>
        <h2 class="mt-2 font-semibold">{{ movie.Title }}</h2>
        <p>{{ movie.genres?.Name }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-card {
  background-color: #1f1f1f;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
}
</style>
