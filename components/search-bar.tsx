'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Crosshair, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

interface SearchBarProps {
  onLocationFound?: (lat: number, lng: number) => void
  className?: string
}

export default function SearchBar({ onLocationFound, className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const { translate } = useLanguage()

  const handleSearch = async () => {
    if (!query.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.length > 0 && onLocationFound) {
        onLocationFound(data[0].lat, data[0].lng)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(translate('geolocationUnsupported'))
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (onLocationFound) {
          onLocationFound(position.coords.latitude, position.coords.longitude)
        }
        setLocating(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert(translate('geolocationFailed'))
        setLocating(false)
      }
    )
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={translate('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10"
        />
      </div>
      <Button
        onClick={handleSearch}
        disabled={searching || !query.trim()}
        className="shrink-0"
      >
        {searching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          translate('search')
        )}
      </Button>
      <Button
        variant="outline"
        onClick={handleLocateMe}
        disabled={locating}
        className="shrink-0"
        title={translate('useMyLocation')}
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Crosshair className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
