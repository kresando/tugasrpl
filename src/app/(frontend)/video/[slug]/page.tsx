import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache as NextCache } from 'next/cache'
import Link from 'next/link'
import { Suspense } from 'react'
import { VideoCard, type VideoCardProps } from '../../components/VideoCard'
import { VideoViewTracker } from '../components/VideoViewTracker'

// Pastikan NEXT_PUBLIC_SERVER_URL diatur di .env.local atau environment variables Anda
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// --- Interface Definisi ---
interface MediaSize {
  url?: string
  width?: number
  height?: number
  mimeType?: string
  filesize?: number
  filename?: string
}

interface Media {
  id: string
  alt?: string | null
  url?: string | null // URL gambar utama
  width?: number | null
  height?: number | null
  mimeType?: string | null
  sizes?: {
    card?: MediaSize
    thumbnail?: MediaSize
    // tambahkan ukuran lain jika ada
  }
}

interface VideoMeta {
  // Dari plugin SEO Payload
  title?: string
  description?: string
  image?: Media | string | null // Bisa objek Media atau URL string
}

interface CategoryOrTag {
  id: string
  name: string
  slug: string
}

interface Video {
  id: string
  title: string
  slug: string
  category?: CategoryOrTag | null
  tags?: CategoryOrTag[] | null
  thumbnail?: Media | null // Field thumbnail asli Anda
  linkEmbed?: string | null
  duration?: string | null // format "01:12:03"
  durationInSeconds?: number | null // durasi dalam detik
  views?: number | null
  description?: string | null // deskripsi utama video
  status?: 'published' | 'draft' | string
  createdAt: string // ISO String
  updatedAt?: string // ISO String
  meta?: VideoMeta // Field dari plugin SEO (otomatis terisi)
}

// --- Fungsi Helper & Cache ---
const getVideoDetails = NextCache(
  async (slug: string): Promise<Video | null> => {
    console.log(`>>> CACHE_DEBUG: getVideoDetails (hanya fetch) dipanggil untuk slug: ${slug}`)
    const payload = await getPayload({ config: await configPromise })

    try {
      const { docs } = await payload.find({
        collection: 'videos',
        where: { slug: { equals: slug }, status: { equals: 'published' } },
        limit: 1,
        depth: 2, // Tetap gunakan depth untuk data relasi lainnya
      })

      if (docs.length > 0) {
        const video = docs[0] as Video
        console.log(
          `>>> CACHE_DEBUG: Video ditemukan (hanya fetch): ${video.title}, views saat ini (dari DB/cache): ${video.views}`,
        )
        return video // Kembalikan video apa adanya
      } else {
        console.log(`>>> CACHE_DEBUG: Video dengan slug '${slug}' tidak ditemukan (hanya fetch).`)
        return null
      }
    } catch (error) {
      console.error(
        `>>> CACHE_DEBUG: Error di dalam getVideoDetails (hanya fetch) untuk slug '${slug}':`,
        error,
      )
      return null
    }
  },
  ['video_detail_page_v6_fetch_only'], // Cache key baru untuk membedakan
  {
    tags: ['videos_collection', 'video_detail_page_item'],
    revalidate: 10, // Revalidasi data video detail tetap bisa ada, Server Action akan menangani revalidasi tag untuk list
  },
)

// Fungsi baru untuk mengambil video terkait
const getRelatedVideos = NextCache(
  async ({
    currentVideoId,
    categoryId,
    limit = 4,
  }: {
    currentVideoId: string
    categoryId?: string | null
    limit?: number
  }): Promise<VideoCardProps['video'][]> => {
    if (!categoryId) {
      console.log('>>> No categoryId provided for related videos, returning empty.')
      return []
    }
    console.log(
      `>>> Fetching related videos for category: ${categoryId}, excluding: ${currentVideoId}`,
    )
    const payload = await getPayload({ config: await configPromise })
    try {
      const { docs } = await payload.find({
        collection: 'videos',
        where: {
          and: [
            { category: { equals: categoryId } },
            { id: { not_equals: currentVideoId } },
            { status: { equals: 'published' } },
          ],
        },
        limit,
        sort: '-createdAt', // Urutkan berdasarkan terbaru
        depth: 2, // Depth 2 untuk memastikan category dan thumbnail (termasuk sizes) ter-populate
      })
      return docs as any as VideoCardProps['video'][]
    } catch (error) {
      console.error(`Error fetching related videos for category '${categoryId}':`, error)
      return []
    }
  },
  ['related_videos_v3_typefix'],
  {
    tags: ['videos_collection', 'related_videos_list'],
    revalidate: 3600 * 6, // Revalidate setiap 6 jam, atau sesuaikan
  },
)

