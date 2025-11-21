<template>
  <div class="page blog-post-page">
    <div v-if="loading" class="loading">
      <p>Chargement de l'article...</p>
    </div>

    <div v-else-if="!post" class="not-found">
      <div class="container">
        <h1>Article non trouvé</h1>
        <p>L'article que vous recherchez n'existe pas.</p>
        <router-link to="/blog" class="back-link">← Retour au blog</router-link>
      </div>
    </div>

    <template v-else>
      <!-- Hero section -->
      <section class="post-hero">
        <div class="container">
          <router-link to="/blog" class="back-link">← Retour au blog</router-link>
          <div class="post-tags">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="post-tag"
            >
              {{ tag }}
            </span>
          </div>
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <time class="post-date">
              {{ formatDate(post.date) }}
            </time>
            <span v-if="post.author" class="post-author">
              Par {{ post.author }}
            </span>
          </div>
          <p v-if="post.description" class="post-description">
            {{ post.description }}
          </p>
        </div>
      </section>

      <!-- Article content -->
      <section class="post-content">
        <div class="container">
          <article class="post-article">
            <div
              class="post-body"
              v-html="post.content"
            ></div>
          </article>

          <!-- Navigation -->
          <div class="post-navigation">
            <router-link to="/blog" class="nav-link">
              ← Tous les articles
            </router-link>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBlog } from '../composables/useBlog'

const route = useRoute()
const { getPostBySlug, loadPosts, loaded } = useBlog()

const loading = ref(true)
const post = computed(() => {
  const slug = route.params.slug
  const postBySlug = getPostBySlug(slug)
  return postBySlug.value
})

onMounted(async () => {
  await loadPosts()
  loading.value = false
  
  // Mettre à jour le titre de la page
  if (post.value) {
    document.title = `${post.value.title} - Blog SoloText`
  }
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.blog-post-page {
  background-color: #FFF8F0;
  color: #031815;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  min-height: 100vh;
}

.post-hero {
  background: linear-gradient(135deg, #32C4C0 0%, #019E8B 100%);
  color: #fff;
  padding: 80px 0 60px;
}

.post-hero .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.back-link {
  display: inline-block;
  color: #fff;
  text-decoration: none;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  transition: opacity 0.2s ease;
  font-weight: 500;
}

.back-link:hover {
  opacity: 1;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.post-tag {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.post-title {
  font-family: "Neulis Alt", sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2em;
  margin: 0 0 1.5rem;
}

.post-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  font-size: 16px;
}

.post-description {
  font-size: 18px;
  line-height: 1.6em;
  opacity: 0.9;
  margin: 0;
}

.post-content {
  padding: 60px 0;
}

.post-content .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.post-article {
  background: #fff;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 4px 16px rgba(3, 24, 21, 0.08);
  margin-bottom: 2rem;
}

.post-body {
  font-size: 18px;
  line-height: 1.8em;
  color: #031815;
}

.post-body :deep(h1),
.post-body :deep(h2),
.post-body :deep(h3) {
  font-family: "Neulis Alt", sans-serif;
  font-weight: 700;
  margin: 2rem 0 1rem;
  color: #031815;
}

.post-body :deep(h1) {
  font-size: 36px;
  border-bottom: 2px solid #E0F7F5;
  padding-bottom: 0.5rem;
}

.post-body :deep(h2) {
  font-size: 28px;
}

.post-body :deep(h3) {
  font-size: 24px;
}

.post-body :deep(p) {
  margin: 0 0 1.5rem;
}

.post-body :deep(ul),
.post-body :deep(ol) {
  margin: 1rem 0 1.5rem;
  padding-left: 2rem;
}

.post-body :deep(li) {
  margin: 0.5rem 0;
}

.post-body :deep(a) {
  color: #32C4C0;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.post-body :deep(a:hover) {
  color: #019E8B;
}

.post-body :deep(strong) {
  font-weight: 700;
  color: #031815;
}

.post-body :deep(em) {
  font-style: italic;
}

.post-body :deep(blockquote) {
  border-left: 4px solid #32C4C0;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #717F7D;
}

.post-body :deep(code) {
  background: #F2F7F6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.post-body :deep(pre) {
  background: #F2F7F6;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.post-body :deep(pre code) {
  background: none;
  padding: 0;
}

.post-navigation {
  text-align: center;
}

.nav-link {
  display: inline-block;
  color: #32C4C0;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #019E8B;
}

.loading,
.not-found {
  text-align: center;
  padding: 3rem;
  color: #717F7D;
  font-size: 18px;
}

.not-found .container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 2rem;
}

.not-found h1 {
  font-family: "Neulis Alt", sans-serif;
  font-size: 36px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 36px;
  }

  .post-article {
    padding: 32px 24px;
  }

  .post-body {
    font-size: 16px;
  }

  .post-body :deep(h1) {
    font-size: 28px;
  }

  .post-body :deep(h2) {
    font-size: 24px;
  }

  .post-body :deep(h3) {
    font-size: 20px;
  }
}
</style>

