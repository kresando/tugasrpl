import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { VideoCard } from '../../components/VideoCard'
import { Controls } from './controls'
import { PaginationControls } from '@/components/ui/PaginationControls'
import type { Where } from 'payload'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import React, { Suspense } from 'react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { ReadonlyURLSearchParams } from 'next/navigation'
import { unstable_cache } from 'next/cache'

// Definisikan URL server dengan nilai default jika tidak tersedia dari env
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Define types (can be moved to a shared types file)
interface VideoThumbnail {
  url?: string
  alt?: string
  sizes?: {
    card?: { url?: string }
  }
}

interface Video {
  id: string
  title: string | null
  slug?: string | null
  description?: string | null
  views?: number | null
  duration?: string | null
  createdAt: string
  updatedAt?: string
  category?: {
    name?: string
    slug?: string
  } | null
  thumbnail?: VideoThumbnail | null
}

interface CategorySEOImage {
  id?: string
  url?: string
  alt?: string
  filename?: string
}

interface CategorySEO {
  title?: string
  description?: string
  image?: CategorySEOImage | string | null
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  seo?: CategorySEO | null
}

const VIDEOS_PER_PAGE = 12
const VIDEOS_FOR_JSON_LD = 4

// Define Promise types for props as per Next.js 15 convention
type PageParams = Promise<{ slug: string }>
type PageSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// Metadata dinamis berdasarkan kategori
export async function generateMetadata({
  params: promiseParams,
}: {
  params: PageParams
}): Promise<Metadata> {
  const { slug } = await promiseParams
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Kategori Tidak Ditemukan - Layar18',
      description: 'Maaf, kategori yang Anda cari tidak ditemukan di Layar18.',
      robots: 'noindex, nofollow',
    }
  }

  const pageTitle =
    category.seo?.title || `Nonton Video Bokep Kategori ${category.name} Terbaru 2025 - Layar18`
  const pageDescription =
    category.seo?.description ||
    category.description ||
    `Nikmati koleksi lengkap video bokep ${category.name} terbaru dan terpopuler tahun 2025 di Layar18. Streaming gratis, kualitas terbaik, dan update setiap hari untuk pengalaman menonton tak terlupakan!`

  const keywords = Array.from(
    new Set(
      [
        category.name,
        `video ${category.name}`,
        `nonton ${category.name}`,
        `bokep ${category.name}`,
        `${category.name} terbaru`,
        `${category.name} 2025`,
        `Layar18 ${category.name}`,
        'streaming video dewasa',
        'bokep indo viral',
        'JAV sub indo',
        ...(category.seo?.title?.split(' ') || []),
        ...(category.description?.split(' ').slice(0, 7) || []),
      ]
        .filter(Boolean)
        .map((kw) => kw.toLowerCase()),
    ),
  )

  let ogImageUrl = `${SERVER_URL}/assets/seo/logo-og.webp`
  let twitterImageUrl = `${SERVER_URL}/assets/seo/banner-twitter.png`
  let ogImageAlt = `Video Kategori ${category.name} di Layar18`

  if (category.seo?.image) {
    const seoImg = category.seo.image
    if (typeof seoImg === 'object' && seoImg.url) {
      const fullUrl = seoImg.url.startsWith('http')
        ? seoImg.url
        : `${SERVER_URL}${seoImg.url.startsWith('/') ? seoImg.url : '/' + seoImg.url}`
      ogImageUrl = fullUrl
      twitterImageUrl = fullUrl
      ogImageAlt = seoImg.alt || `Gambar untuk kategori ${category.name}`
    } else if (typeof seoImg === 'string' && seoImg.startsWith('/')) {
      ogImageUrl = `${SERVER_URL}${seoImg}`
      twitterImageUrl = ogImageUrl
    }
  }

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords,
    alternates: {
      canonical: `${SERVER_URL}/category/${category.slug}`,
    },
    robots: 'index, follow',
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${SERVER_URL}/category/${category.slug}`,
      siteName: 'Layar18',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [twitterImageUrl],
    },
  }
}

// --- Wrap getCategory with unstable_cache ---
const getCategory = unstable_cache(
  async (slug: string): Promise<Category | null> => {
    console.log(`>>> Fetching category (detail): ${slug}`)
    const payload = await getPayload({ config: await config })
    try {
      const { docs } = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
      })
      return docs.length > 0 ? (docs[0] as unknown as Category) : null
    } catch (error) {
      console.error(`Error fetching category '${slug}':`, error)
      return null
    }
  },
  ['category_detail_v5'],
  {
    tags: ['categories_collection', 'category_detail'],
    revalidate: 3600,
  },
)

// --- Wrap getVideosByCategory with unstable_cache ---
const getVideosByCategory = unstable_cache(
  async (params: {
    categorySlug: string
    page?: number
    limit?: number
    sort?: string
    filter?: string
  }): Promise<{ videos: Video[]; totalPages: number; totalDocs: number }> => {
    const {
      categorySlug,
      page = 1,
      limit = VIDEOS_PER_PAGE,
      sort = '-createdAt',
      filter = 'all',
    } = params
    console.log(
      `>>> Fetching videos for category (detail): ${categorySlug}, page: ${page}, sort: ${sort}, filter: ${filter}, limit: ${limit}`,
    )
    const payload = await getPayload({ config: await config })
    const where: Where = {
      'category.slug': { equals: categorySlug },
      status: { equals: 'published' },
    }
    const now = new Date()
    switch (filter) {
      case 'today':
        where.createdAt = { greater_than_equal: startOfDay(now), less_than_equal: endOfDay(now) }
        break
      case 'week':
        where.createdAt = { greater_than_equal: startOfWeek(now), less_than_equal: endOfWeek(now) }
        break
      case 'month':
        where.createdAt = {
          greater_than_equal: startOfMonth(now),
          less_than_equal: endOfMonth(now),
        }
        break
    }
    try {
      const { docs, totalPages, totalDocs } = await payload.find({
        collection: 'videos',
        where,
        limit,
        page,
        sort,
        depth: 1,
      })
      return { videos: docs as unknown as Video[], totalPages, totalDocs }
    } catch (error) {
      console.error(`Error fetching videos for category '${categorySlug}':`, error)
      return { videos: [], totalPages: 0, totalDocs: 0 }
    }
  },
  ['videosByCategory_detail_v5'],
  {
    tags: ['videos_collection', 'videosByCategory_detail'],
    revalidate: 600,
  },
)

// Komponen Baru untuk Menampilkan Grid Video (Async)
async function VideoGrid({
  categorySlug,
  page,
  sort,
  filter,
}: {
  categorySlug: string
  page: number
  sort: string
  filter: string
}) {
  const { videos, totalPages, totalDocs } = await getVideosByCategory({
    categorySlug,
    page,
    sort,
    filter,
  })

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 px-6 border border-dashed border-border/50 rounded-lg bg-card/50 shadow-sm">
        <h3 className="text-xl font-medium mb-2 text-foreground">Yah, Kosong Nih...</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sepertinya belum ada video untuk kategori ini dengan filter yang dipilih. Coba ubah filter
          atau kembali lagi nanti!
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        Menampilkan {videos.length} dari {totalDocs} video
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {videos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            className="transition-transform duration-200 ease-in-out hover:scale-[1.03]"
            priority={index === 0 && page === 1}
          />
        ))}
      </div>
    </>
  )
}

// Komponen Skeleton Fallback
function VideoGridSkeleton() {
  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">Memuat video...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: VIDEOS_PER_PAGE }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </>
  )
}

// Main Page Component
export default async function CategoryPage({
  params: promiseParams,
  searchParams: promiseSearchParams,
}: {
  params: PageParams
  searchParams: PageSearchParams
}) {
  const { slug } = await promiseParams
  const awaitedSearchParams = await promiseSearchParams

  const { page: pageQuery, sort: sortQuery, filter: filterQuery } = awaitedSearchParams || {}

  const page = Number(pageQuery ?? '1')
  const sort = String(sortQuery ?? '-createdAt')
  const filter = String(filterQuery ?? 'all')

  const categoryPromise = getCategory(slug)
  const videosForJsonLdPromise = getVideosByCategory({
    categorySlug: slug,
    page: 1,
    limit: VIDEOS_FOR_JSON_LD,
    sort,
    filter,
  })
  const paginationDataPromise = getVideosByCategory({
    categorySlug: slug,
    page: 1,
    limit: 1,
    sort,
    filter,
  })

  const [category, videosForJsonLdData, paginationData] = await Promise.all([
    categoryPromise,
    videosForJsonLdPromise,
    paginationDataPromise,
  ])

  if (!category) {
    notFound()
  }

  const totalDocs = paginationData.totalDocs
  const totalPages = Math.ceil(totalDocs / VIDEOS_PER_PAGE)

  // Buat ReadonlyURLSearchParams untuk PaginationControls
  const urlSearchParams = new URLSearchParams()
  if (awaitedSearchParams?.page) urlSearchParams.set('page', String(page))
  if (awaitedSearchParams?.sort) urlSearchParams.set('sort', sort)
  if (awaitedSearchParams?.filter) urlSearchParams.set('filter', filter)
  const readonlyPaginationSearchParams = new ReadonlyURLSearchParams(urlSearchParams)

  const pathname = `/category/${slug}`

  // JSON-LD Schema
  const pageTitle =
    category.seo?.title || `Nonton Video Bokep Kategori ${category.name} Terbaru 2025 - Layar18`
  const pageDescription =
    category.seo?.description ||
    category.description ||
    `Nikmati koleksi lengkap video bokep ${category.name} terbaru dan terpopuler tahun 2025 di Layar18. Streaming gratis, kualitas terbaik, dan update setiap hari!`

  let jsonLdCategoryThumbnailUrl = `${SERVER_URL}/assets/seo/logo-og.webp`
  if (category.seo?.image) {
    const seoImg = category.seo.image
    if (typeof seoImg === 'object' && seoImg.url) {
      jsonLdCategoryThumbnailUrl = seoImg.url.startsWith('http')
        ? seoImg.url
        : `${SERVER_URL}${seoImg.url.startsWith('/') ? seoImg.url : '/' + seoImg.url}`
    } else if (typeof seoImg === 'string' && seoImg.startsWith('/')) {
      jsonLdCategoryThumbnailUrl = `${SERVER_URL}${seoImg}`
    }
  }

  // Mendefinisikan tipe untuk jsonLd agar bisa menerima mainEntity secara opsional
  type JsonLdType = {
    '@context': string
    '@type': string
    name: string
    description: string
    url: string
    isPartOf: { '@type': string; name: string; url: string }
    publisher: { '@type': string; name: string; logo: { '@type': string; url: string } }
    mainEntity?: {
      '@type': string
      numberOfItems: number
      itemListElement: any[] // Ganti any[] dengan tipe yang lebih spesifik jika perlu
    }
  }

  const jsonLd: JsonLdType = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: `${SERVER_URL}/category/${category.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'Layar18', url: SERVER_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Layar18',
      logo: { '@type': 'ImageObject', url: `${SERVER_URL}/assets/seo/logo-og.webp` },
    },
  }

  if (videosForJsonLdData && videosForJsonLdData.videos.length > 0) {
    jsonLd.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: videosForJsonLdData.totalDocs,
      itemListElement: videosForJsonLdData.videos.map((video, index) => {
        let videoThumbnailUrl = jsonLdCategoryThumbnailUrl
        if (video.thumbnail) {
          if (video.thumbnail.url) {
            videoThumbnailUrl = video.thumbnail.url.startsWith('http')
              ? video.thumbnail.url
              : `${SERVER_URL}${video.thumbnail.url.startsWith('/') ? video.thumbnail.url : '/' + video.thumbnail.url}`
          } else if (video.thumbnail.sizes?.card?.url) {
            videoThumbnailUrl = video.thumbnail.sizes.card.url.startsWith('http')
              ? video.thumbnail.sizes.card.url
              : `${SERVER_URL}${video.thumbnail.sizes.card.url.startsWith('/') ? video.thumbnail.sizes.card.url : '/' + video.thumbnail.sizes.card.url}`
          }
        }
        const videoUrl = `${SERVER_URL}/video/${video.slug}`

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'VideoObject',
            name: video.title || `Video Populer Kategori ${category.name}`,
            description: video.description || pageDescription,
            thumbnailUrl: videoThumbnailUrl,
            uploadDate: video.createdAt,
            contentUrl: videoUrl,
            url: videoUrl,
            publisher: { '@type': 'Organization', name: 'Layar18' },
          },
        }
      }),
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 border-b border-border/30 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">{category.name}</h1>
          {category.description && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        <Controls defaultSort={sort} defaultFilter={filter} />

        <div>
          <Suspense fallback={<VideoGridSkeleton />}>
            <VideoGrid categorySlug={slug} page={page} sort={sort} filter={filter} />
          </Suspense>

          {totalPages > 1 && <PaginationControls totalPages={totalPages} currentPage={page} />}
        </div>
      </div>
    </>
  )
}
