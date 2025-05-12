import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { ReadonlyURLSearchParams } from 'next/navigation'

interface Props {
  totalPages: number
  searchParams: ReadonlyURLSearchParams
  pathname: string
}

export default function PaginationControls({ totalPages, searchParams, pathname }: Props) {
  const currentPage = Number(searchParams.get('page')) || 1

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const renderPaginationItems = () => {
    const items = []
    const maxPagesToShow = 5 // Termasuk halaman saat ini, ellipsis, dan halaman awal/akhir

    if (totalPages <= maxPagesToShow) {
      // Tampilkan semua halaman jika total halaman sedikit
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={createPageURL(i)}
              isActive={currentPage === i}
              className={cn(currentPage !== i && 'text-muted-foreground hover:text-foreground')}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    } else {
      // Tampilkan halaman pertama
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href={createPageURL(1)}
            isActive={currentPage === 1}
            className={cn(currentPage !== 1 && 'text-muted-foreground hover:text-foreground')}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )

      // Ellipsis setelah halaman pertama jika perlu
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Halaman di sekitar halaman saat ini
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        // Jangan tampilkan halaman 1 atau halaman terakhir lagi jika sudah ada
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                href={createPageURL(i)}
                isActive={currentPage === i}
                className={cn(currentPage !== i && 'text-muted-foreground hover:text-foreground')}
              >
                {i}
              </PaginationLink>
            </PaginationItem>,
          )
        }
      }

      // Ellipsis sebelum halaman terakhir jika perlu
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Tampilkan halaman terakhir
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href={createPageURL(totalPages)}
            isActive={currentPage === totalPages}
            className={cn(
              currentPage !== totalPages && 'text-muted-foreground hover:text-foreground',
            )}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(currentPage - 1)}
            className={cn(
              currentPage === 1 && 'pointer-events-none text-muted',
              'text-muted-foreground hover:text-foreground',
            )}
            aria-disabled={currentPage === 1}
            tabIndex={currentPage === 1 ? -1 : undefined}
          />
        </PaginationItem>
        {renderPaginationItems()}
        <PaginationItem>
          <PaginationNext
            href={createPageURL(currentPage + 1)}
            className={cn(
              currentPage === totalPages && 'pointer-events-none text-muted',
              'text-muted-foreground hover:text-foreground',
            )}
            aria-disabled={currentPage === totalPages}
            tabIndex={currentPage === totalPages ? -1 : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
