'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  className?: string // Tambahkan prop className opsional
}

// Ganti nama komponen menjadi PaginationControls
export function PaginationControls({ currentPage, totalPages, className }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) {
    return null // Don't render pagination if there's only one page or less
  }

  // Define the range of page numbers to display
  const pagesToShow = []
  const delta = 1 // Number of pages to show around the current page (sesuaikan jika perlu, 1 akan memberi [prev, 1, ..., curr-1, curr, curr+1, ..., total, next])

  // Always show first page
  pagesToShow.push(1)

  // Ellipsis before current page group?
  if (currentPage > delta + 2) {
    pagesToShow.push('...')
  }

  // Pages around current page
  const startPage = Math.max(2, currentPage - delta)
  const endPage = Math.min(totalPages - 1, currentPage + delta)
  for (let i = startPage; i <= endPage; i++) {
    pagesToShow.push(i)
  }

  // Ellipsis after current page group?
  if (currentPage < totalPages - delta - 1) {
    pagesToShow.push('...')
  }

  // Always show last page
  if (totalPages > 1) {
    pagesToShow.push(totalPages)
  }

  // Remove duplicates that might arise from small totalPages values
  const uniquePages = [...new Set(pagesToShow)]

  return (
    <nav
      aria-label="Pagination"
      // Gabungkan className default dengan prop className
      className={cn(
        'flex items-center justify-center space-x-1 sm:space-x-2 mt-8 sm:mt-12',
        className,
      )}
    >
      {/* Previous Button */}
      <Button
        asChild
        variant="outline"
        size="icon"
        className={cn('h-9 w-9', currentPage <= 1 && 'pointer-events-none opacity-50')}
        disabled={currentPage <= 1}
      >
        <Link href={createPageURL(currentPage - 1)} aria-label="Go to previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {/* Page Number Buttons */}
      {uniquePages.map((page, index) =>
        typeof page === 'number' ? (
          <Button
            key={page}
            asChild
            variant={currentPage === page ? 'destructive' : 'outline'} // Gunakan 'destructive' untuk halaman aktif
            size="icon"
            className="h-9 w-9"
          >
            <Link
              href={createPageURL(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Link>
          </Button>
        ) : (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground"
          >
            ...
          </span>
        ),
      )}

      {/* Next Button */}
      <Button
        asChild
        variant="outline"
        size="icon"
        className={cn('h-9 w-9', currentPage >= totalPages && 'pointer-events-none opacity-50')}
        disabled={currentPage >= totalPages}
      >
        <Link href={createPageURL(currentPage + 1)} aria-label="Go to next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  )
}
