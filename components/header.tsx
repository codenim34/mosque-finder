'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'

export default function Header() {
  const pathname = usePathname()
  const { locale, setLocale, translate } = useLanguage()

  const navItems = [
    { href: '/map', label: translate('navMap'), icon: MapPin },
    { href: '/list', label: translate('navList'), icon: List },
    { href: '/add', label: translate('navAdd'), icon: Plus },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-linear-to-r from-primary to-emerald-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center ring-1 ring-primary-foreground/20 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Mosque Finder"
                width={32}
                height={32}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="font-semibold text-lg text-primary-foreground hidden sm:block">{translate('appName')}</span>
          </Link>

          <div className="flex items-center gap-1">
            <div className="flex md:hidden items-center rounded-md bg-primary-foreground/10 p-0.5 mr-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocale('bn')}
                className={cn(
                  'h-7 px-2 text-xs text-primary-foreground/90 hover:bg-primary-foreground/10',
                  locale === 'bn' && 'bg-primary-foreground/20 text-primary-foreground'
                )}
              >
                BN
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocale('en')}
                className={cn(
                  'h-7 px-2 text-xs text-primary-foreground/90 hover:bg-primary-foreground/10',
                  locale === 'en' && 'bg-primary-foreground/20 text-primary-foreground'
                )}
              >
                EN
              </Button>
            </div>

            <div className="hidden md:flex items-center rounded-md bg-primary-foreground/10 p-0.5 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocale('bn')}
                className={cn(
                  'h-8 px-2 text-primary-foreground/90 hover:bg-primary-foreground/10',
                  locale === 'bn' && 'bg-primary-foreground/20 text-primary-foreground'
                )}
              >
                {translate('langBn')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocale('en')}
                className={cn(
                  'h-8 px-2 text-primary-foreground/90 hover:bg-primary-foreground/10',
                  locale === 'en' && 'bg-primary-foreground/20 text-primary-foreground'
                )}
              >
                {translate('langEn')}
              </Button>
            </div>

            <nav className="flex items-center gap-0.5 sm:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-1 sm:gap-2 px-2 sm:px-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10',
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
      </div>
    </header>
  )
}
