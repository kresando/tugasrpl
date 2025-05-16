import type { CollectionConfig } from 'payload'
import { slugify } from '../utilities/slugify'

// Helper function untuk konversi HH:MM:SS atau MM:SS ke detik
const timeStringToSeconds = (timeStr: string): number | null => {
  if (!timeStr || typeof timeStr !== 'string') return null
  const parts = timeStr.split(':').map(Number)
  if (parts.some(isNaN)) return null
  let seconds = 0
  if (parts.length === 3) {
    // HH:MM:SS
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    seconds = parts[0] * 60 + parts[1]
  } else if (parts.length === 1 && parts[0] > 0) {
    // Hanya detik
    seconds = parts[0]
  } else {
    return null // Format tidak valid atau tidak ada bagian waktu yang valid
  }
  return seconds
}

export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'updatedAt'],
    preview: (doc) => {
      // Pastikan NEXT_PUBLIC_SERVER_URL diatur di environment variables Anda
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return doc.slug ? `${baseUrl}/video/${doc.slug}` : null
    },
    group: 'Konten',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Judul',
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      admin: {
        position: 'sidebar',
        description: 'URL-friendly identifier (dibuat otomatis)',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.title) {
              return slugify(data.title)
            }
            return ''
          },
        ],
      },
      unique: true,
      index: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Kategori',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Tags',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Thumbnail',
      admin: {
        description: 'Gambar thumbnail untuk video (rasio 16:9 direkomendasikan)',
      },
    },
    {
      name: 'linkEmbed',
      type: 'text',
      required: true,
      label: 'Link Embed',
      admin: {
        description: 'URL embed dari pihak ketiga (seperti poophd, streamtape, dll)',
      },
    },
    {
      name: 'duration',
      type: 'text',
      required: true,
      label: 'Durasi',
      admin: {
        description: 'Format: mm:ss atau hh:mm:ss. Contoh: 12:35 atau 01:12:35',
      },
    },
    {
      name: 'durationInSeconds',
      label: 'Durasi (Detik)',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description:
          'Durasi dalam detik, dihitung otomatis dari field Durasi. Akan terisi setelah disimpan.',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      label: 'Views',
      admin: {
        position: 'sidebar',
        description: 'Jumlah tayangan (dapat diedit manual & diperbarui otomatis)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Deskripsi',
      admin: {
        description: 'Deskripsi video (penting untuk SEO)',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Dipublikasikan',
          value: 'published',
        },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        // Hitung durationInSeconds jika duration berubah atau saat pembuatan
        if (data.duration && (operation === 'create' || data.duration !== originalDoc?.duration)) {
          const seconds = timeStringToSeconds(data.duration)
          if (seconds !== null) {
            data.durationInSeconds = seconds
          } else {
            // data.durationInSeconds = undefined; // Atau biarkan kosong jika format salah
            // Pertimbangkan untuk menambahkan validasi di sini jika format salah harus mencegah penyimpanan
            console.warn(
              `Format durasi tidak valid untuk video "${data.title || originalDoc?.title}": ${data.duration}. durationInSeconds tidak akan diupdate.`,
            )
          }
        }
        return data
      },
    ],
  },
}
