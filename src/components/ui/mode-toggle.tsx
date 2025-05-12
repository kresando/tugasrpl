'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useEffect } from 'react'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [hovering, setHovering] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" disabled></Button>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`
            relative h-10 w-10 rounded-full overflow-hidden 
            transition-all duration-300 ease-in-out
            ${
              theme === 'dark'
                ? 'bg-background/80 shadow-[2px_2px_8px_rgba(0,0,0,0.2),-2px_-2px_8px_rgba(255,255,255,0.05)]'
                : 'bg-background/80 shadow-[2px_2px_8px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.2)]'
            }
            ${hovering ? 'scale-105' : ''}
            backdrop-blur-sm
          `}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {theme === 'light' ? (
            <Sun className="h-5 w-5 text-amber-500 transition-all duration-300" />
          ) : (
            <Moon className="h-5 w-5 text-sky-400 transition-all duration-300" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-xl backdrop-blur-md bg-card/90 border border-border/30 shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.05)]"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="rounded-lg transition-all duration-200 hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="rounded-lg transition-all duration-200 hover:bg-accent/30 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.03),-2px_-2px_5px_rgba(255,255,255,0.03)]"
        >
          <Moon className="mr-2 h-4 w-4 text-sky-400" />
          <span>Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
