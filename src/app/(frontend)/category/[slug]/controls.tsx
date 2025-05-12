'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpDown, Filter } from 'lucide-react'

interface ControlsProps {
  defaultSort?: string
  defaultFilter?: string
}

export function Controls({ defaultSort = '-createdAt', defaultFilter = 'all' }: ControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleValueChange = (type: 'sort' | 'filter', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (value && value !== 'all') {
      // Set the new value
      current.set(type, value)
    } else {
      // Remove the parameter if value is 'all' or empty
      current.delete(type)
    }

    // Reset page to 1 when sort or filter changes
    current.set('page', '1')

    const search = current.toString()
    const query = search ? `?${search}` : ''

    // Use replace instead of push to avoid filling up browser history unnecessarily
    router.replace(`${pathname}${query}`)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4 mb-6 sm:mb-8">
      {/* Sorting Select */}
      <div className="w-full sm:w-auto">
        <label
          htmlFor="sort-select"
          className="block text-xs font-medium text-muted-foreground mb-1.5"
        >
          Urutkan
        </label>
        <Select
          defaultValue={searchParams.get('sort') ?? defaultSort}
          onValueChange={(value) => handleValueChange('sort', value)}
        >
          <SelectTrigger
            id="sort-select"
            className="w-full sm:w-[180px] bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg flex items-center gap-2 text-sm h-9"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Urutkan berdasarkan..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Terbaru</SelectItem>
            <SelectItem value="-views">Paling Banyak Dilihat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtering Select */}
      <div className="w-full sm:w-auto">
        <label
          htmlFor="filter-select"
          className="block text-xs font-medium text-muted-foreground mb-1.5"
        >
          Filter Waktu
        </label>
        <Select
          defaultValue={searchParams.get('filter') ?? defaultFilter}
          onValueChange={(value) => handleValueChange('filter', value)}
        >
          <SelectTrigger
            id="filter-select"
            className="w-full sm:w-[180px] bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg flex items-center gap-2 text-sm h-9"
          >
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Filter waktu..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sepanjang Masa</SelectItem>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="week">Minggu Ini</SelectItem>
            <SelectItem value="month">Bulan Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
