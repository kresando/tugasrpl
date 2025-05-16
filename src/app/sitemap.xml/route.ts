import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { Video, Category, Tag } from '@/payload-types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://layar18.com'

async function getAllPublishedVideos(): Promise<Video[]> {
  const payload = await getPayloadHMR({ config: configPromise })
  try {
    const videos = await payload.find({
      collection: 'videos',
      where: {
        status: { equals: 'published' },
      },
      limit: 10000, // Ambil semua video yang dipublikasikan
      depth: 0, // Kita hanya butuh slug dan updatedAt
      overrideAccess: false,
      user: undefined, // Akses publik
    })
    return videos.docs
  } catch (error) {
    console.error('Error fetching videos for sitemap:', error)
    return []
  }
}

async function getAllCategories(): Promise<Category[]> {
  const payload = await getPayloadHMR({ config: configPromise })
  try {
    const categories = await payload.find({
      collection: 'categories',
      limit: 1000, // Asumsi jumlah kategori tidak terlalu banyak
      depth: 0,
      overrideAccess: false,
      user: undefined,
    })
    return categories.docs
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
    return []
  }
}

async function getAllTags(): Promise<Tag[]> {
  const payload = await getPayloadHMR({ config: configPromise })
  try {
    const tags = await payload.find({
      collection: 'tags',
      limit: 2000, // Asumsi jumlah tag tidak terlalu banyak
      depth: 0,
      overrideAccess: false,
      user: undefined,
    })
    return tags.docs
  } catch (error) {
    console.error('Error fetching tags for sitemap:', error)
    return []
  }
}

export async function GET() {
  const videos = await getAllPublishedVideos()
  const categories = await getAllCategories()
  const tags = await getAllTags()

  const staticPages = [
    { url: '/', lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
    {
      url: '/categories',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/tags',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/tentang',
      lastModified: new Date('2025-05-01').toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }, // Sesuaikan tanggal jika halaman ini diupdate
    {
      url: '/syarat-ketentuan',
      lastModified: new Date('2025-05-01').toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }, // Sesuaikan tanggal jika halaman ini diupdate
  ]

  const sitemapEntries = staticPages.map(
    (page) => `
    <url>
      <loc>${SITE_URL}${page.url}</loc>
      <lastmod>${page.lastModified.split('T')[0]}</lastmod>
      <changefreq>${page.changeFrequency}</changefreq>
      <priority>${page.priority}</priority>
    </url>`,
  )

  videos.forEach((video) => {
    if (video.slug && video.updatedAt) {
      sitemapEntries.push(`
    <url>
      <loc>${SITE_URL}/video/${video.slug}</loc>
      <lastmod>${video.updatedAt.split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`)
    }
  })

  categories.forEach((category) => {
    if (category.slug && category.updatedAt) {
      sitemapEntries.push(`
    <url>
      <loc>${SITE_URL}/category/${category.slug}</loc>
      <lastmod>${category.updatedAt.split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`)
    }
  })

  tags.forEach((tag) => {
    if (tag.slug && tag.updatedAt) {
      sitemapEntries.push(`
    <url>
      <loc>${SITE_URL}/tag/${tag.slug}</loc>
      <lastmod>${tag.updatedAt.split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`)
    }
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries.join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
