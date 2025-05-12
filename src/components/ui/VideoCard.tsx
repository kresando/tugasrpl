import Image from 'next/image'
import Link from 'next/link'
import { Card } from './card'
import { cn } from '@/lib/utils'
import { Clock, Eye, Play } from 'lucide-react'

// Definisikan URL server dengan nilai default jika tidak tersedia dari env
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Definisikan type Category yang lebih fleksibel
type Category = {
  name?: string
  slug?: string
}

// Definisikan tipe yang lebih fleksibel untuk mendukung Payload Video
export interface VideoCardProps {
  video: {
    id: string
    title: string | null | undefined
    slug?: string | null | undefined
    views?: number | null | undefined
    duration?: string | null | undefined
    category?: string | Category | null | undefined
    thumbnail?:
      | {
          url?: string
          alt?: string
          sizes?: {
            card?: {
              url?: string
            }
          }
        }
      | null
      | undefined
  }
  className?: string
  variant?: 'default' | 'featured'
}

export function VideoCard({ video, className, variant = 'default' }: VideoCardProps) {
  // Tentukan URL thumbnail
  let thumbnailUrl = '/placeholder.jpg'
  let thumbnailAlt = (video.title || 'Video thumbnail') as string

  if (video.thumbnail) {
    // Gunakan URL yang optimal sesuai urutan prioritas
    if (video.thumbnail.sizes?.card?.url) {
      thumbnailUrl = `${SERVER_URL}${video.thumbnail.sizes.card.url}`
    } else if (video.thumbnail.url) {
      thumbnailUrl = `${SERVER_URL}${video.thumbnail.url}`
    }

    // Gunakan alt text dari thumbnail jika tersedia
    if (video.thumbnail.alt) {
      thumbnailAlt = video.thumbnail.alt
    }
  }

  // Jika tidak ada slug, jangan render card
  if (!video.slug) return null

  return (
    <Link href={`/video/${video.slug}`} className={cn('block group cursor-pointer', className)}>
      <div
        className={cn(
          'relative h-full overflow-hidden rounded-xl transition-all duration-300',
          'bg-card/30 backdrop-blur-[2px]',
          'border border-border/40',
          'shadow-[2px_2px_10px_rgba(0,0,0,0.04),-2px_-2px_10px_rgba(255,255,255,0.04)]',
          'hover:shadow-[4px_4px_16px_rgba(0,0,0,0.06),-4px_-4px_16px_rgba(255,255,255,0.06)]',
          'hover:scale-[1.02] hover:border-primary/20',
          variant === 'featured' ? 'aspect-video md:aspect-[16/9]' : '',
        )}
      >
        {/* Thumbnail Container */}
        <div className="relative overflow-hidden rounded-t-xl aspect-video">
          {/* Thumbnail */}
          <Image
            src={thumbnailUrl}
            alt={thumbnailAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized={true}
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/80 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.2)]">
              <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground fill-current" />
            </div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80"></div>

          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs px-1.5 py-1 sm:px-2 sm:py-1 rounded-full font-medium shadow-md">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span>{video.duration}</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3 sm:p-4">
          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {video.title || 'Tanpa Judul'}
          </h3>

          {/* Views */}
          {video.views !== undefined && video.views !== null && (
            <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
              <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              <span>{video.views} tayangan</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
