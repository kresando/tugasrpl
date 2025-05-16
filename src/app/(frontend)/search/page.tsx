import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { VideoCard } from '../components/VideoCard'
import { notFound } from 'next/navigation'
import { Controls } from './controls'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { parse, subDays, subWeeks, subMonths, startOfDay } from 'date-fns'
import { ReadonlyURLSearchParams } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import React, { Suspense } from 'react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

// Definisikan URL server dengan nilai default jika tidak tersedia dari env
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const ITEMS_PER_PAGE = 12 // Definisikan item per halaman

interface Video {
  id: string
  title: string | null
  views?: number | null
  duration?: string | null
  slug?: string | null
  category?:
    | string
    | {
        id: string // Pastikan ID kategori ada
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
  createdAt: string // Tambahkan createdAt untuk sorting
}

// Perbarui SearchParams untuk menyertakan sort, filter, page
// Interface ini digunakan untuk tipe data internal
interface SearchParamsObject {
  q?: string
  sort?: 'latest' | 'most-viewed' // Opsi sorting yang valid
  filter?: 'today' | 'this-week' | 'this-month' | 'all-time' // Opsi filter yang valid
  page?: string // Page selalu string dari URL
}

// Fungsi generateMetadata tetap menggunakan Promise
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const params = await searchParams
  // Pastikan query adalah string tunggal untuk canonical dan keywords
  let singleQuery: string = ''
  if (typeof params?.q === 'string') {
    singleQuery = params.q
  } else if (Array.isArray(params?.q) && params.q.length > 0) {
    singleQuery = params.q[0]
  }

  const pageTitle = singleQuery
    ? `Hasil Pencarian untuk "${singleQuery}" - Layar18`
    : 'Cari Video - Layar18'
  const pageDescription = singleQuery
    ? `Temukan video terkait pencarian "${singleQuery}" di Layar18. Streaming konten dewasa, video viral, dan lainnya.`
    : 'Gunakan fitur pencarian Layar18 untuk menemukan video dewasa, bokep viral, JAV sub Indo, dan konten favorit lainnya dengan cepat.'

  const canonicalUrl = singleQuery
    ? `${SERVER_URL}/search?q=${encodeURIComponent(singleQuery)}`
    : `${SERVER_URL}/search`

  const ogImageUrl = `${SERVER_URL}/assets/seo/logo-og.webp` // Default OG image

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: singleQuery
      ? [
          `hasil pencarian ${singleQuery}`,
          singleQuery,
          `cari ${singleQuery}`,
          `video ${singleQuery}`,
          `Layar18 ${singleQuery}`,
          'pencarian video dewasa',
        ]
      : ['cari video dewasa', 'search Layar18', 'temukan video bokep', 'pencarian JAV sub Indo'],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: singleQuery ? 'index, follow' : 'noindex, follow', // Noindex jika query kosong
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: 'Layar18',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Layar18 Search Results',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
      site: '@YouKnowIt38',
      creator: '@YouKnowIt38',
    },
  }
}

// --- Wrap getVideosBySearchQuery with unstable_cache ---
const getVideosBySearchQuery = unstable_cache(
  async (searchParams: SearchParamsObject) => {
    console.log(`>>> Fetching videos for search: ${JSON.stringify(searchParams)}`) // Logging
    const payload = await getPayload({ config: await config })

    const query = searchParams?.q || ''
    const sortOption = searchParams?.sort || 'latest'
    const filterOption = searchParams?.filter || 'all-time'
    const page = parseInt(searchParams?.page || '1', 10)

    const where: any = {} // Gunakan 'any' untuk fleksibilitas query Payload

    // Filter berdasarkan query pencarian (jika ada)
    if (query) {
      where.title = {
        contains: query,
      }
    }

    // Tambahkan filter status published (penting!)
    where.status = { equals: 'published' }

    // Tambahkan filter waktu berdasarkan filterOption
    const now = new Date()
    switch (filterOption) {
      case 'today':
        where.createdAt = {
          greater_than_equal: startOfDay(now),
        }
        break
      case 'this-week':
        where.createdAt = {
          greater_than_equal: startOfDay(subWeeks(now, 1)),
        }
        break
      case 'this-month':
        where.createdAt = {
          greater_than_equal: startOfDay(subMonths(now, 1)),
        }
        break
      case 'all-time':
      default:
        // Tidak perlu filter waktu tambahan
        break
    }

    // Tentukan sorting berdasarkan sortOption
    let sort: string
    switch (sortOption) {
      case 'most-viewed':
        sort = '-views'
        break
      case 'latest':
      default:
        sort = '-createdAt'
        break
    }

    try {
      const paginatedVideos = await payload.find({
        collection: 'videos',
        where,
        limit: ITEMS_PER_PAGE,
        page,
        sort,
        depth: 1,
      })

      return {
        docs: paginatedVideos.docs as unknown as Video[],
        totalPages: paginatedVideos.totalPages,
        totalDocs: paginatedVideos.totalDocs,
      }
    } catch (error) {
      console.error('Error fetching videos by search query:', error)
      return { docs: [], totalPages: 0, totalDocs: 0 }
    }
  },
  ['videosBySearch'], // Cache key base
  {
    tags: ['videos', 'search'], // Tag umum untuk video dan search
    revalidate: 60, // Revalidasi setiap 60 detik
  },
)

