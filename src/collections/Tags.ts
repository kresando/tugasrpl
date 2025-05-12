import type { CollectionConfig } from 'payload'
import { slugify } from '../utilities/slugify'

export const Tags: CollectionConfig = {
  slug: 'tags',
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
      label: 'Nama Tag',
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
        description: 'Jelaskan tag ini (opsional untuk SEO)',
      },
    },
  ],
}