// Helper untuk mendapatkan URL gambar yang absolut dan alt text
const getImageAttributes = (
  imageField: Media | string | null | undefined,
  fallbackThumbnail?: Media | null,
  defaultAlt?: string,
): { url?: string; alt?: string; width?: number; height?: number } => {
  let imageObj: Media | null = null
  let imageUrlStr: string | null = null

  if (typeof imageField === 'string') {
    imageUrlStr = imageField
  } else if (imageField?.id) {
    // Check if it's a Media object
    imageObj = imageField as Media
  } else if (fallbackThumbnail?.id) {
    imageObj = fallbackThumbnail
  }

  const altText = imageObj?.alt || defaultAlt || 'Gambar Video'
  let finalUrl: string | undefined = undefined
  let width: number | undefined = imageObj?.width || undefined
  let height: number | undefined = imageObj?.height || undefined

  if (imageObj?.url) {
    finalUrl = imageObj.url.startsWith('http')
      ? imageObj.url
      : `${SERVER_URL}${imageObj.url.startsWith('/') ? '' : '/'}${imageObj.url}`
    // Prioritaskan ukuran card jika ada untuk OG, atau ukuran utama
    if (imageObj.sizes?.card?.url) {
      finalUrl = imageObj.sizes.card.url.startsWith('http')
        ? imageObj.sizes.card.url
        : `${SERVER_URL}${imageObj.sizes.card.url.startsWith('/') ? '' : '/'}${imageObj.sizes.card.url}`
      width = imageObj.sizes.card.width || width
      height = imageObj.sizes.card.height || height
    }
  } else if (imageUrlStr) {
    finalUrl = imageUrlStr.startsWith('http')
      ? imageUrlStr
      : `${SERVER_URL}${imageUrlStr.startsWith('/') ? '' : '/'}${imageUrlStr}`
  }

  return { url: finalUrl, alt: altText, width, height }
}

// Helper untuk konversi durasi
const formatDurationISO8601 = (
  durationStr?: string | null,
  durationSec?: number | null,
): string | undefined => {
  if (durationSec && durationSec > 0) {
    return `PT${durationSec}S`
  }
  if (!durationStr || typeof durationStr !== 'string') return undefined
  const parts = durationStr.split(':').map(Number)
  if (parts.some(isNaN)) return undefined

  let isoDuration = 'PT'
  if (parts.length === 3) {
    // HH:MM:SS
    if (parts[0] > 0) isoDuration += `${parts[0]}H`
    if (parts[1] > 0) isoDuration += `${parts[1]}M`
    if (parts[2] > 0) isoDuration += `${parts[2]}S`
  } else if (parts.length === 2) {
    // MM:SS
    if (parts[0] > 0) isoDuration += `${parts[0]}M`
    if (parts[1] > 0) isoDuration += `${parts[1]}S`
  } else if (parts.length === 1 && parts[0] > 0) {
    // Detik saja
    isoDuration += `${parts[0]}S`
  } else {
    return undefined
  }
  return isoDuration === 'PT' ? undefined : isoDuration // Hanya kembalikan jika ada durasi valid
}

