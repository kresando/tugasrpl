import { getPayload } from 'payload'
import Link from 'next/link'
import config from '@/payload.config'
import { ArrowRight, Film, FlameIcon } from 'lucide-react'
import { VideoCard } from './components/VideoCard'
import { unstable_cache } from 'next/cache'
import React, { Suspense } from 'react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import type { Metadata } from 'next'

// Definisikan URL server dengan nilai default jika tidak tersedia dari env
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// --- Metadata untuk Homepage ---
export async function generateMetadata(): Promise<Metadata> {
  const title = 'Layar18: Platform Streaming Video Dewasa Viral Terbaru 2025'
  const description =
    'Selamat datang di Layar18, destinasi utama Anda untuk menemukan dan menikmati ribuan video bokep Indo viral terbaru 2025 serta koleksi JAV Sub Indo paling update. Streaming gratis, kualitas terbaik, update tiap hari.'
  const ogImageUrl = `${SERVER_URL}/assets/seo/logo-og.webp`
  const twitterImageUrl = `${SERVER_URL}/assets/seo/banner-twitter.png`

  return {
    title: title,
    description: description,
    keywords: [
      'layar18',
      'nonton bokep indo',
      'streaming jav sub indo',
      'video bokep terbaru 2025',
      'bokep viral indonesia',
      'jav subtitle indonesia terbaru',
      'koleksi video dewasa gratis',
      'nonton film dewasa online',
      'streaming bokep kualitas HD',
      'bokep indo viral 2025',
      'jav sub indo no sensor',
      'layar 18 streaming',
      'situs nonton bokep terbaru',
      'download video jav sub indo',
      'live streaming bokep',
      'film dewasa indonesia full',
      'nonton jav terbaru 2025 subtitle indonesia',
      'layar18 alternatif',
      'bokep indo terpanas',
      'jav hd sub indo',
    ],
    alternates: {
      canonical: SERVER_URL,
    },
    robots: 'index, follow',
    openGraph: {
      title: title,
      description: description,
      url: SERVER_URL,
      siteName: 'Layar18',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Layar18 - Nonton Video Dewasa Online',
        },
      ],
      type: 'website',
      locale: 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [twitterImageUrl],
      site: '@YouKnowIt38',
      creator: '@YouKnowIt38',
    },
  }
}

interface Video {
  id: string
  title: string | null
  views?: number | null
  duration?: string | null
  slug?: string | null
  category?:
    | string
    | {
        name?: string
        slug?: string
      }
    | null
  thumbnail?: {
    url?: string
    alt?: string
    sizes?: {
      card?: {
        url?: string
      }
    }
  } | null
}

// --- Wrap getVideos with unstable_cache ---
const getVideos = unstable_cache(
  async (categorySlug: string, limit: number = 8): Promise<Video[]> => {
    console.log(`>>> Fetching videos for homepage: ${categorySlug}, limit: ${limit}`)
    const payload = await getPayload({ config: await config })

    try {
      const { docs } = await payload.find({
        collection: 'videos',
        limit,
        sort: '-createdAt',
        depth: 1,
        where: {
          'category.slug': {
            equals: categorySlug,
          },
          status: { equals: 'published' },
        },
      })
      return docs as unknown as Video[]
    } catch (error) {
      console.error(`Error fetching videos for ${categorySlug}:`, error)
      return []
    }
  },
  ['homeVideos_v2_tagged'],
  {
    tags: ['videos_collection', 'homepage_videos_list'],
    revalidate: 300,
  },
)

const VIDEOS_PER_SECTION = 8

// --- Komponen Baru untuk Menampilkan Grid Video di Homepage (Async) ---
async function HomepageVideoGrid({
  categorySlug,
  priorityFirst,
}: {
  categorySlug: string
  priorityFirst: boolean
}) {
  const videos = await getVideos(categorySlug, VIDEOS_PER_SECTION)

  if (videos.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">
          Tidak ada video tersedia untuk kategori ini saat ini.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {videos.map((video, index) => (
        <VideoCard key={video.id} video={video} priority={index === 0 && priorityFirst} />
      ))}
    </div>
  )
}

// --- Komponen Skeleton Fallback untuk Homepage Grid ---
function HomepageVideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: VIDEOS_PER_SECTION }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

// --- Schema.org JSON-LD untuk Homepage ---
const WebSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Layar18',
  url: SERVER_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SERVER_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  description: 'Platform streaming video dewasa online terbaru dan terlengkap.',
}

export default async function Home() {
  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WebSiteJsonLd) }}
      />

      <h1 className="sr-only">Layar18 - Platform Streaming Video Dewasa Viral Terbaru 2025</h1>

      <div className="container mx-auto px-4 pt-10 pb-6 max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Layar18: Platform Streaming Video Dewasa Viral Terbaru 2025
        </h2>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Selamat datang di <strong>Layar18</strong>, destinasi utama Anda untuk menemukan dan
          menikmati ribuan <strong>video bokep Indo viral terbaru 2025</strong> serta koleksi{' '}
          <strong>JAV Sub Indo</strong> paling update. Kami berkomitmen menyediakan akses streaming
          gratis dengan kualitas video terbaik dan pembaruan konten setiap hari. Nikmati kemudahan
          menonton beragam hiburan dewasa favorit Anda, hanya di Layar18.
        </p>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl space-y-16">
        {/* Bokep Indo Section */}
        <section aria-labelledby="bokep-indo-heading">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-500/10 backdrop-blur-sm shadow-[2px_2px_8px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.05)]">
                <FlameIcon className="h-5 w-5 text-red-500" />
              </div>
              <h2 id="bokep-indo-heading" className="text-2xl font-bold">
                Bokep Indo
              </h2>
            </div>
            <Link
              href="/category/bokep-indo"
              className="group flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium 
            bg-background/80 text-foreground backdrop-blur-sm transition-all duration-200
            hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]"
              aria-label="Lihat semua video kategori Bokep Indo"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <Suspense fallback={<HomepageVideoGridSkeleton />}>
            <HomepageVideoGrid categorySlug="bokep-indo" priorityFirst={true} />
          </Suspense>
        </section>

        {/* JAV Sub Indo Section */}
        <section aria-labelledby="jav-sub-indo-heading">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-500/10 backdrop-blur-sm shadow-[2px_2px_8px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.05)]">
                <Film className="h-5 w-5 text-blue-500" />
              </div>
              <h2 id="jav-sub-indo-heading" className="text-2xl font-bold">
                JAV Sub Indo
              </h2>
            </div>
            <Link
              href="/category/jav-sub-indo"
              className="group flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium 
            bg-background/80 text-foreground backdrop-blur-sm transition-all duration-200
            hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]"
              aria-label="Lihat semua video kategori JAV Sub Indo"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <Suspense fallback={<HomepageVideoGridSkeleton />}>
            <HomepageVideoGrid categorySlug="jav-sub-indo" priorityFirst={true} />
          </Suspense>
        </section>
      </div>
    </>
  )
}
