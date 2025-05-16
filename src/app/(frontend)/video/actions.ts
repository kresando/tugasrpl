'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidateTag } from 'next/cache'

export async function incrementViewCountAndRevalidate(videoId: string): Promise<{
  success: boolean
  updatedViews?: number
  error?: string
}> {
  if (!videoId) {
    console.error('>>> SERVER_ACTION_ERROR: Video ID is required for incrementing views.')
    return { success: false, error: 'Video ID tidak ditemukan' }
  }

  console.log(`>>> SERVER_ACTION: Memulai increment views untuk video ID: ${videoId}`)
  const payload = await getPayload({ config: await configPromise })

  try {
    // Ambil nilai views saat ini terlebih dahulu untuk menghindari race condition jika diperlukan
    // Namun, untuk increment sederhana, operasi $inc di MongoDB biasanya aman.
    // Untuk kesederhanaan, kita langsung increment.

    // Ambil video untuk mendapatkan views saat ini sebelum increment
    const videoBeforeUpdate = await payload.findByID({
      collection: 'videos',
      id: videoId,
      depth: 0, // Tidak perlu relasi
    })

    if (!videoBeforeUpdate) {
      console.error(
        `>>> SERVER_ACTION_ERROR: Video dengan ID ${videoId} tidak ditemukan untuk update views.`,
      )
      return { success: false, error: 'Video tidak ditemukan untuk update' }
    }

    const currentViews = videoBeforeUpdate.views || 0
    const newViews = currentViews + 1

    await payload.update({
      collection: 'videos',
      id: videoId,
      data: {
        views: newViews,
      },
    })
    console.log(
      `>>> SERVER_ACTION: Views berhasil diincrement di DB untuk ID ${videoId}. Views baru: ${newViews}`,
    )

    revalidateTag('videos_collection')
    console.log(
      `>>> SERVER_ACTION: revalidateTag('videos_collection') dipanggil untuk ID ${videoId}.`,
    )

    return { success: true, updatedViews: newViews }
  } catch (error: any) {
    console.error(
      `>>> SERVER_ACTION_ERROR: Error saat increment views untuk video ${videoId}:`,
      error,
    )
    return { success: false, error: error.message || 'Gagal mengupdate views' }
  }
}
