'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, List, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Map', icon: MapPin },
    { href: '/list', label: 'List', icon: List },
    { href: '/add', label: 'Add Mosque', icon: Plus },
  ]

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-primary-foreground hidden sm:block">Mosque Finder</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10',
                      isActive && 'bg-primary-foreground/20 text-primary-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
