'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  autoFocus?: boolean
  onSearchSubmit?: () => void
}

export function SearchBar({ autoFocus = false, onSearchSubmit }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
      onSearchSubmit?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <div
        className={`
          relative flex items-center rounded-full 
          backdrop-blur-md transition-all duration-300
          ${
            isFocused
              ? 'bg-background/90 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] border border-primary/20'
              : 'bg-background/70 shadow-[2px_2px_6px_rgba(0,0,0,0.05),-2px_-2px_6px_rgba(255,255,255,0.05)]'
          }
        `}
      >
        <Search
          className={`absolute left-4 h-4 w-4 transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`}
        />
        <Input
          type="text"
          placeholder="Cari video..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="h-12 flex-grow border-none bg-transparent pl-12 pr-20 focus-visible:ring-0 placeholder:text-muted-foreground/70"
          autoFocus={autoFocus}
        />
        <Button
          type="submit"
          className={`
            absolute right-2 my-1 h-8 rounded-full px-4 
            transition-all duration-300 ease-in-out
            ${
              query.trim()
                ? 'bg-primary text-primary-foreground shadow-[2px_2px_8px_rgba(0,0,0,0.1),-1px_-1px_8px_rgba(255,255,255,0.05)]'
                : 'bg-accent text-accent-foreground shadow-none opacity-80'
            }
            hover:shadow-[3px_3px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.07)]
          `}
        >
          Cari
        </Button>
      </div>
    </form>
  )
}
