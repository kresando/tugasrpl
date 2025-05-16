'use client'

import { useEffect, useRef } from 'react'
import { incrementViewCountAndRevalidate } from '../actions' // Sesuaikan path jika perlu

interface VideoViewTrackerProps {
  videoId: string
}

export function VideoViewTracker({ videoId }: VideoViewTrackerProps) {
  const hasTrackedRef = useRef(false) // Ref untuk melacak pemanggilan

  useEffect(() => {
    // Hanya jalankan jika videoId ada dan belum pernah ditracking
    if (videoId && !hasTrackedRef.current) {
      console.log(`>>> CLIENT_EFFECT: Attempting to track view for video ID: ${videoId}`)

      incrementViewCountAndRevalidate(videoId)
        .then((result) => {
          if (result.success) {
            console.log(
              `>>> CLIENT_EFFECT: Server Action (call from effect) for increment views ID ${videoId} SUCCEEDED. New views: ${result.updatedViews}`,
            )
          } else {
            console.error(
              `>>> CLIENT_EFFECT: Server Action (call from effect) for increment views ID ${videoId} FAILED: ${result.error}`,
            )
          }
        })
        .catch((error) => {
          console.error(
            `>>> CLIENT_EFFECT: Error calling Server Action (from effect) for video ID ${videoId}:`,
            error,
          )
        })

      // Tandai bahwa tracking sudah dilakukan untuk instance ini
      hasTrackedRef.current = true
      console.log(
        `>>> CLIENT_EFFECT: Marked video ID ${videoId} as tracked for this component instance.`,
      )
    }
  }, [videoId]) // Tetap jalankan efek jika videoId berubah (untuk navigasi SPA antar video berbeda)

  return null // Komponen ini tidak me-render apa pun
}