// --- Komponen Baru untuk Menampilkan Grid Video Hasil Pencarian (Async) ---
async function SearchResultsGrid({ searchParams }: { searchParams: SearchParamsObject }) {
  const { docs: videos, totalPages, totalDocs } = await getVideosBySearchQuery(searchParams)
  const query = searchParams.q || ''
  const currentPage = parseInt(searchParams.page || '1', 10)

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-card flex flex-col items-center justify-center">
        <h3 className="text-xl font-medium mb-2">Tidak Ada Video Ditemukan</h3>
        <p className="text-muted-foreground">
          {query
            ? `Tidak ada hasil untuk \"${query}\". Coba kata kunci lain.`
            : 'Belum ada video yang tersedia.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        Menampilkan {videos.length} dari {totalDocs} video
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
        {videos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            priority={index === 0 && currentPage === 1} // Hanya prioritas di halaman 1
          />
        ))}
      </div>
    </>
  )
}

// --- Komponen Skeleton Fallback ---
function SearchResultsSkeleton() {
  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">Mencari video...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </>
  )
}

// Perbarui komponen halaman SearchPage
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams

  // Fungsi helper untuk validasi nilai literal
  const getValidSortOption = (value: string | string[] | undefined): SearchParamsObject['sort'] => {
    const strValue = Array.isArray(value) ? value[0] : value
    if (strValue === 'latest' || strValue === 'most-viewed') {
      return strValue
    }
    return 'latest' // Default
  }

  const getValidFilterOption = (
    value: string | string[] | undefined,
  ): SearchParamsObject['filter'] => {
    const strValue = Array.isArray(value) ? value[0] : value
    if (
      strValue === 'today' ||
      strValue === 'this-week' ||
      strValue === 'this-month' ||
      strValue === 'all-time'
    ) {
      return strValue
    }
    return 'all-time' // Default
  }

  // Konversi objek searchParams ke tipe internal kita dan handle string[] + validasi
  const currentSearchParams: SearchParamsObject = {
    // Gunakan awaitedSearchParams
    q: Array.isArray(awaitedSearchParams.q) ? awaitedSearchParams.q[0] : awaitedSearchParams.q,
    // Gunakan awaitedSearchParams
    sort: getValidSortOption(awaitedSearchParams.sort),
    // Gunakan awaitedSearchParams
    filter: getValidFilterOption(awaitedSearchParams.filter),
    // Gunakan awaitedSearchParams
    page:
      (Array.isArray(awaitedSearchParams.page)
        ? awaitedSearchParams.page[0]
        : awaitedSearchParams.page) ?? '1',
  }

  // Ambil totalPages di luar Suspense untuk Pagination
  // Panggil getVideosBySearchQuery dengan parameter yang akan digunakan untuk Suspense,
  // tapi cukup ambil totalPages.
  const { totalPages: initialTotalPages } = await getVideosBySearchQuery({
    ...currentSearchParams,
    page: '1', // Bisa gunakan halaman 1 untuk mendapatkan totalPages
    // Sebenarnya, nilai page tidak mempengaruhi totalPages dari Payload
  })
  const totalPages = initialTotalPages
  const query = currentSearchParams.q || ''

  // Dapatkan currentPage dari currentSearchParams
  const currentPage = parseInt(currentSearchParams.page || '1', 10)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {query ? `Hasil Pencarian: \"${query}\"` : 'Semua Video'}
        </h1>
        {/* Pesan jumlah video dipindahkan ke dalam SearchResultsGrid atau skeleton */}
      </div>

      <div className="mb-6">
        <Controls pathname={'/search'} />
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResultsGrid searchParams={currentSearchParams} />
      </Suspense>

      {/* Pagination Controls di luar Suspense */}
      {totalPages > 1 && (
        <PaginationControls
          totalPages={totalPages}
          currentPage={currentPage}
          // Margin sudah diatur di dalam komponen, className bisa ditambahkan jika perlu override
          // className="mt-12"
        />
      )}
    </div>
  )
}
