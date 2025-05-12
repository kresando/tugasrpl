'use client'

import { useRouter, useSearchParams, ReadonlyURLSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpDown, Filter } from 'lucide-react'

interface ControlsProps {
  pathname: string
  defaultSort?: string
  defaultFilter?: string
}

export function Controls({
  pathname,
  defaultSort = 'latest',
  defaultFilter = 'all-time',
}: ControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleValueChange = (type: 'sort' | 'filter', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (
      (type === 'sort' && value !== defaultSort) ||
      (type === 'filter' && value !== defaultFilter)
    ) {
      current.set(type, value)
    } else {
      current.delete(type)
    }

    current.set('page', '1')

    const search = current.toString()
    const query = search ? `?${search}` : ''

    router.replace(`${pathname}${query}`)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4 mb-6 sm:mb-8">
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
            <SelectItem value="latest">Terbaru</SelectItem>
            <SelectItem value="most-viewed">Paling Banyak Dilihat</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
            <SelectItem value="all-time">Sepanjang Masa</SelectItem>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="this-week">Minggu Ini</SelectItem>
            <SelectItem value="this-month">Bulan Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
