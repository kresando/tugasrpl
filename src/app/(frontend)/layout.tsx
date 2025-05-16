import React from 'react'
import './styles.css'
import { getPayload } from 'payload'
import { Providers } from './providers'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import config from '@/payload.config'

export const metadata = {
  title: 'Layar18 - Streaming Video Dewasa',
  description: 'Platform streaming video dewasa terbaik dan terlengkap di Indonesia',
  keywords: ['video dewasa', 'streaming', 'layar18', 'konten dewasa'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://layar18.com',
    siteName: 'Layar18',
    title: 'Layar18 - Streaming Video Dewasa',
    description: 'Platform streaming video dewasa terbaik dan terlengkap di Indonesia',
    images: [
      {
        url: 'https://layar18.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Layar18',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Layar18 - Streaming Video Dewasa',
    description: 'Platform streaming video dewasa terbaik dan terlengkap di Indonesia',
    images: ['https://layar18.com/og-image.jpg'],
    site: '@YouKnowIt38',
    creator: '@YouKnowIt38',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

async function getCategories() {
  const payload = await getPayload({ config: await config })

  const { docs } = await payload.find({
    collection: 'categories',
    limit: 10,
    depth: 0,
  })

  return docs.map((category) => ({
    id: category.id,
    name: category.name as string,
    slug: category.slug as string,
  }))
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Providers>
          <Header categories={categories} />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
