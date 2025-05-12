import type { CollectionConfig } from 'payload'
import { slugify } from '../utilities/slugify'

export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'createdAt'],
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
        description: 'Format: mm:ss atau hh:mm:ss',
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
    afterRead: [
      // Hook untuk menambah view count ketika video diakses
      async ({ req, doc }) => {
        // Hanya menambah view jika:
        // 1. Bukan dari admin panel
        // 2. Merupakan operasi findByID (bukan list)
        // 3. Metodenya GET
        if (
          req.url &&
          !req.url.includes('/api/admin') &&
          req.method === 'GET' &&
          !req.query.depth // Pastikan bukan API call untuk relasi
        ) {
          try {
            await req.payload.update({
              collection: 'videos',
              id: doc.id,
              data: {
                views: (doc.views || 0) + 1,
              },
            })

            // Return original doc, karena UI tidak perlu melihat views diperbarui
            return doc
          } catch (error) {
            console.error('Error updating view count:', error)
            return doc
          }
        }

        return doc
      },
    ],
  },
}
