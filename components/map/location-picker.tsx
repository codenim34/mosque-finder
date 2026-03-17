'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Crosshair, Search } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

const MosqueMap = dynamic(() => import('./mosque-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-75 bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <MapPin className="h-8 w-8 text-muted-foreground" />
    </div>
  ),
})

interface LocationPickerProps {
  value: { lat: number; lng: number } | null
  onChange: (location: { lat: number; lng: number }) => void
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const { translate } = useLanguage()
  
  // Create a stable key that only changes on initial mount
  const mapKey = useMemo(() => `picker-${Date.now()}`, [])

  const handleMapClick = (lat: number, lng: number) => {
    onChange({ lat, lng })
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(
        `/api/geocode?query=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()

      if (data.length > 0) {
        onChange({ lat: data[0].lat, lng: data[0].lng })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
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
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder={translate('searchAddressPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleSearch}
          disabled={searching}
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleLocateMe}
          disabled={locating}
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-75 rounded-lg overflow-hidden border">
        <MosqueMap
          key={mapKey}
          mosques={[]}
          center={value ? [value.lat, value.lng] : [21.4225, 39.8262]}
          zoom={value ? 15 : 3}
          selectedLocation={value ? [value.lat, value.lng] : null}
          onMapClick={handleMapClick}
        />
      </div>

      {value && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Lat: {value.lat.toFixed(6)}</span>
          <span>Lng: {value.lng.toFixed(6)}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {translate('mapPickerHint')}
      </p>
    </div>
  )
}
