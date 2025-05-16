import { MetadataRoute } from 'next'

// Pastikan NEXT_PUBLIC_SITE_URL di .env sudah benar https://layar18.top
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://layar18.top'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/video/',
          '/category/',
          '/categories/',
          '/tag/',
          '/tags/',
          '/search/',
          '/tentang/',
          '/syarat-ketentuan/',
          '/media/', // Izinkan crawling media
          '/assets/', // Izinkan crawling aset
          // Tambahkan path halaman statis lainnya jika ada
        ],
        disallow: [
          '/ueskonz050206/', // Panel admin PayloadCMS yang baru
          '/api/', // Blok semua endpoint API secara umum
          '/_next/', // Aset internal Next.js
          // '/payload-api/', // Kemungkinan tidak perlu jika /api/ sudah diblok
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/media/'], // Izinkan Google Image Bot untuk crawl media
      },
      // Anda bisa menambahkan aturan spesifik untuk bot lain di sini
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
