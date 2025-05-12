import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge' // Using Badge component for styling
import { Tag as TagIcon } from 'lucide-react' // Icon for the header

// Interface for Tag data
interface Tag {
  id: string
  name: string
  slug: string
  // Add description or other fields if needed for display
}

// Metadata for the Tags page
export const metadata: Metadata = {
  title: 'Semua Tag - Layar18',
  description: 'Jelajahi semua tag video dewasa yang tersedia di Layar18.',
}

// Function to fetch all tags, sorted alphabetically
async function getAllTags(): Promise<Tag[]> {
  const payload = await getPayload({ config: await config })
  try {
    const { docs } = await payload.find({
      collection: 'tags',
      limit: 0, // Fetch all tags (use with caution if you have thousands)
      sort: 'name', // Sort alphabetically by name
      depth: 0, // No need for relationship depth here
    })
    return docs as unknown as Tag[]
  } catch (error) {
    console.error('Error fetching all tags:', error)
    return []
  }
}

// The main Tags listing page component (Server Component)
export default async function TagsPage() {
  const tags = await getAllTags()

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-border/30 pb-4 flex items-center gap-3">
        <TagIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Semua Tag</h1>
      </div>

      {/* Tags Grid */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link href={`/tag/${tag.slug}`} key={tag.id}>
              <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-muted">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      ) : (
        // Empty state if no tags are found
        <div className="text-center py-16 px-6 border border-dashed border-border/50 rounded-lg bg-card/50 shadow-sm">
          <h3 className="text-xl font-medium mb-2 text-foreground">Belum Ada Tag</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sepertinya belum ada tag yang ditambahkan ke sistem.
          </p>
        </div>
      )}
    </div>
  )
}