// --- Metadata Function ---
export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await paramsPromise // Menggunakan await pada paramsPromise
  const video = await getVideoDetails(slug)

  if (!video) {
    return {
      title: 'Video Tidak Ditemukan - Layar18',
      description: 'Maaf, video yang Anda cari tidak ditemukan di Layar18.',
      robots: 'noindex, nofollow',
    }
  }

  const pageTitle = `${video.meta?.title || video.title} - Layar18`
  const pageDescription =
    video.meta?.description ||
    video.description ||
    `Tonton video ${video.title} terbaru hanya di Layar18.`

  const imageAttrs = getImageAttributes(video.meta?.image, video.thumbnail, video.title)

  const videoPageUrl = `${SERVER_URL}/video/${video.slug}`
  const videoTags = (video.tags?.map((tag) => tag.name).filter(Boolean) as string[]) || []

  const keywords = Array.from(
    new Set(
      [
        video.title,
        video.meta?.title,
        video.category?.name,
        `nonton ${video.title}`,
        `streaming ${video.title}`,
        ...videoTags.map((tag) => `${tag}`),
        ...videoTags.map((tag) => `video ${tag}`),
        'Layar18',
        'video viral',
        'film dewasa',
        // Anda bisa tambahkan keywords dari field khusus jika ada
      ]
        .filter((kw): kw is string => typeof kw === 'string' && kw.length > 0) // Filter lebih eksplisit
        .map((kw) => kw.toLowerCase()),
    ),
  )

  return {
    metadataBase: new URL(SERVER_URL),
    title: pageTitle,
    description: pageDescription,
    keywords: keywords,
    alternates: {
      canonical: videoPageUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: videoPageUrl,
      siteName: 'Layar18',
      ...(imageAttrs.url && {
        images: [
          {
            url: imageAttrs.url, // URL Absolut dari helper
            width: imageAttrs.width || 1200, // Default width
            height: imageAttrs.height || 630, // Default height
            alt: imageAttrs.alt,
          },
        ],
      }),
      locale: 'id_ID',
      type: 'video.movie', // Atau 'video.episode', 'video.other'
      videos: [
        {
          url: videoPageUrl, // URL halaman ini, karena linkEmbed adalah untuk iframe
          type: 'text/html', // Tipe konten untuk URL halaman
        },
      ],
      // Informasi video spesifik (opsional, tapi sangat baik untuk SEO)
      ...(video.createdAt && { 'video:release_date': new Date(video.createdAt).toISOString() }),
      ...(video.durationInSeconds && { 'video:duration': video.durationInSeconds }),
      ...(videoTags.length > 0 && { 'video:tag': videoTags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      site: '@YouKnowIt38',
      creator: '@YouKnowIt38',
      images: imageAttrs.url ? [imageAttrs.url] : [], // URL Absolut
    },
  }
}

// --- Komponen Placeholder (Ganti dengan implementasi Anda) ---
const Breadcrumbs = ({ video }: { video: Video }) => {
  const items = [
    { label: 'Home', href: '/' },
    ...(video.category
      ? [{ label: video.category.name, href: `/category/${video.category.slug}` }]
      : []),
    { label: video.title, href: `/video/${video.slug}`, isActive: true },
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && !item.isActive ? { item: `${SERVER_URL}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="breadcrumb" className="mb-4 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <span key={item.label}>
            {item.href && !item.isActive ? (
              <Link href={item.href} className="hover:text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
            {index < items.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </nav>
    </>
  )
}

const VideoPlayerDisplay = ({ embedUrl, title }: { embedUrl?: string | null; title: string }) => {
  if (!embedUrl) return <p className="text-center text-red-500">Link embed video tidak tersedia.</p>
  return (
    <div className="aspect-video w-full bg-black rounded-lg shadow-xl overflow-hidden mb-6">
      <iframe
        src={embedUrl}
        title={`Player untuk ${title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
      ></iframe>
    </div>
  )
}

// Modifikasi RelatedVideosDisplay
async function RelatedVideosDisplay({
  currentVideoId,
  categoryId,
}: {
  currentVideoId: string
  categoryId?: string | null
}) {
  const relatedVideos = await getRelatedVideos({ currentVideoId, categoryId })

  if (!relatedVideos || relatedVideos.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Video Terkait</h2>
        <p className="text-muted-foreground">Tidak ada video terkait yang ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Video Terkait</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedVideos.map((video, index) => (
          <VideoCard key={video.id} video={video} priority={index < 2} className="h-full" />
        ))}
      </div>
    </div>
  )
}

// --- Komponen Halaman Utama ---
export default async function VideoPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await paramsPromise // Menggunakan await pada paramsPromise
  const video = await getVideoDetails(slug)

  if (!video || video.status !== 'published') {
    notFound()
  }

  const isoDuration = formatDurationISO8601(video.duration, video.durationInSeconds)
  const videoPageUrl = `${SERVER_URL}/video/${video.slug}`
  const imageAttrs = getImageAttributes(video.meta?.image, video.thumbnail, video.title)

  const videoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.meta?.title || video.title,
    description:
      video.meta?.description || video.description || `Tonton ${video.title} selengkapnya.`,
    ...(imageAttrs.url && { thumbnailUrl: imageAttrs.url }),
    uploadDate: new Date(video.createdAt).toISOString(),
    ...(isoDuration && { duration: isoDuration }),
    contentUrl: videoPageUrl, // URL halaman ini
    ...(video.linkEmbed && { embedUrl: video.linkEmbed }), // URL player jika ada
    publisher: {
      '@type': 'Organization',
      name: 'Layar18',
      logo: {
        '@type': 'ImageObject',
        url: `${SERVER_URL}/assets/seo/logo-og.webp`, // Pastikan logo ini ada
        // width: 600, // Opsional, sesuaikan
        // height: 60, // Opsional, sesuaikan
      },
    },
    ...(video.views && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: { '@type': 'WatchAction' },
        userInteractionCount: video.views,
      },
    }),
    ...(video.category?.name && { genre: video.category.name }),
    keywords:
      video.tags
        ?.map((tag) => tag.name)
        .filter(Boolean)
        .join(', ') || undefined,
  }

  return (
    <>
      {video.id && <VideoViewTracker videoId={video.id} />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      {/* Breadcrumb JSON-LD sudah di dalam komponen Breadcrumbs */}

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Suspense fallback={<div className="h-6 mb-4 w-1/2 bg-muted rounded animate-pulse"></div>}>
          <Breadcrumbs video={video} />
        </Suspense>

        <article>
          <header className="mb-4 md:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2">
              {video.title}
            </h1>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Diunggah pada:{' '}
                {new Date(video.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {video.views !== null && video.views !== undefined && (
                <span>{video.views.toLocaleString('id-ID')} Kali Dilihat</span>
              )}
              {video.duration && <span>Durasi: {video.duration}</span>}
            </div>
            {video.category?.slug && video.category?.name && (
              <div className="mt-2 text-sm">
                Kategori:{' '}
                <Link
                  href={`/category/${video.category.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {video.category.name}
                </Link>
              </div>
            )}
          </header>

          <VideoPlayerDisplay embedUrl={video.linkEmbed} title={video.title} />

          {video.tags && video.tags.length > 0 && (
            <section className="mb-6">
              <h3 className="text-md font-semibold mb-2 text-foreground">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) =>
                  tag.slug && tag.name ? (
                    <Link
                      key={tag.slug}
                      href={`/tag/${tag.slug}`}
                      className="text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2.5 py-1 rounded-full transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ) : null,
                )}
              </div>
            </section>
          )}

          {video.description && (
            <section className="prose prose-sm sm:prose-base prose-invert max-w-none mb-8 bg-card/30 p-4 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-foreground border-b border-border/50 pb-2">
                Deskripsi Lengkap
              </h2>
              {/* Hati-hati menggunakan dangerouslySetInnerHTML jika deskripsi bisa mengandung HTML dari user.
                  Jika murni teks atau markdown yang sudah diproses aman, tidak masalah. */}
              <div
                dangerouslySetInnerHTML={{ __html: video.description.replace(/\n/g, '<br />') }}
              />
            </section>
          )}

          <Suspense
            fallback={
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Video Terkait</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card p-3 rounded-lg shadow animate-pulse">
                      <div className="aspect-video bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <RelatedVideosDisplay currentVideoId={video.id} categoryId={video.category?.id} />
          </Suspense>
        </article>
      </div>
    </>
  )
}
