import { getPayload } from 'payload'
import Link from 'next/link'
import config from '@/payload.config'
import { ArrowRight, Film, FlameIcon } from 'lucide-react'
import { VideoCard } from './components/VideoCard'

// Definisikan URL server dengan nilai default jika tidak tersedia dari env
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

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

async function getVideos(categorySlug: string, limit: number = 8) {
  const payload = await getPayload({ config: await config })

  const { docs } = await payload.find({
    collection: 'videos',
    limit,
    sort: '-createdAt',
    depth: 1,
    where: {
      'category.slug': {
        equals: categorySlug,
      },
    },
  })

  return docs as unknown as Video[]
}

export default async function Home() {
  // Ambil video untuk masing-masing kategori
  const bokepIndoVideos = await getVideos('bokep-indo', 8)
  const javVideos = await getVideos('jav-sub-indo', 8)

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl space-y-16">
      {/* Bokep Indo Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-red-500/10 backdrop-blur-sm shadow-[2px_2px_8px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.05)]">
              <FlameIcon className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Bokep Indo</h2>
          </div>
          <Link
            href="/category/bokep-indo"
            className="group flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium 
            bg-background/80 text-foreground backdrop-blur-sm transition-all duration-200
            hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bokepIndoVideos.length > 0 ? (
            bokepIndoVideos.map((video) => <VideoCard key={video.id} video={video} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Tidak ada video tersedia saat ini</p>
            </div>
          )}
        </div>
      </section>

      {/* JAV Sub Indo Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-500/10 backdrop-blur-sm shadow-[2px_2px_8px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.05)]">
              <Film className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold">JAV Sub Indo</h2>
          </div>
          <Link
            href="/category/jav-sub-indo"
            className="group flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium 
            bg-background/80 text-foreground backdrop-blur-sm transition-all duration-200
            hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {javVideos.length > 0 ? (
            javVideos.map((video) => <VideoCard key={video.id} video={video} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Tidak ada video tersedia saat ini</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
