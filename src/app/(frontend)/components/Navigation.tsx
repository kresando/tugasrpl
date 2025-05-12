'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Hash, Home, Layers } from 'lucide-react'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

interface NavigationProps {
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function Navigation({ categories }: NavigationProps) {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-2">
        <NavigationMenuItem>
          <Link
            href="/"
            className={cn(
              'flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-all duration-200',
              pathname === '/'
                ? 'bg-primary/10 text-primary shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]'
                : 'bg-background/80 text-foreground backdrop-blur-sm hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]',
            )}
          >
            <Home className="h-4 w-4" />
            <span>Beranda</span>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link
            href="/categories"
            className={cn(
              'flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-all duration-200',
              pathname === '/categories' || pathname.startsWith('/category/')
                ? 'bg-primary/10 text-primary shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]'
                : 'bg-background/80 text-foreground backdrop-blur-sm hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]',
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Kategori</span>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link
            href="/tags"
            className={cn(
              'flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-all duration-200',
              pathname === '/tags' || pathname.startsWith('/tag/')
                ? 'bg-primary/10 text-primary shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]'
                : 'bg-background/80 text-foreground backdrop-blur-sm hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]',
            )}
          >
            <Hash className="h-4 w-4" />
            <span>Tag</span>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface ListItemProps extends React.ComponentPropsWithoutRef<'a'> {
  title: string
  href: string
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, ListItemProps>(
  ({ className, title, href, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            href={href}
            className={cn(
              'block select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors',
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = 'ListItem'
