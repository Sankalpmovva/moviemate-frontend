<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../services/auth.js';
import {
  getAdminMovies,
  getAdminGenres,
  createAdminMovie,
  updateAdminMovie,
  deleteAdminMovie
} from '../../services/admin.js';

const router = useRouter();
const { user, isLoggedIn } = useAuth();

// Check if user is admin
if (!isLoggedIn.value || !user.value) {
  router.push('/login');
}

const movies = ref([]);
const genres = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const searchQuery = ref('');
const selectedMovieId = ref(null);
const showForm = ref(false);
const editMode = ref(false);

const form = ref({
  Title: '',
  Overview: '',
  Poster_URL: '',
  Genre_ID: '',
  Rating: '',
  Runtime: '',
  Release_Date: ''
});

// Fetch movies from API
const fetchMovies = async () => {
  loading.value = true;
  error.value = '';
  try {
    movies.value = await getAdminMovies();
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load movies. Please check your admin access.';
  } finally {
    loading.value = false;
  }
};

// Fetch genres
const fetchGenres = async () => {
  try {
    genres.value = await getAdminGenres();
  } catch (err) {
    console.error(err);
  }
};

// Filtered movies based on search
const filteredMovies = computed(() => {
  if (!searchQuery.value) return movies.value;
  const query = searchQuery.value.toLowerCase();
  return movies.value.filter(movie => 
    movie.Title?.toLowerCase().includes(query) ||
    movie.genres?.Name?.toLowerCase().includes(query)
  );
});

// Selected movie details
const selectedMovie = computed(() => {
  if (!selectedMovieId.value) return null;
  return movies.value.find(m => m.Movie_ID === selectedMovieId.value);
});

// Handle movie selection from dropdown
const handleSelectMovie = () => {
  if (selectedMovieId.value && selectedMovie.value) {
    showForm.value = true;
    editMode.value = true;
    populateForm(selectedMovie.value);
  }
};

// Populate form with movie data
const populateForm = (movie) => {
  form.value = {
    Title: movie.Title || '',
    Overview: movie.Overview || '',
    Poster_URL: movie.Poster_URL || '',
    Genre_ID: movie.Genre_ID || '',
    Rating: movie.Rating || '',
    Runtime: movie.Runtime || '',
    Release_Date: movie.Release_Date ? movie.Release_Date.split('T')[0] : ''
  };
};

// Show add new movie form
const handleAddNew = () => {
  showForm.value = true;
  editMode.value = false;
  selectedMovieId.value = null;
  resetForm();
};

// Reset form
const resetForm = () => {
  form.value = {
    Title: '',
    Overview: '',
    Poster_URL: '',
    Genre_ID: '',
    Rating: '',
    Runtime: '',
    Release_Date: ''
  };
};

// Handle save (update or create)
const handleSave = async () => {
  error.value = '';
  success.value = '';
  
  // Validation
  if (!form.value.Title || !form.value.Genre_ID) {
    error.value = 'Title and Genre are required';
    return;
  }

  loading.value = true;
  try {
    const movieData = {
      Title: form.value.Title,
      Overview: form.value.Overview,
      Poster_URL: form.value.Poster_URL,
      Genre_ID: parseInt(form.value.Genre_ID),
      Rating: form.value.Rating ? parseFloat(form.value.Rating) : null,
      Runtime: form.value.Runtime ? parseInt(form.value.Runtime) : null,
      Release_Date: form.value.Release_Date ? new Date(form.value.Release_Date) : null
    };

    if (editMode.value && selectedMovieId.value) {
      await updateAdminMovie(selectedMovieId.value, movieData);
      success.value = 'Movie updated successfully!';
    } else {
      await createAdminMovie(movieData);
      success.value = 'Movie created successfully!';
    }
    
    await fetchMovies();
    handleCancel();
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.error || 'Failed to save movie';
  } finally {
    loading.value = false;
  }
};

// Cancel edit
const handleCancel = () => {
  showForm.value = false;
  editMode.value = false;
  selectedMovieId.value = null;
  resetForm();
};

// Delete movie
const handleDelete = async () => {
  if (!selectedMovieId.value) return;
  
  if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    await deleteAdminMovie(selectedMovieId.value);
    success.value = 'Movie deleted successfully!';
    await fetchMovies();
    handleCancel();
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    console.error(err);
    error.value = 'Failed to delete movie';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchGenres();
  await fetchMovies();
});
</script>

