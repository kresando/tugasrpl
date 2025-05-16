import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { VideoCard } from '../../components/VideoCard'
import { Controls } from './controls'
import { Pagination } from './pagination'
import type { Where } from 'payload'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { unstable_cache } from 'next/cache'
import React, { Suspense } from 'react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

// Define SERVER_URL based on NEXT_PUBLIC_SERVER_URL with a fallback
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Types (Consider moving shared types to a dedicated file)
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
  category?: { name?: string; slug?: string } | null
  thumbnail?: VideoThumbnail | null
}

interface TagSEOImage {
  id?: string
  url?: string
  alt?: string
  filename?: string
}

interface TagSEO {
  title?: string
  description?: string
  image?: TagSEOImage | string | null
}

interface Tag {
  id: string
  name: string
  slug: string
  description?: string | null
  seo?: TagSEO | null
}

const VIDEOS_PER_PAGE = 12
const VIDEOS_FOR_JSON_LD = 4

// Promise types for props
type PageParams = Promise<{ slug: string }>
type PageSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// Generate Metadata for Tag Page
export async function generateMetadata({
  params: promiseParams,
}: {
  params: PageParams
}): Promise<Metadata> {
  const { slug } = await promiseParams
  const tag = await getTag(slug)

  if (!tag) {
    return {
      title: 'Tag Tidak Ditemukan - Layar18',
      description: 'Maaf, tag yang Anda cari tidak ditemukan di Layar18.',
      robots: 'noindex, nofollow',
    }
  }

  const pageTitle = tag.seo?.title || `Video Tag ${tag.name}: Konten Dewasa Viral 2025 - Layar18`
  const pageDescription =
    tag.seo?.description ||
    tag.description ||
    `Jelajahi semua video dengan tag ${tag.name} di Layar18. Konten terbaru dan terpopuler ada di sini.`

  const keywords = Array.from(
    new Set(
      [
        tag.name,
        `video ${tag.name}`,
        `nonton ${tag.name}`,
        `streaming ${tag.name}`,
        `${tag.name} terbaru`,
        `${tag.name} 2025`,
        `Layar18 ${tag.name}`,
        'video dewasa viral',
        'konten tag populer',
        ...(tag.seo?.title?.split(' ') || []),
        ...(tag.description?.split(' ').slice(0, 7) || []),
      ]
        .filter(Boolean)
        .map((kw) => kw.toLowerCase()),
    ),
  )

  let ogImageUrl = `${SERVER_URL}/assets/seo/logo-og.webp`
  let twitterImageUrl = `${SERVER_URL}/assets/seo/banner-twitter.png`
  let ogImageAlt = `Konten dengan tag ${tag.name} di Layar18`

  if (tag.seo?.image) {
    const seoImg = tag.seo.image
    if (typeof seoImg === 'object' && seoImg.url) {
      const fullUrl = seoImg.url.startsWith('http')
        ? seoImg.url
        : `${SERVER_URL}${seoImg.url.startsWith('/') ? seoImg.url : '/' + seoImg.url}`
      ogImageUrl = fullUrl
      twitterImageUrl = fullUrl
      ogImageAlt = seoImg.alt || `Gambar untuk tag ${tag.name}`
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
      canonical: `${SERVER_URL}/tag/${tag.slug}`,
    },
    robots: 'index, follow',
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${SERVER_URL}/tag/${tag.slug}`,
      siteName: 'Layar18',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: ogImageAlt }],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [twitterImageUrl],
      site: '@YouKnowIt38',
      creator: '@YouKnowIt38',
    },
  }
}

// Function to fetch tag details
const getTag = unstable_cache(
  async (slug: string): Promise<Tag | null> => {
    console.log(`>>> Fetching tag (detail): ${slug}`)
    const payload = await getPayload({ config: await config })
    try {
      const { docs } = await payload.find({
        collection: 'tags',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
      })
      return docs.length > 0 ? (docs[0] as unknown as Tag) : null
    } catch (error) {
      console.error(`Error fetching tag '${slug}':`, error)
      return null
    }
  },
  ['tag_detail_v1_final'],
  {
    tags: ['tags_collection', 'tag_detail_page'],
    revalidate: 3600,
  },
)

// Function to fetch videos by tag
const getVideosByTag = unstable_cache(
  async (params: {
    tagSlug: string
    page?: number
    limit?: number
    sort?: string
    filter?: string
  }): Promise<{ videos: Video[]; totalPages: number; totalDocs: number }> => {
    const {
      tagSlug,
      page = 1,
      limit = VIDEOS_PER_PAGE,
      sort = '-createdAt',
      filter = 'all',
    } = params

    console.log(
      `>>> Fetching videos for tag: ${tagSlug}, page: ${page}, limit: ${limit}, sort: ${sort}, filter: ${filter}`,
    )
    const payload = await getPayload({ config: await config })

    const tagData = await getTag(tagSlug)
    if (!tagData?.id) {
      console.warn(`Tag with slug '${tagSlug}' not found or has no ID, cannot fetch videos.`)
      return { videos: [], totalPages: 0, totalDocs: 0 }
    }

    const where: Where = {
      tags: { contains: tagData.id },
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
      console.error(`Error fetching videos by tag '${tagSlug}':`, error)
      return { videos: [], totalPages: 0, totalDocs: 0 }
    }
  },
  ['videosByTag_detail_v2_final'],
  {
    tags: ['videos_collection', 'videosByTag_page'],
    revalidate: 600,
  },
)

// --- New Component: TagVideoGridSkeleton ---
function TagVideoGridSkeleton() {
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

// --- New Component: TagVideoGrid (Async) ---
async function TagVideoGrid({
  tagSlug,
  tagId,
  page,
  sort,
  filter,
}: {
  tagSlug: string
  tagId: string
  page: number
  sort: string
  filter: string
}) {
  const { videos, totalDocs: countForThisPageQuery } = await getVideosByTag({
    tagSlug,
    page,
    sort,
    filter,
    limit: VIDEOS_PER_PAGE,
  })

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Tidak ada video yang cocok dengan filter saat ini di halaman ini.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {videos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            className="transition-transform duration-200 ease-in-out hover:scale-[1.03]"
            priority={index < 4 && page === 1}
          />
        ))}
      </div>
    </>
  )
}

// Tag Page Component
export default async function TagPage({
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

  const tagPromise = getTag(slug)
  const videosForJsonLdPromise = getVideosByTag({
    tagSlug: slug,
    page: 1,
    limit: VIDEOS_FOR_JSON_LD,
    sort,
    filter,
  })
  const paginationDataPromise = getVideosByTag({
    tagSlug: slug,
    page: 1,
    limit: 1,
    sort,
    filter,
  })

  const [tag, videosForJsonLdData, paginationData] = await Promise.all([
    tagPromise,
    videosForJsonLdPromise,
    paginationDataPromise,
  ])

  if (!tag) {
    notFound()
  }

  const totalDocs = paginationData.totalDocs
  const totalPages = Math.ceil(totalDocs / VIDEOS_PER_PAGE)

  const pageTitle = tag.seo?.title || `Video Tag ${tag.name}: Konten Dewasa Viral 2025 - Layar18`
  const pageSeoDescription =
    tag.seo?.description ||
    tag.description ||
    `Jelajahi semua video dengan tag ${tag.name} di Layar18. Konten terbaru dan terpopuler ada di sini.`

  let jsonLdTagThumbnailUrl = `${SERVER_URL}/assets/seo/logo-og.webp`
  if (tag.seo?.image) {
    const seoImg = tag.seo.image
    if (typeof seoImg === 'object' && seoImg.url) {
      jsonLdTagThumbnailUrl = seoImg.url.startsWith('http')
        ? seoImg.url
        : `${SERVER_URL}${seoImg.url.startsWith('/') ? seoImg.url : '/' + seoImg.url}`
    } else if (typeof seoImg === 'string' && seoImg.startsWith('/')) {
      jsonLdTagThumbnailUrl = `${SERVER_URL}${seoImg}`
    }
  }

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
      itemListElement: any[]
    }
  }

  const jsonLd: JsonLdType = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageSeoDescription,
    url: `${SERVER_URL}/tag/${tag.slug}`,
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
        let videoThumbnailUrl = jsonLdTagThumbnailUrl
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
            name: video.title || `Video Populer dengan Tag ${tag.name}`,
            description: video.description || pageSeoDescription,
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">Tag: {tag.name}</h1>
          {tag.description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-3xl">
              {tag.description}
            </p>
          )}
        </div>

        <Controls defaultSort={sort} defaultFilter={filter} />

        <div>
          {totalDocs > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Ditemukan {totalDocs} video dengan tag &ldquo;{tag.name}&rdquo;. Menampilkan halaman{' '}
                {page} dari {totalPages}.
              </p>
              <Suspense fallback={<TagVideoGridSkeleton />}>
                <TagVideoGrid
                  tagSlug={slug}
                  tagId={tag.id}
                  page={page}
                  sort={sort}
                  filter={filter}
                />
              </Suspense>
              {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />}
            </>
          ) : (
            <div className="text-center py-16 px-6 border border-dashed border-border/50 rounded-lg bg-card/50 shadow-sm">
              <h3 className="text-xl font-medium mb-2 text-foreground">Yah, Kosong Nih...</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Sepertinya belum ada video untuk tag &ldquo;{tag.name}&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
