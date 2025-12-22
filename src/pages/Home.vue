<script setup>
import { ref, onMounted } from 'vue';
import { getMovies, getTMDBMovie } from '../services/api';

const movies = ref([]);

// Fetch movies from backend and then fetch TMDB data for each
onMounted(async () => {
  const dbMovies = await getMovies();

  const moviesWithTMDB = await Promise.all(
    dbMovies.map(async (movie) => {
      const tmdbData = await getTMDBMovie(movie.Title);
      return {
        ...movie,
        Poster_URL: tmdbData?.Poster_URL || 'placeholder.jpg',
        Rating: tmdbData?.Rating || movie.Rating || 'N/A',
        Overview: tmdbData?.Overview || '',
        Release_Date: tmdbData?.Release_Date || ''
      };
    })
  );

  movies.value = moviesWithTMDB;
});
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4">Now Showing</h1>
    <div class="row g-4">
      <div
        class="col-sm-6 col-md-4 col-lg-3"
        v-for="movie in movies"
        :key="movie.Movie_ID"
      >
        <div class="card h-100 text-white bg-dark">
          <img
            :src="movie.Poster_URL"
            class="card-img-top"
            :alt="movie.Title"
          />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ movie.Title }}</h5>
            <p class="card-text mb-1">
              <strong>Genre:</strong> {{ movie.genres?.Name || 'Unknown' }}
            </p>
            <p class="card-text mb-1">
              <strong>Rating:</strong> {{ movie.Rating }}
            </p>
            <!-- <p class="card-text text-truncate">
              {{ movie.Overview }}
            </p> -->
            <p class="card-text mt-auto">
              <small class="text-muted">Release: {{ movie.Release_Date }}</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-img-top {
  object-fit: cover;
  height: 350px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* show max 3 lines */
  -webkit-box-orient: vertical;
}
</style>
