import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { VideoCard } from '../../components/VideoCard'
import { ArrowLeft, Calendar, Clock, Eye, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Definisikan URL server dengan nilai default jika tidak tersedia dari env
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

interface Video {
  id: string
  title: string | null
  description?: string | null
  views?: number | null
  duration?: string | null
  slug?: string | null
  linkEmbed?: string | null
  category?:
    | string
    | {
        id?: string
        name?: string
        slug?: string
      }
    | null
  url?: string | null
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

// Metadata dinamis berdasarkan data video
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  // Tunggu penyelesaian Promise untuk mendapatkan nilai slug
  const { slug } = await params

  const video = await getVideo(slug)

  if (!video) return { title: 'Video Tidak Ditemukan' }

  return {
    title: `${video.title} - Layar18`,
    description: video.description || `Tonton video dewasa ${video.title} di Layar18`,
  }
}

async function getVideo(slug: string): Promise<Video | null> {
  const payload = await getPayload({ config: await config })

  try {
    const { docs } = await payload.find({
      collection: 'videos',
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 1,
      limit: 1,
    })

    if (docs.length === 0) {
      return null
    }

    return docs[0] as unknown as Video
  } catch (error) {
    return null
  }
}

async function getRelatedVideos(video: Video): Promise<Video[]> {
  const payload = await getPayload({ config: await config })

  let categorySlug: string | undefined = undefined

  if (video.category) {
    if (typeof video.category === 'string') {
      // Jika category hanya string, kita perlu mencari data kategori terlebih dahulu
      const { docs } = await payload.find({
        collection: 'categories',
        where: {
          id: {
            equals: video.category,
          },
        },
        limit: 1,
      })

      if (docs.length > 0) {
        categorySlug = docs[0].slug as string
      }
    } else {
      categorySlug = video.category.slug
    }
  }

  // Jika kita memiliki categorySlug, cari video yang memiliki kategori sama
  if (categorySlug) {
    const { docs } = await payload.find({
      collection: 'videos',
      where: {
        and: [
          {
            'category.slug': {
              equals: categorySlug,
            },
          },
          {
            id: {
              not_equals: video.id,
            },
          },
        ],
      },
      limit: 4,
      sort: '-createdAt',
      depth: 1,
    })

    return docs as unknown as Video[]
  }

  // Jika tidak ada categorySlug, ambil video terbaru
  const { docs } = await payload.find({
    collection: 'videos',
    where: {
      id: {
        not_equals: video.id,
      },
    },
    limit: 4,
    sort: '-createdAt',
    depth: 1,
  })

  return docs as unknown as Video[]
}

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  // Tunggu penyelesaian Promise dari params untuk mendapatkan slug
  const { slug } = await params

  const video = await getVideo(slug)

  if (!video) {
    notFound()
  }

  const relatedVideos = await getRelatedVideos(video)

  // Format URL Thumbnail
  let thumbnailUrl = '/placeholder.jpg'

  if (video.thumbnail) {
    if (video.thumbnail.sizes?.card?.url) {
      thumbnailUrl = `${SERVER_URL}${video.thumbnail.sizes.card.url}`
    } else if (video.thumbnail.url) {
      thumbnailUrl = `${SERVER_URL}${video.thumbnail.url}`
    }
  }

  // Increment views pada video saat dibuka
  try {
    const payload = await getPayload({ config: await config })
    await payload.update({
      collection: 'videos',
      id: video.id,
      data: {
        views: (video.views || 0) + 1,
      },
    })
  } catch (error) {
    console.error('Error updating views:', error)
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Navigasi Kembali */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 text-foreground backdrop-blur-sm 
                    transition-all duration-200 hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Video Player */}
      <div className="mb-8">
        <div
          className="relative overflow-hidden rounded-2xl bg-card/30 backdrop-blur-[2px] border border-border/40
                     shadow-[4px_4px_20px_rgba(0,0,0,0.08),-4px_-4px_20px_rgba(255,255,255,0.08)]"
        >
          <div className="aspect-video w-full bg-black/30 overflow-hidden">
            {video.linkEmbed ? (
              <iframe
                src={video.linkEmbed}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title={video.title || 'Video'}
                loading="lazy"
                scrolling="no"
                sandbox="allow-same-origin allow-scripts allow-forms"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center text-muted-foreground">
                  <FileText className="h-12 w-12 mb-3 opacity-50" />
                  <span className="text-lg">Video tidak tersedia</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Judul & Meta Info */}
      <div className="mb-6 mt-8">
        {' '}
        {/* Added mt-8 for spacing */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{video.title}</h1>
        <div className="flex flex-wrap items-center gap-4 mb-2">
          {/* Kategori */}
          {typeof video.category !== 'string' && video.category?.slug && (
            <Link
              href={`/category/${video.category.slug}`}
              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium
                        bg-primary/10 text-primary backdrop-blur-sm border border-primary/20
                        shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]
                        transition-all duration-200 hover:bg-primary/20"
            >
              {video.category.name}
            </Link>
          )}

          {/* Statistik Video dalam satu baris */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {video.views !== undefined && video.views !== null && (
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{video.views} tayangan</span>
              </div>
            )}

            {video.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{video.duration}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Hari ini</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deskripsi Video */}
      {video.description && (
        <div className="mb-12">
          <div
            className="rounded-xl overflow-hidden bg-card/30 backdrop-blur-[2px] border border-border/40
                       shadow-[2px_2px_10px_rgba(0,0,0,0.04),-2px_-2px_10px_rgba(255,255,255,0.04)]"
          >
            <div className="border-b border-border/20 px-6 py-4">
              <h2 className="text-xl font-semibold">Deskripsi</h2>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground whitespace-pre-line">{video.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Terkait */}
      {relatedVideos.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold">Video Terkait</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-border/80 via-border/20 to-transparent ml-4"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedVideos.map((relatedVideo) => (
              <VideoCard key={relatedVideo.id} video={relatedVideo} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
