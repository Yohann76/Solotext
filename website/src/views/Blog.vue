<template>
  <div class="page blog-page">
    <section class="blog-hero">
      <div class="container">
        <h1>Blog SoloText</h1>
        <p class="blog-intro">Découvrez nos actualités, guides et conseils</p>
      </div>
    </section>

    <section class="blog-content">
      <div class="container">
        <!-- Filtres et recherche -->
        <div class="blog-filters">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un article..."
              class="search-input"
            />
          </div>
          <div class="tags-filter">
            <button
              v-for="tag in allTags"
              :key="tag"
              @click="toggleTag(tag)"
              :class="['tag-button', { active: selectedTags.includes(tag) }]"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- Liste des articles -->
        <div v-if="loading" class="loading">
          <p>Chargement des articles...</p>
        </div>

        <div v-else-if="filteredPosts.length === 0" class="no-results">
          <p>Aucun article trouvé.</p>
        </div>

        <div v-else class="posts-grid">
          <article
            v-for="post in filteredPosts"
            :key="post.slug"
            class="post-card"
          >
            <router-link v-if="post.imageHeader" :to="`/blog/${post.slug}`" class="post-image-link">
              <img
                :src="post.imageHeader"
                :alt="post.title"
                class="post-image"
              />
            </router-link>
            <div class="post-header">
              <div class="post-tags">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="post-tag"
                >
                  {{ tag }}
                </span>
              </div>
              <time class="post-date">
                {{ formatDate(post.date) }}
              </time>
            </div>
            <h2 class="post-title">
              <router-link :to="`/blog/${post.slug}`">
                {{ post.title }}
              </router-link>
            </h2>
            <p class="post-description">{{ post.description }}</p>
            <router-link :to="`/blog/${post.slug}`" class="post-link">
              Lire la suite →
            </router-link>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBlog } from '../composables/useBlog'

const { posts, loadPosts, getAllTags, searchPosts, getPostsByTag, loaded } = useBlog()

const loading = ref(true)
const searchQuery = ref('')
const selectedTags = ref([])

const allTags = getAllTags()

// Charger les articles au montage
onMounted(async () => {
  await loadPosts()
  loading.value = false
})

// Filtrer les articles
const filteredPosts = computed(() => {
  let result = posts.value

  // Filtre par recherche
  if (searchQuery.value.trim()) {
    const searchResults = searchPosts(searchQuery.value)
    result = searchResults.value
  }

  // Filtre par tags
  if (selectedTags.value.length > 0) {
    result = result.filter(post =>
      post.tags && post.tags.some(tag => selectedTags.value.includes(tag))
    )
  }

  return result
})

// Toggle tag
function toggleTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// Formater la date
function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.blog-page {
  background-color: #FFF8F0;
  color: #031815;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  min-height: 100vh;
}

.blog-hero {
  background: linear-gradient(135deg, #32C4C0 0%, #019E8B 100%);
  color: #fff;
  padding: 80px 0 60px;
}

.blog-hero .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.blog-hero h1 {
  font-family: "Neulis Alt", sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2em;
  margin: 0 0 1rem;
}

.blog-intro {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.blog-content {
  padding: 60px 0;
}

.blog-content .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.blog-filters {
  margin-bottom: 3rem;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  border: 2px solid #E0F7F5;
  border-radius: 8px;
  font-size: 16px;
  font-family: "Inter", sans-serif;
  background: #fff;
  color: #031815;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #32C4C0;
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-button {
  padding: 8px 16px;
  border: 2px solid #E0F7F5;
  border-radius: 20px;
  background: #fff;
  color: #031815;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Inter", sans-serif;
}

.tag-button:hover {
  border-color: #32C4C0;
  color: #32C4C0;
}

.tag-button.active {
  background: #32C4C0;
  border-color: #32C4C0;
  color: #fff;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.post-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(3, 24, 21, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(3, 24, 21, 0.12);
}

.post-image-link {
  display: block;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #E0F7F5 0%, #B8EBE8 100%);
  text-decoration: none;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .post-image {
  transform: scale(1.05);
}

.post-card > .post-header {
  padding: 1.5rem 2rem 0;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.post-tag {
  padding: 4px 12px;
  background: #E0F7F5;
  color: #019E8B;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.post-date {
  font-size: 14px;
  color: #717F7D;
}

.post-title {
  margin: 0 0 1rem;
  padding: 0 2rem;
  font-family: "Neulis Alt", sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3em;
}

.post-title a {
  color: #031815;
  text-decoration: none;
  transition: color 0.2s ease;
}

.post-title a:hover {
  color: #32C4C0;
}

.post-description {
  font-size: 16px;
  line-height: 1.6em;
  color: #031815;
  opacity: 0.8;
  margin: 0 0 1.5rem;
  padding: 0 2rem;
}

.post-link {
  color: #32C4C0;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
  padding: 0 2rem 2rem;
  margin-top: auto;
}

.post-link:hover {
  color: #019E8B;
}

.loading,
.no-results {
  text-align: center;
  padding: 3rem;
  color: #717F7D;
  font-size: 18px;
}

@media (max-width: 768px) {
  .blog-hero h1 {
    font-size: 36px;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .post-card {
    padding: 1.5rem;
  }
}
</style>

