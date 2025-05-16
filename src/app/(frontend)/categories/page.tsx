import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Layers } from 'lucide-react' // Icon for the header
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card' // Using Card component
import { PaginationControls } from '@/components/ui/PaginationControls' // <-- Ganti impor
import { ReadonlyURLSearchParams } from 'next/navigation'
import { unstable_cache } from 'next/cache' // <-- Impor

// DEFINE SERVER_URL - Asumsikan ini didapat dari environment variable
const SERVER_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Interface for Category data
interface Category {
  id: string
  name: string
  slug: string
  description?: string | null // Include description
}

// Metadata for the Categories page
export async function generateMetadata(): Promise<Metadata> {
  const title = 'Semua Kategori Video Dewasa - Layar18'
  const description =
    'Jelajahi semua kategori video bokep viral dan JAV Sub Indo terbaru 2025 di Layar18. Temukan koleksi lengkap kami untuk pengalaman streaming gratis dan berkualitas.'
  const keywords = [
    'kategori video dewasa',
    'daftar kategori bokep',
    'kategori JAV sub indo',
    'koleksi video Layar18',
    'semua kategori Layar18',
    'streaming video kategori',
    'bokep indo kategori',
    'JAV terbaru kategori',
  ]
  const ogImageUrl = `${SERVER_URL}/assets/seo/logo-og.webp` // Gunakan logo umum jika tidak ada gambar spesifik kategori

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SERVER_URL}/categories`,
    },
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: `${SERVER_URL}/categories`,
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

const CATEGORIES_PER_PAGE = 24 // Jumlah kategori per halaman (sesuaikan jika perlu)

// --- Wrap getPaginatedCategories with unstable_cache ---
const getPaginatedCategories = unstable_cache(
  async ({
    page = 1,
  }: {
    page?: number
  }): Promise<{ docs: Category[]; totalPages: number; totalDocs: number }> => {
    console.log(`>>> Fetching categories, page: ${page}`) // Logging
    const payload = await getPayload({ config: await config })
    try {
      const result = await payload.find({
        collection: 'categories',
        limit: CATEGORIES_PER_PAGE,
        page,
        sort: 'name',
        depth: 0,
      })
      return {
        docs: result.docs as unknown as Category[],
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
      }
    } catch (error) {
      console.error('Error fetching paginated categories:', error)
      return { docs: [], totalPages: 0, totalDocs: 0 }
    }
  },
  ['categories'], // Cache key base
  {
    tags: ['categories_page_data'], // Menggunakan tag yang lebih spesifik untuk cache data halaman ini
    revalidate: 3600, // Revalidasi setiap 1 jam
  },
)

// Tipe untuk searchParams
// Mengembalikan tipe ke Promise sesuai indikasi error dan kemungkinan kode original
type PageSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// The main Categories listing page component (Server Component)
export default async function CategoriesPage({ searchParams }: { searchParams: PageSearchParams }) {
  const awaitedSearchParams = await searchParams // Menambahkan await kembali
  const page = Number(awaitedSearchParams?.page ?? '1') // Menggunakan hasil await

  const { docs: categories, totalPages, totalDocs } = await getPaginatedCategories({ page })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Semua Kategori Video Dewasa - Layar18',
    description:
      'Jelajahi semua kategori video bokep viral dan JAV Sub Indo terbaru 2025 di Layar18. Temukan koleksi lengkap kami untuk pengalaman streaming gratis dan berkualitas.',
    url: `${SERVER_URL}/categories`,
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
          <Layers className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Semua Kategori</h1>
        </div>
        {totalDocs > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Menampilkan {categories.length} dari {totalDocs} total kategori yang tersedia.
          </p>
        )}

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((category) => (
                <Link
                  href={`/category/${category.slug}`}
                  key={category.id}
                  className="group block rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                  aria-label={`Lihat video dalam kategori ${category.name}`}
                >
                  <Card className="h-full transition-all duration-300 ease-in-out bg-card/80 group-hover:bg-card border-border/50 shadow-sm group-hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      {category.description && (
                        <CardDescription className="mt-1 text-sm line-clamp-2">
                          {category.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {/* Optional: Add CardContent or CardFooter if needed */}
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && <PaginationControls totalPages={totalPages} currentPage={page} />}
          </>
        ) : (
          // Empty state if no categories are found
          <div className="text-center py-16 px-6 border border-dashed border-border/50 rounded-lg bg-card/50 shadow-sm">
            <h3 className="text-xl font-medium mb-2 text-foreground">Belum Ada Kategori</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Saat ini belum ada kategori video yang ditambahkan. Silakan cek kembali nanti.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
