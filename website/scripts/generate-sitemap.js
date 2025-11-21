import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
// L'URL de base peut être définie via la variable d'environnement VITE_BASE_URL
// Sinon, utilisez l'URL par défaut (à mettre à jour pour la production)
const BASE_URL = process.env.VITE_BASE_URL || process.env.BASE_URL || 'https://solotext.io'
const CONTENT_DIR = join(__dirname, '../src/content/posts')
const OUTPUT_FILE = join(__dirname, '../public/sitemap.xml')

// Routes statiques du site
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/fonctionnalites', priority: '0.9', changefreq: 'monthly' },
  { path: '/tarifs', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
  { path: '/politique-confidentialite', priority: '0.3', changefreq: 'yearly' },
  { path: '/cgu', priority: '0.3', changefreq: 'yearly' },
  { path: '/cgv', priority: '0.3', changefreq: 'yearly' }
]

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
 * Génère un slug à partir du nom de fichier
 */
function generateSlug(filename) {
  return filename.replace(/\.md$/, '')
}

/**
 * Charge tous les articles de blog et extrait leurs métadonnées
 */
function loadBlogPosts() {
  try {
    const files = readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'))
    const posts = []

    for (const file of files) {
      const filePath = join(CONTENT_DIR, file)
      const content = readFileSync(filePath, 'utf-8')
      const stats = statSync(filePath)
      const { data: frontMatter } = parseFrontMatter(content)
      const slug = generateSlug(file)

      // Utiliser la date de modification du fichier ou la date du front matter
      const fileLastMod = stats.mtime.toISOString().split('T')[0]
      const frontMatterDate = frontMatter.date ? new Date(frontMatter.date).toISOString().split('T')[0] : null
      const frontMatterUpdated = frontMatter.updated ? new Date(frontMatter.updated).toISOString().split('T')[0] : null

      posts.push({
        slug,
        date: frontMatterDate || fileLastMod,
        lastmod: frontMatterUpdated || frontMatterDate || fileLastMod
      })
    }

    // Trier par date (plus récent en premier)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date))

    return posts
  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error)
    return []
  }
}

/**
 * Formate une date pour le sitemap (format ISO 8601)
 */
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString()
  const date = new Date(dateString)
  return date.toISOString()
}

/**
 * Génère le XML du sitemap
 */
function generateSitemap(routes, blogPosts) {
  const urls = [
    ...routes.map(route => ({
      loc: `${BASE_URL}${route.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: route.changefreq,
      priority: route.priority
    })),
    ...blogPosts.map(post => ({
      loc: `${BASE_URL}/blog/${post.slug}`,
      lastmod: formatDate(post.lastmod).split('T')[0],
      changefreq: 'monthly',
      priority: '0.7'
    }))
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return xml
}

/**
 * Fonction principale
 */
function main() {
  console.log('🚀 Génération du sitemap.xml...')
  
  // Charger les articles de blog
  const blogPosts = loadBlogPosts()
  console.log(`📝 ${blogPosts.length} article(s) de blog trouvé(s)`)
  
  // Générer le sitemap
  const sitemap = generateSitemap(staticRoutes, blogPosts)
  
  // Écrire le fichier
  writeFileSync(OUTPUT_FILE, sitemap, 'utf-8')
  
  console.log(`✅ Sitemap généré avec succès : ${OUTPUT_FILE}`)
  console.log(`   - ${staticRoutes.length} route(s) statique(s)`)
  console.log(`   - ${blogPosts.length} article(s) de blog`)
  console.log(`   - Total: ${staticRoutes.length + blogPosts.length} URL(s)`)
}

// Exécuter le script
main()

