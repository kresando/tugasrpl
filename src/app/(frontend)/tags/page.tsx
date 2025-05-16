import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge' // Using Badge component for styling
import { Tag as TagIcon } from 'lucide-react' // Icon for the header
import { PaginationControls } from '@/components/ui/PaginationControls' // <-- Ganti impor
import { ReadonlyURLSearchParams } from 'next/navigation'
import { unstable_cache } from 'next/cache' // <-- Impor

// DEFINE SERVER_URL - Asumsikan ini didapat dari environment variable
const SERVER_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Interface for Tag data
interface Tag {
  id: string
  name: string
  slug: string
  // Add description or other fields if needed for display
}

// Metadata for the Tags page
export async function generateMetadata(): Promise<Metadata> {
  const title = 'Semua Tag Video Dewasa Populer - Layar18'
  const description =
    'Temukan semua tag video bokep viral dan JAV Sub Indo terbaru 2025 di Layar18. Navigasi mudah berdasarkan tag populer untuk konten dewasa favoritmu, gratis dan update setiap hari.'
  const keywords = [
    'tag video dewasa',
    'daftar tag bokep',
    'tag JAV sub indo',
    'tag populer Layar18',
    'semua tag Layar18',
    'navigasi tag video',
    'tag bokep indo',
    'tag JAV terbaru',
    'video berdasarkan tag',
  ]
  const ogImageUrl = `${SERVER_URL}/assets/seo/logo-og.webp` // Gunakan logo umum

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SERVER_URL}/tags`,
    },
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: `${SERVER_URL}/tags`,
      siteName: 'Layar18',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Logo Layar18',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      site: '@YouKnowIt38',
      creator: '@YouKnowIt38',
    },
  }
}

const TAGS_PER_PAGE = 50 // Jumlah tag per halaman (sesuaikan jika perlu)

// --- Wrap getPaginatedTags with unstable_cache ---
const getPaginatedTags = unstable_cache(
  async ({
    page = 1,
  }: {
    page?: number
  }): Promise<{ docs: Tag[]; totalPages: number; totalDocs: number }> => {
    console.log(`>>> Fetching tags, page: ${page}`) // Logging
    const payload = await getPayload({ config: await config })
    try {
      const result = await payload.find({
        collection: 'tags',
        limit: TAGS_PER_PAGE,
        page,
        sort: 'name',
        depth: 0,
      })
      return {
        docs: result.docs as unknown as Tag[],
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
      }
    } catch (error) {
      console.error('Error fetching paginated tags:', error)
      return { docs: [], totalPages: 0, totalDocs: 0 }
    }
  },
  ['tags_list'], // Mengubah cache key base agar unik
  {
    tags: ['tags_page_data'], // Menggunakan tag yang lebih spesifik untuk cache data halaman ini
    revalidate: 3600, // Revalidasi setiap 1 jam
  },
)

// Tipe untuk searchParams Promise
type PageSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// The main Tags listing page component (Server Component)
export default async function TagsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const awaitedSearchParams = await searchParams
  const page = Number(awaitedSearchParams?.page ?? '1')

  const { docs: tags, totalPages, totalDocs } = await getPaginatedTags({ page })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Semua Tag Video Dewasa Populer - Layar18',
    description:
      'Temukan semua tag video bokep viral dan JAV Sub Indo terbaru 2025 di Layar18. Navigasi mudah berdasarkan tag populer untuk konten dewasa favoritmu, gratis dan update setiap hari.',
    url: `${SERVER_URL}/tags`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 border-b border-border/30 pb-4 flex items-center gap-3">
          <TagIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Semua Tag</h1>
        </div>
        {totalDocs > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Menampilkan {tags.length} dari {totalDocs} total tag yang tersedia.
          </p>
        )}

        {/* Tags Grid */}
        {tags.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  href={`/tag/${tag.slug}`}
                  key={tag.id}
                  aria-label={`Lihat video dengan tag ${tag.name}`}
                >
                  <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-muted">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && <PaginationControls totalPages={totalPages} currentPage={page} />}
          </>
        ) : (
          // Empty state if no tags are found
          <div className="text-center py-16 px-6 border border-dashed border-border/50 rounded-lg bg-card/50 shadow-sm">
            <h3 className="text-xl font-medium mb-2 text-foreground">Belum Ada Tag</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Saat ini belum ada tag video yang ditambahkan. Silakan cek kembali nanti.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
