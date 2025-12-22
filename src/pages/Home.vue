<script setup>
import { ref, onMounted } from 'vue';
import { getMovies } from '../services/api';

const movies = ref([]);

onMounted(async () => {
  movies.value = await getMovies();
});
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4">Now Showing</h1>
    <div class="row g-3">
      <div class="col-md-4 col-lg-3" v-for="movie in movies" :key="movie.Movie_ID">
        <div class="movie-card card h-100 text-white">
          <img :src="movie.Poster_URL || 'placeholder.jpg'" class="card-img-top" :alt="movie.Title"/>
          <div class="card-body">
            <h5 class="card-title">{{ movie.Title }}</h5>
            <p class="card-text">{{ movie.genres?.Name || 'Genre' }}</p>
            <p class="card-text">
              <small class="text-muted">Rating: {{ movie.Rating || 'N/A' }}</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* optional extra spacing or tweaks here */
</style>
