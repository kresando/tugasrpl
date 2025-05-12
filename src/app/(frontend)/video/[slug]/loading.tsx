import React from 'react'

import { Skeleton } from '@/components/ui/skeleton'

export default function VideoLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Skeleton className="h-9 w-3/4 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Video embed skeleton */}
      <div className="aspect-video mb-6">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>

      {/* Informasi video skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          <div className="mb-6">
            <Skeleton className="h-7 w-40 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="mb-4">
            <Skeleton className="h-6 w-28 mb-1" />
            <Skeleton className="h-5 w-40" />
          </div>

          <div>
            <Skeleton className="h-6 w-20 mb-1" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-14 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