<template>
  <div class="admin-container">
    <div class="container mt-4">
      <!-- Header -->
      <div class="admin-header">
        <h2>
          
          Movie Management
        </h2>
        <router-link to="/admin/dashboard" class="btn btn-outline-light">
           Back to Dashboard
        </router-link>
      </div>

      <!-- Alerts -->
      <div v-if="error" class="alert alert-danger alert-dismissible fade show">
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" @click="error = ''"></button>
      </div>
      <div v-if="success" class="alert alert-success alert-dismissible fade show">
        <strong>Success:</strong> {{ success }}
        <button type="button" class="btn-close" @click="success = ''"></button>
      </div>

      <!-- Loading State -->
      <div v-if="loading && movies.length === 0" class="text-center py-5">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading movies...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="row g-4">
        <!-- Left Panel - Movie Selection -->
        <div class="col-lg-5">
          <div class="selection-panel">
            <div class="panel-header">
              <h5>Select Movie</h5>
              <button class="btn btn-success btn-sm" @click="handleAddNew">
                <span>➕</span> Add New Movie
              </button>
            </div>

            <!-- Search Bar -->
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="🔍 Search movies by title or genre..."
              />
            </div>

            <!-- Movie Dropdown -->
            <div class="movie-dropdown">
              <label class="form-label">Select a movie to edit:</label>
              <select 
                v-model="selectedMovieId" 
                class="form-select form-select-lg"
                @change="handleSelectMovie"
              >
                <option :value="null">-- Choose a movie --</option>
                <option 
                  v-for="movie in filteredMovies" 
                  :key="movie.Movie_ID" 
                  :value="movie.Movie_ID"
                >
                  {{ movie.Title }} ({{ movie.genres?.Name || 'No Genre' }}) - {{ movie.Release_Date?.split('T')[0] }}
                </option>
              </select>
              <small class="text-muted">{{ filteredMovies.length }} movies available</small>
            </div>

            <!-- Selected Movie Preview -->
            <div v-if="selectedMovie && !showForm" class="movie-preview">
              <div class="preview-header">
                <h6>Selected Movie</h6>
                <div class="preview-actions">
                  <button class="btn btn-sm btn-primary" @click="handleSelectMovie">
                    ✏️ Edit
                  </button>
                  <button class="btn btn-sm btn-danger" @click="handleDelete">
                    🗑️ Delete
                  </button>
                </div>
              </div>
              <div class="preview-content">
                <img 
                  v-if="selectedMovie.Poster_URL" 
                  :src="selectedMovie.Poster_URL" 
                  :alt="selectedMovie.Title"
                  class="preview-poster"
                />
                <div class="preview-details">
                  <h5>{{ selectedMovie.Title }}</h5>
                  <p class="text-muted">{{ selectedMovie.genres?.Name }}</p>
                  <div class="preview-meta">
                    <span>⭐ {{ selectedMovie.Rating }}/10</span>
                    <span>⏱️ {{ selectedMovie.Runtime }} min</span>
                  </div>
                  <p class="preview-overview">{{ selectedMovie.Overview }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Movie Form -->
        <div class="col-lg-7">
          <div v-if="showForm" class="form-panel">
            <div class="panel-header">
              <h5>{{ editMode ? '✏️ Edit Movie' : '➕ Add New Movie' }}</h5>
              <button class="btn btn-outline-secondary btn-sm" @click="handleCancel">
                ✕ Cancel
              </button>
            </div>

            <form @submit.prevent="handleSave">
              <div class="row g-3">
                <!-- Title -->
                <div class="col-md-8">
                  <label class="form-label required">Title</label>
                  <input 
                    v-model="form.Title" 
                    type="text" 
                    class="form-control" 
                    required
                    placeholder="Enter movie title"
                  />
                </div>

                <!-- Rating -->
                <div class="col-md-4">
                  <label class="form-label">Rating</label>
                  <input 
                    v-model="form.Rating" 
                    type="number" 
                    min="0" 
                    max="10" 
                    step="0.1" 
                    class="form-control"
                    placeholder="0-10"
                  />
                </div>

                <!-- Genre -->
                <div class="col-md-6">
                  <label class="form-label required">Genre</label>
                  <select v-model="form.Genre_ID" class="form-select" required>
                    <option value="">Select Genre</option>
                    <option v-for="genre in genres" :key="genre.Genre_ID" :value="genre.Genre_ID">
                      {{ genre.Name }}
                    </option>
                  </select>
                </div>

                <!-- Runtime -->
                <div class="col-md-3">
                  <label class="form-label">Runtime (min)</label>
                  <input 
                    v-model="form.Runtime" 
                    type="number" 
                    class="form-control"
                    placeholder="120"
                  />
                </div>

                <!-- Release Date -->
                <div class="col-md-3">
                  <label class="form-label">Release Date</label>
                  <input 
                    v-model="form.Release_Date" 
                    type="date" 
                    class="form-control"
                  />
                </div>

                <!-- Poster URL -->
                <div class="col-12">
                  <label class="form-label">Poster URL</label>
                  <input 
                    v-model="form.Poster_URL" 
                    type="url" 
                    class="form-control"
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                <!-- Poster Preview -->
                <div v-if="form.Poster_URL" class="col-12">
                  <label class="form-label">Poster Preview</label>
                  <div class="poster-preview-container">
                    <img :src="form.Poster_URL" alt="Poster Preview" class="poster-preview" />
                  </div>
                </div>

                <!-- Overview -->
                <div class="col-12">
                  <label class="form-label">Overview / Description</label>
                  <textarea 
                    v-model="form.Overview" 
                    class="form-control" 
                    rows="5"
                    placeholder="Enter movie description..."
                  ></textarea>
                </div>

                <!-- Action Buttons -->
                <div class="col-12">
                  <div class="form-actions">
                    <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ editMode ? '💾 Save Changes' : '➕ Add Movie' }}
                    </button>
                    <button type="button" class="btn btn-secondary btn-lg" @click="handleCancel">
                      Cancel
                    </button>
                    <button 
                      v-if="editMode" 
                      type="button" 
                      class="btn btn-danger btn-lg" 
                      @click="handleDelete"
                      :disabled="loading"
                    >
                      🗑️ Delete Movie
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">🎬</div>
            <h4>No Movie Selected</h4>
            <p>Select a movie from the dropdown to edit, or click "Add New Movie" to create a new one.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  background: #0a0a0a;
  min-height: 100vh;
  padding-bottom: 3rem;
  color: #fff;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ff6b00;
}

