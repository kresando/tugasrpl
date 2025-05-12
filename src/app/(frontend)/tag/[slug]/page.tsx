import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { VideoCard } from '../../components/VideoCard' // Assuming path is correct
import { Controls } from './controls'
import { Pagination } from './pagination'
import type { Where } from 'payload'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// Types (Consider moving shared types to a dedicated file)
interface Video {
  id: string
  title: string | null
  views?: number | null
  duration?: string | null
  slug?: string | null
  createdAt: string
  category?: { name?: string; slug?: string } | null // Keep category for VideoCard if needed
  thumbnail?: { url?: string; alt?: string; sizes?: { card?: { url?: string } } } | null
}

interface Tag {
  id: string
  name: string
  slug: string
  // Add other tag fields if they exist, e.g., description
}

const VIDEOS_PER_PAGE = 12

// Promise types for props
type PageParams = Promise<{ slug: string }>
type PageSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// Generate Metadata for Tag Page
export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTag(slug)

  if (!tag) return { title: 'Tag Tidak Ditemukan' }

  return {
    title: `${tag.name} - Layar18`,
    description: `Tonton video dewasa dengan tag ${tag.name} di Layar18`,
    // Add canonical URL etc. if needed
  }
}

// Function to fetch tag details
async function getTag(slug: string): Promise<Tag | null> {
  const payload = await getPayload({ config: await config })
  try {
    const { docs } = await payload.find({
      collection: 'tags', // Changed collection to 'tags'
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    return docs.length > 0 ? (docs[0] as unknown as Tag) : null
  } catch (error) {
    console.error('Error fetching tag:', error)
    return null
  }
}

// Function to fetch videos by tag
async function getVideosByTag({
  tagSlug,
  page = 1,
  sort = '-createdAt',
  filter = 'all',
}: {
  tagSlug: string
  page?: number
  sort?: string
  filter?: string
}): Promise<{ videos: Video[]; totalPages: number; totalDocs: number }> {
  const payload = await getPayload({ config: await config })

  const where: Where = {
    // Updated the where clause to filter by tags relationship
    tags: {
      // Assumes the relationship field in 'videos' collection pointing to 'tags' is named 'tags'
      contains: (await getTag(tagSlug))?.id, // Filter by tag ID
    },
    status: {
      equals: 'published',
    },
  }

  // Apply time filter
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
    // Fetch only videos that contain the specified tag ID
    const { docs, totalPages, totalDocs } = await payload.find({
      collection: 'videos',
      where,
      limit: VIDEOS_PER_PAGE,
      page,
      sort,
      depth: 1, // Depth 1 to populate necessary fields for VideoCard (like thumbnail)
    })
    return { videos: docs as unknown as Video[], totalPages, totalDocs }
  } catch (error) {
    console.error('Error fetching videos by tag:', error)
    return { videos: [], totalPages: 0, totalDocs: 0 }
  }
}

// Tag Page Component
export default async function TagPage({
  params,
  searchParams,
}: {
  params: PageParams
  searchParams: PageSearchParams
}) {
  const awaitedParams = await params
  const awaitedSearchParams = await searchParams

  const slug = awaitedParams.slug
  const { page: pageQuery, sort: sortQuery, filter: filterQuery } = awaitedSearchParams || {}

  const page = Number(pageQuery ?? '1')
  const sort = String(sortQuery ?? '-createdAt')
  const filter = String(filterQuery ?? 'all')

  const tag = await getTag(slug)

  if (!tag) {
    notFound()
  }

  const { videos, totalPages, totalDocs } = await getVideosByTag({
    tagSlug: slug,
    page,
    sort,
    filter,
  })

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Tag Header */}
      <div className="mb-6 border-b border-border/30 pb-4">
        {/* Consider adding a Tag icon */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">Tag: {tag.name}</h1>
        {/* Add tag description if available in schema */}
      </div>

      {/* Controls */}
      <Controls defaultSort={sort} defaultFilter={filter} />

      {/* Video Grid & Pagination */}
      <div>
        {videos.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Menampilkan {videos.length} dari {totalDocs} video dengan tag &ldquo;{tag.name}&rdquo;
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
              Sepertinya belum ada video untuk tag &ldquo;{tag.name}&rdquo; dengan filter yang
              dipilih. Coba ubah filter atau kembali lagi nanti!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
