<template>
  <div class="home-container">

    <!-- Hero Banner -->
    <section class="hero relative bg-cover bg-center h-96 rounded-lg mb-8" style="background-image: url('https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg')">
      <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-4">
        <h1 class="text-5xl font-bold mb-2 text-center">MovieMate</h1>
        <p class="text-xl mb-4 text-center">Book your tickets instantly. Discover showtimes, trailers & more.</p>
        <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition">
          Browse Movies
        </button>
      </div>
    </section>

    <!-- Search Bar -->
    <section class="search-bar mb-8 text-center">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search movies..." 
        class="border rounded-lg px-4 py-2 w-full md:w-1/2"
      />
    </section>

    <!-- Now Showing -->
    <section class="now-showing mb-12">
      <h2 class="text-3xl font-semibold mb-6">Now Showing</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div v-for="movie in filteredMovies" :key="movie.TMDB_ID" class="movie-card border rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
          <img :src="movie.Poster_URL" :alt="movie.Title" class="w-full h-64 object-cover">
          <div class="p-2">
            <h3 class="font-semibold text-lg truncate">{{ movie.Title }}</h3>
            <p class="text-sm text-gray-600">Rating: {{ movie.Rating }}</p>
            <button @click="goToMovie(movie.TMDB_ID)" class="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded transition">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Movies -->
    <section class="upcoming mb-12">
      <h2 class="text-3xl font-semibold mb-6">Upcoming Movies</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div v-for="movie in upcoming" :key="movie.TMDB_ID" class="movie-card border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
          <img :src="movie.Poster_URL" :alt="movie.Title" class="w-full h-64 object-cover">
          <div class="p-2">
            <h3 class="font-semibold text-lg truncate">{{ movie.Title }}</h3>
            <p class="text-sm text-gray-600">Release: {{ movie.Release_Date }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Genres / Categories -->
    <section class="genres mb-12">
      <h2 class="text-3xl font-semibold mb-6">Browse by Genre</h2>
      <div class="flex flex-wrap gap-4">
        <span v-for="genre in genres" :key="genre" class="px-4 py-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition">
          {{ genre }}
        </span>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Dummy data for now
const movies = ref([
  { TMDB_ID: 76600, Title: 'Avatar: The Way of Water', Poster_URL: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', Rating: 7.607 },
  { TMDB_ID: 425274, Title: "Now You See Me: Now You Don't", Poster_URL: 'https://image.tmdb.org/t/p/w500/nowyouseeme.jpg', Rating: 6.439 },
  { TMDB_ID: 634649, Title: "Spider-Man: Across the Spider-Verse", Poster_URL: "https://image.tmdb.org/t/p/w500/spiderman.jpg", Rating: 8.2 }
])

const upcoming = ref([
  { TMDB_ID: 123456, Title: 'Fictional Upcoming Movie 1', Poster_URL: 'https://via.placeholder.com/500x750?text=Upcoming+Movie', Release_Date: '2026-01-10' },
  { TMDB_ID: 123457, Title: 'Fictional Upcoming Movie 2', Poster_URL: 'https://via.placeholder.com/500x750?text=Upcoming+Movie', Release_Date: '2026-02-20' }
])

const genres = ref(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'])

const searchQuery = ref('')

// Computed filtered movies
const filteredMovies = computed(() => {
  if (!searchQuery.value) return movies.value
  return movies.value.filter(m => m.Title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// Navigate to movie detail page
const goToMovie = (id) => {
  router.push({ name: 'Moviedetail', params: { id } })
}
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
