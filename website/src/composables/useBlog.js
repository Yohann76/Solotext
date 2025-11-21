import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import yaml from 'js-yaml'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const posts = ref([])
const loaded = ref(false)

// Charger toutes les images du blog au démarrage
const blogImages = import.meta.glob('../assets/blog/*.{jpg,jpeg,png,webp,svg}', { 
  eager: true 
})

/**
 * Parse le front matter YAML d'un fichier Markdown
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)
  
  if (!match) {
    return { data: {}, content }
  }
  
  const yamlContent = match[1]
  const markdownContent = match[2]
  
  try {
    const data = yaml.load(yamlContent) || {}
    return { data, content: markdownContent }
  } catch (error) {
    console.error('Erreur lors du parsing YAML:', error)
    return { data: {}, content: markdownContent }
  }
}

/**
 * Charge une image d'article par son nom
 */
function getPostImage(imageName) {
  if (!imageName) return null
  
  try {
    // Chercher l'image correspondante dans les images chargées
    const imagePath = Object.keys(blogImages).find(path => {
      const fileName = path.split('/').pop()
      return fileName === imageName || fileName.includes(imageName)
    })
    
    return imagePath ? blogImages[imagePath].default : null
  } catch (error) {
    console.error('Erreur lors du chargement de l\'image:', error)
    return null
  }
}

/**
 * Charge tous les articles Markdown
 */
export async function loadPosts() {
  if (loaded.value) return posts.value

  try {
    // Import dynamique de tous les fichiers Markdown comme texte brut
    const modules = import.meta.glob('../content/posts/*.md', { 
      eager: true,
      as: 'raw'
    })
    
    posts.value = Object.entries(modules).map(([path, rawContent]) => {
      const { data: frontMatter, content } = parseFrontMatter(rawContent)
      
      // Générer un slug à partir du nom de fichier
      const slug = path
        .split('/')
        .pop()
        .replace(/\.md$/, '')
      
      // Parser le Markdown en HTML
      const htmlContent = md.render(content)
      
      // Charger l'image header si spécifiée dans le front matter
      const imageHeader = frontMatter.imageHeader ? getPostImage(frontMatter.imageHeader) : null
      
      return {
        slug,
        ...frontMatter,
        imageHeader,
        content: htmlContent,
        rawContent: content,
        date: new Date(frontMatter.date)
      }
    })
    
    // Trier par date (plus récent en premier)
    posts.value.sort((a, b) => b.date - a.date)
    
    loaded.value = true
    return posts.value
  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error)
    return []
  }
}

/**
 * Récupère tous les articles
 */
export function getAllPosts() {
  return computed(() => posts.value)
}

/**
 * Récupère un article par son slug
 */
export function getPostBySlug(slug) {
  return computed(() => posts.value.find(post => post.slug === slug))
}

/**
 * Récupère les derniers articles
 */
export function getLatestPosts(limit = 10) {
  return computed(() => posts.value.slice(0, limit))
}

/**
 * Récupère les articles par tag
 */
export function getPostsByTag(tag) {
  return computed(() => 
    posts.value.filter(post => 
      post.tags && post.tags.includes(tag)
    )
  )
}

/**
 * Recherche d'articles par titre ou description
 */
export function searchPosts(query) {
  const lowerQuery = query.toLowerCase()
  return computed(() => 
    posts.value.filter(post => 
      post.title?.toLowerCase().includes(lowerQuery) ||
      post.description?.toLowerCase().includes(lowerQuery) ||
      post.content?.toLowerCase().includes(lowerQuery)
    )
  )
}

/**
 * Récupère tous les tags uniques
 */
export function getAllTags() {
  return computed(() => {
    const tagsSet = new Set()
    posts.value.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => tagsSet.add(tag))
      }
    })
    return Array.from(tagsSet).sort()
  })
}

/**
 * Composable principal
 */
export function useBlog() {
  return {
    posts: getAllPosts(),
    loadPosts,
    getPostBySlug,
    getLatestPosts,
    getPostsByTag,
    searchPosts,
    getAllTags,
    loaded: computed(() => loaded.value)
  }
}

