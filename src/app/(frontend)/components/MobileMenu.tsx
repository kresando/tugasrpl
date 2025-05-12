'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Home, Layers, Menu, Tag, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface MobileMenuProps {
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function MobileMenu({ categories }: MobileMenuProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Buka Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-6 bg-background">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left text-lg font-semibold">Menu Navigasi</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col space-y-1 flex-grow">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
            )}
            onClick={() => setOpen(false)}
          >
            <Home className="h-4 w-4" />
            <span>Beranda</span>
          </Link>

          <Link
            href="/categories"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === '/categories' || pathname.startsWith('/category/')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground',
            )}
            onClick={() => setOpen(false)}
          >
            <Layers className="h-4 w-4" />
            <span>Kategori</span>
          </Link>

          <Link
            href="/tags"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === '/tags' || pathname.startsWith('/tag/')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground',
            )}
            onClick={() => setOpen(false)}
          >
            <Tag className="h-4 w-4" />
            <span>Tag</span>
          </Link>

          {categories.length > 0 && <Separator className="my-3 bg-border/50" />}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
