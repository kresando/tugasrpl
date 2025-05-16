import type { Metadata } from 'next'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const pageUrl = `${SERVER_URL}/tentang`
const pageTitle = 'Tentang Kami - Layar18 | Platform Streaming Video Dewasa Terpercaya'
const pageDescription =
  'Pelajari lebih lanjut tentang Layar18: visi, misi, dan komitmen kami sebagai platform streaming video dewasa pilihan Anda dengan koleksi konten berkualitas dan pengalaman pengguna terbaik.'
const ogImageUrl = `${SERVER_URL}/assets/seo/logo-og.webp` // Asumsi logo ini ada

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'tentang layar18',
    'profil layar18',
    'layar18 company',
    'platform video dewasa',
    'streaming dewasa terpercaya',
    'visi misi layar18',
  ],
  alternates: {
    canonical: pageUrl,
  },
  robots: 'index, follow',
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pageUrl,
    siteName: 'Layar18',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Tentang Layar18',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [ogImageUrl],
    site: '@YouKnowIt38',
    creator: '@YouKnowIt38',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Layar18',
  url: SERVER_URL,
  logo: `${SERVER_URL}/assets/seo/logo-og.webp`, // Pastikan path logo ini benar
  description: 'Layar18 adalah platform streaming video dewasa online.',
  sameAs: ['https://twitter.com/YouKnowIt38'],
}

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: pageTitle,
  url: pageUrl,
  description: pageDescription,
  mainEntity: {
    '@type': 'Organization',
    name: 'Layar18',
    url: SERVER_URL,
  },
  publisher: organizationJsonLd, // Merujuk ke schema Organization
}

export default function TentangPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <div className="container mx-auto max-w-3xl py-10 px-4 sm:px-6 lg:px-8">
        <article className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-foreground border-b pb-4">
            Tentang Layar18
          </h1>

          <p>
            Selamat datang di Layar18! Kami berdedikasi untuk menjadi destinasi utama Anda dalam
            menemukan dan menikmati beragam konten video dewasa berkualitas tinggi dari seluruh
            dunia. Misi kami adalah menyediakan platform yang aman, mudah digunakan, dan selalu
            terdepan dalam menyajikan hiburan untuk orang dewasa.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Visi Kami</h2>
          <p>
            Menjadi platform streaming video dewasa yang paling terpercaya dan inovatif, dengan
            koleksi konten yang luas dan pengalaman pengguna yang tak tertandingi.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Apa yang Kami Tawarkan</h2>
          <ul>
            <li>
              <strong>Koleksi Luas:</strong> Jelajahi ribuan judul dari berbagai genre dan kategori.
            </li>
            <li>
              <strong>Kualitas Terbaik:</strong> Nikmati streaming video dengan kualitas gambar
              terbaik.
            </li>
            <li>
              <strong>Pembaruan Rutin:</strong> Konten baru ditambahkan secara berkala untuk
              memastikan Anda tidak pernah kehabisan pilihan.
            </li>
            <li>
              <strong>Akses Mudah:</strong> Antarmuka yang intuitif dan ramah pengguna, dapat
              diakses dari berbagai perangkat.
            </li>
            <li>
              <strong>Privasi & Keamanan:</strong> Kami berkomitmen untuk menjaga privasi dan
              keamanan data Anda.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Komitmen Kami</h2>
          <p>
            Layar18 berkomitmen untuk menyediakan lingkungan yang bertanggung jawab. Konten di
            platform kami ditujukan secara eksklusif untuk pengguna dewasa berusia 18 tahun ke atas.
            Kami bekerja keras untuk memastikan pengalaman yang positif bagi semua pengguna kami.
          </p>
          <p>
            Perlu diketahui bahwa Layar18 berfungsi sebagai platform yang menyediakan akses ke
            konten video. Meskipun kami berusaha untuk menyajikan konten berkualitas, Layar18 tidak
            memproduksi semua video yang tersedia di situs ini. Kami bekerja sama dengan berbagai
            penyedia konten untuk menghadirkan variasi yang beragam untuk Anda.
          </p>
          <p>
            Terima kasih telah memilih Layar18. Kami harap Anda menikmati waktu Anda di platform
            kami!
          </p>
        </article>
      </div>
    </>
  )
}
