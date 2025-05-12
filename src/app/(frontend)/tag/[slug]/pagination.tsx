'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
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

  const pagesToShow = []
  const delta = 2 // Number of pages to show around the current page

  pagesToShow.push(1)

  if (currentPage > delta + 2) {
    pagesToShow.push('...')
  }

  const startPage = Math.max(2, currentPage - delta)
  const endPage = Math.min(totalPages - 1, currentPage + delta)
  for (let i = startPage; i <= endPage; i++) {
    pagesToShow.push(i)
  }

  if (currentPage < totalPages - delta - 1) {
    pagesToShow.push('...')
  }

  if (totalPages > 1) {
    pagesToShow.push(totalPages)
  }

  const uniquePages = [...new Set(pagesToShow)]

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center space-x-2 mt-8 sm:mt-12"
    >
      <Button
        asChild
        variant="outline"
        size="icon"
        className={cn('h-9 w-9 p-0', currentPage <= 1 && 'pointer-events-none opacity-50')}
        disabled={currentPage <= 1}
      >
        <Link href={createPageURL(currentPage - 1)} aria-label="Go to previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {uniquePages.map((page, index) =>
        typeof page === 'number' ? (
          <Button
            key={page}
            asChild
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            className="h-9 w-9 p-0"
          >
            <Link href={createPageURL(page)} aria-label={`Go to page ${page}`}>
              {page}
            </Link>
          </Button>
        ) : (
          <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center">
            ...
          </span>
        ),
      )}

      <Button
        asChild
        variant="outline"
        size="icon"
        className={cn('h-9 w-9 p-0', currentPage >= totalPages && 'pointer-events-none opacity-50')}
        disabled={currentPage >= totalPages}
      >
        <Link href={createPageURL(currentPage + 1)} aria-label="Go to next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  )
}
