import { Skeleton } from './skeleton'

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 p-3 border border-border/40 rounded-xl bg-card/30 shadow-[2px_2px_10px_rgba(0,0,0,0.04),-2px_-2px_10px_rgba(255,255,255,0.04)]">
      {/* Aspect Ratio Skeleton */}
      <Skeleton className="aspect-video rounded-md" />
      <div className="space-y-2 p-2">
        {/* Title Skeleton */}
        <Skeleton className="h-4 w-[80%]" />
        {/* Views Skeleton */}
        <Skeleton className="h-3 w-[40%]" />
      </div>
    </div>
  )
}