.admin-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-icon {
  font-size: 2rem;
}

.selection-panel,
.form-panel {
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #333;
}

.panel-header h5 {
  margin: 0;
  color: #ff6b00;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-box input {
  background: #0a0a0a;
  border: 2px solid #333;
  color: #fff;
  padding: 0.75rem;
}

.search-box input:focus {
  background: #0a0a0a;
  border-color: #ff6b00;
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
}

.movie-dropdown {
  margin-bottom: 1.5rem;
}

.movie-dropdown label {
  color: #999;
  margin-bottom: 0.5rem;
}

.movie-dropdown select {
  background: #0a0a0a;
  border: 2px solid #333;
  color: #fff;
  padding: 0.75rem;
}

.movie-dropdown select:focus {
  background: #0a0a0a;
  border-color: #ff6b00;
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
}

.movie-dropdown option {
  background: #1a1a1a;
  color: #fff;
}

.movie-preview {
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-header h6 {
  margin: 0;
  color: #ff6b00;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-content {
  display: flex;
  gap: 1rem;
}

.preview-poster {
  width: 120px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #333;
}

.preview-details {
  flex: 1;
}

.preview-details h5 {
  margin-bottom: 0.5rem;
  color: #fff;
}

.preview-meta {
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0;
  color: #999;
}

.preview-overview {
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  line-height: 1.5;
}

.form-control,
.form-select,
textarea {
  background: #0a0a0a;
  border: 2px solid #333;
  color: #fff;
}

.form-control:focus,
.form-select:focus,
textarea:focus {
  background: #0a0a0a;
  border-color: #ff6b00;
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
}

.form-label {
  color: #999;
  font-weight: 500;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.poster-preview-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 8px;
}

.poster-preview {
  max-width: 200px;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #ff6b00;
}

.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-state h4 {
  color: #999;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  max-width: 400px;
}

@media (max-width: 991px) {
  .admin-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>