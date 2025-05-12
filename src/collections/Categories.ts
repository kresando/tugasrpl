import type { CollectionConfig } from 'payload'
import { slugify } from '../utilities/slugify'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    group: 'Konten',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nama Kategori',
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
            if (data?.name) {
              return slugify(data.name)
            }
            return ''
          },
        ],
      },
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Deskripsi',
      admin: {
        description: 'Jelaskan kategori video ini (opsional untuk SEO)',
      },
    },
  ],
}
