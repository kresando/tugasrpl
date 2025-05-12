import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { VideoCard } from '../components/VideoCard'
import { notFound } from 'next/navigation'
import { Controls } from './controls'
import PaginationControls from './Pagination'
import { parse, subDays, subWeeks, subMonths, startOfDay } from 'date-fns'
import { ReadonlyURLSearchParams } from 'next/navigation'

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
  const query = params?.q?.[0] || params?.q || '' // Handle string | string[]
  const title = query ? `Hasil Pencarian untuk "${query}" - Layar18` : 'Cari Video - Layar18'
  const description = query
    ? `Temukan video terkait "${query}" di Layar18.`
    : 'Temukan video dewasa yang ingin kamu tonton di Layar18.'

  return {
    title,
    description,
    // Tambahkan canonical URL jika diperlukan
    // alternates: {
    //   canonical: `/search?q=${encodeURIComponent(query)}`,
    // },
  }
}

// Perbarui fungsi getVideos untuk menerima objek searchParams biasa
async function getVideosBySearchQuery(searchParams: SearchParamsObject) {
  const payload = await getPayload({ config: await config })

  const query = searchParams?.q || ''
  const sortOption = searchParams?.sort || 'latest'
  const filterOption = searchParams?.filter || 'all-time'
  const page = parseInt(searchParams?.page || '1', 10)

  const where: any = {} // Gunakan 'any' untuk fleksibilitas query Payload

  // Filter berdasarkan query pencarian (jika ada)
  if (query) {
    where.title = {
      contains: query, // Gunakan 'contains' untuk pencarian yang lebih fleksibel
    }
  }

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
      depth: 1, // Pastikan depth 1 untuk mengambil data relasi kategori
    })

    return {
      docs: paginatedVideos.docs as unknown as Video[],
      totalPages: paginatedVideos.totalPages,
      totalDocs: paginatedVideos.totalDocs,
    }
  } catch (error) {
    console.error('Error fetching videos by search query:', error)
    // Kembalikan struktur data kosong jika terjadi error
    return { docs: [], totalPages: 0, totalDocs: 0 }
  }
}

// Perbarui komponen halaman SearchPage
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams di awal
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

  const { docs: videos, totalPages, totalDocs } = await getVideosBySearchQuery(currentSearchParams) // Kirim objek biasa
  const query = currentSearchParams.q || ''

  // Buat instance ReadonlyURLSearchParams HANYA untuk PaginationControls
  const paginationSearchParams = new URLSearchParams()
  // Gunakan currentSearchParams yang sudah divalidasi
  if (currentSearchParams.q) paginationSearchParams.set('q', currentSearchParams.q)
  if (currentSearchParams.sort) paginationSearchParams.set('sort', currentSearchParams.sort)
  if (currentSearchParams.filter) paginationSearchParams.set('filter', currentSearchParams.filter)
  if (currentSearchParams.page) paginationSearchParams.set('page', currentSearchParams.page)
  const readonlyPaginationSearchParams = new ReadonlyURLSearchParams(paginationSearchParams)

  // Dapatkan pathname saat ini untuk PaginationControls
  // Ini perlu cara yang lebih baik di Next.js App Router,
  // untuk sementara kita hardcode atau cari cara lain jika perlu.
  const pathname = '/search' // Asumsi path saat ini

  return (
    // Gunakan layout konsisten
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {query ? `Hasil Pencarian: "${query}"` : 'Semua Video'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Menampilkan {videos.length} dari {totalDocs} video
        </p>
      </div>

      {/* Tambahkan Controls */}
      <div className="mb-6">
        {/* Hapus prop searchParams saat memanggil Controls */}
        <Controls pathname={pathname} />
      </div>

      {/* Tampilkan hasil atau pesan 'tidak ditemukan' */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-card flex flex-col items-center justify-center">
          <h3 className="text-xl font-medium mb-2">Tidak Ada Video Ditemukan</h3>
          <p className="text-muted-foreground">
            {query
              ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain.`
              : 'Belum ada video yang tersedia.'}
          </p>
        </div>
      )}

      {/* Tambahkan PaginationControls jika total halaman > 1 */}
      {totalPages > 1 && (
        <div className="mt-12">
          <PaginationControls
            totalPages={totalPages}
            // Kirim ReadonlyURLSearchParams ke PaginationControls
            searchParams={readonlyPaginationSearchParams}
            pathname={pathname}
          />
        </div>
      )}
    </div>
  )
}
