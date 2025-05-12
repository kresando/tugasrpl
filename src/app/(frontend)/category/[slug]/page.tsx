import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { VideoCard } from '../../components/VideoCard'
import { Controls } from './controls'
import { Pagination } from './pagination'
import type { Where } from 'payload'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// Definisikan URL server dengan nilai default jika tidak tersedia dari env
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Define types (can be moved to a shared types file)
interface Video {
  id: string
  title: string | null
  views?: number | null
  duration?: string | null
  slug?: string | null
  createdAt: string
  category?: {
    name?: string
    slug?: string
  } | null
  thumbnail?: {
    url?: string
    alt?: string
    sizes?: {
      card?: { url?: string }
    }
  } | null
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
}

const VIDEOS_PER_PAGE = 12

// Define Promise types for props as per Next.js 15 convention
type PageParams = Promise<{ slug: string }>
type PageSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// Metadata dinamis berdasarkan kategori
export async function generateMetadata({
  params, // params is now a Promise
}: {
  params: PageParams
}): Promise<Metadata> {
  const { slug } = await params // Await the promise to get the slug
  const category = await getCategory(slug)

  if (!category) return { title: 'Kategori Tidak Ditemukan' }

  return {
    title: `${category.name} - Layar18`,
    description: category.description || `Tonton video dewasa kategori ${category.name} di Layar18`,
  }
}

// Function to fetch category details (unchanged)
async function getCategory(slug: string): Promise<Category | null> {
  const payload = await getPayload({ config: await config })
  try {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    return docs.length > 0 ? (docs[0] as unknown as Category) : null
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

// Function to fetch videos (unchanged)
async function getVideosByCategory({
  categorySlug,
  page = 1,
  sort = '-createdAt',
  filter = 'all',
}: {
  categorySlug: string
  page?: number
  sort?: string
  filter?: string
}): Promise<{ videos: Video[]; totalPages: number; totalDocs: number }> {
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
      where.createdAt = { greater_than_equal: startOfMonth(now), less_than_equal: endOfMonth(now) }
      break
  }
  try {
    const { docs, totalPages, totalDocs } = await payload.find({
      collection: 'videos',
      where,
      limit: VIDEOS_PER_PAGE,
      page,
      sort,
      depth: 1,
    })
    return { videos: docs as unknown as Video[], totalPages, totalDocs }
  } catch (error) {
    console.error('Error fetching videos:', error)
    return { videos: [], totalPages: 0, totalDocs: 0 }
  }
}

// Main Page Component
export default async function CategoryPage({
  params, // params is a Promise
  searchParams, // searchParams is a Promise
}: {
  params: PageParams
  searchParams: PageSearchParams
}) {
  // Await Promises to get the actual objects
  const awaitedParams = await params
  const awaitedSearchParams = await searchParams

  // Access properties from the awaited objects
  const slug = awaitedParams.slug
  const { page: pageQuery, sort: sortQuery, filter: filterQuery } = awaitedSearchParams || {}

  // Parse values with defaults
  const page = Number(pageQuery ?? '1')
  const sort = String(sortQuery ?? '-createdAt')
  const filter = String(filterQuery ?? 'all')

  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const { videos, totalPages, totalDocs } = await getVideosByCategory({
    categorySlug: slug,
    page,
    sort,
    filter,
  })

  return (
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
        {videos.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Menampilkan {videos.length} dari {totalDocs} video
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  className="transition-transform duration-200 ease-in-out hover:scale-[1.03]"
                />
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <div className="text-center py-16 px-6 border border-dashed border-border/50 rounded-lg bg-card/50 shadow-sm">
            <h3 className="text-xl font-medium mb-2 text-foreground">Yah, Kosong Nih...</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sepertinya belum ada video untuk kategori &ldquo;{category.name}&rdquo; dengan filter
              yang dipilih. Coba ubah filter atau kembali lagi nanti!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
