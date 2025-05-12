import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Layers } from 'lucide-react' // Icon for the header
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card' // Using Card component

// Interface for Category data
interface Category {
  id: string
  name: string
  slug: string
  description?: string | null // Include description
}

// Metadata for the Categories page
export const metadata: Metadata = {
  title: 'Semua Kategori - Layar18',
  description: 'Jelajahi semua kategori video dewasa yang tersedia di Layar18.',
}

// Function to fetch all categories, sorted alphabetically
async function getAllCategories(): Promise<Category[]> {
  const payload = await getPayload({ config: await config })
  try {
    const { docs } = await payload.find({
      collection: 'categories',
      limit: 0, // Fetch all categories
      sort: 'name', // Sort alphabetically by name
      depth: 0, // No need for relationship depth here
    })
    return docs as unknown as Category[]
  } catch (error) {
    console.error('Error fetching all categories:', error)
    return []
  }
}

// The main Categories listing page component (Server Component)
export default async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-border/30 pb-4 flex items-center gap-3">
        <Layers className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Semua Kategori</h1>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              href={`/category/${category.slug}`}
              key={category.id}
              className="group block rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
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
      ) : (
        // Empty state if no categories are found
        <div className="text-center py-16 px-6 border border-dashed border-border/50 rounded-lg bg-card/50 shadow-sm">
          <h3 className="text-xl font-medium mb-2 text-foreground">Belum Ada Kategori</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sepertinya belum ada kategori video yang ditambahkan.
          </p>
        </div>
      )}
    </div>
  )
}
