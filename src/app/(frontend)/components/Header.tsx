'use client'

import Link from 'next/link'
import React from 'react'
import { Search } from 'lucide-react'

import { ModeToggle } from '../../../components/ui/mode-toggle'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { MobileMenu } from './MobileMenu'
import { Navigation } from './Navigation'
import { SearchBar } from './SearchBar'

interface HeaderProps {
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function Header({ categories }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/60 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <div
        className="
          container mx-auto max-w-7xl px-4 py-3
          relative
          after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r 
          after:from-transparent after:via-border/50 after:to-transparent
        "
      >
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <MobileMenu categories={categories} />
            <Link href="/" className="group flex items-center transition-all duration-300">
              <div
                className="
                  relative overflow-hidden rounded-lg p-1
                  bg-gradient-to-br from-primary/10 to-primary/5
                  shadow-[2px_2px_8px_rgba(0,0,0,0.08),-2px_-2px_8px_rgba(255,255,255,0.08)]
                  transition-all duration-300 group-hover:shadow-[3px_3px_10px_rgba(0,0,0,0.12),-3px_-3px_10px_rgba(255,255,255,0.12)]
                  group-hover:scale-105
                "
              >
                <span
                  className="
                    text-3xl font-bold text-transparent bg-clip-text 
                    bg-gradient-to-r from-primary to-primary/70
                  "
                >
                  L18
                </span>
              </div>
              <span className="ml-2 text-xl font-bold tracking-tight text-foreground hidden sm:inline">
                Layar<span className="text-primary">18</span>
              </span>
            </Link>
            <div className="hidden md:block">
              <Navigation categories={categories} />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <SearchBar />
            </div>
            <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Buka Pencarian</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-6 bg-background">
                <DialogHeader className="mb-4">
                  <DialogTitle>Cari Video</DialogTitle>
                </DialogHeader>
                <SearchBar autoFocus={true} onSearchSubmit={() => setMobileSearchOpen(false)} />
              </DialogContent>
            </Dialog>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
