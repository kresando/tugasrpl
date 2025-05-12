// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Videos } from './collections/Videos'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- Layar18 Admin',
    },
  },
  collections: [Users, Media, Categories, Tags, Videos],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    seoPlugin({
      collections: ['videos', 'categories', 'tags'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }: { doc: any }) => `Layar18 — ${doc.title || doc.name}`,
      generateDescription: ({ doc }: { doc: any }) =>
        doc.description || `Streaming video dewasa ${doc.title || doc.name} di Layar18`,
    }),
    // storage-adapter-placeholder
  ],
})
