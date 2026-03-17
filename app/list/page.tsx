'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { MosqueData } from '@/lib/types'
import MosqueCard from '@/components/mosque-card'
import SearchBar from '@/components/search-bar'
import PrayerFilter, { PrayerFilters } from '@/components/prayer-filter'
import { filterMosques } from '@/lib/filter-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, List, SortAsc, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type SortOption = 'nearest' | 'verified' | 'newest'

export default function ListPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('nearest')
  const [locating, setLocating] = useState(false)
  const [filters, setFilters] = useState<PrayerFilters>({})
  const { translate } = useLanguage()

  // Build API URL
  const apiUrl = userLocation
    ? `/api/mosques?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=100000`
    : '/api/mosques'

  const { data: mosques, error, isLoading } = useSWR<MosqueData[]>(apiUrl, fetcher)

  // Try to get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocating(false)
        },
        () => {
          setLocating(false)
        },
        { timeout: 10000 }
      )
    }
  }, [])

  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation({ lat, lng })
  }

  // Filter and sort mosques
  const mosquesArray = Array.isArray(mosques) ? mosques : []
  const filteredMosques = filterMosques(mosquesArray, filters)
  const sortedMosques = [...filteredMosques].sort((a, b) => {
    switch (sortBy) {
      case 'nearest':
        return (a.distance || Infinity) - (b.distance || Infinity)
      case 'verified':
        return b.verificationCount - a.verificationCount
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 rounded-xl border bg-linear-to-br from-card via-card to-secondary/30 p-6 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">{translate('browseMosques')}</h1>
        <p className="text-muted-foreground">{translate('browseSubtitle')}</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar onLocationFound={handleLocationFound} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 rounded-xl border p-4 bg-card/80 backdrop-blur">
        <div className="flex items-center gap-2 flex-wrap">
          {locating ? (
            <Badge variant="outline" className="py-1">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {translate('findingLocation')}
            </Badge>
          ) : userLocation ? (
            <Badge variant="secondary" className="py-1">
              <MapPin className="h-3 w-3 mr-1" />
              {translate('showingNearby')}
            </Badge>
          ) : (
            <Badge variant="outline" className="py-1">
              <List className="h-3 w-3 mr-1" />
              {translate('showingAll')}
            </Badge>
          )}
          {sortedMosques.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {translate('mosquesFound', { count: sortedMosques.length })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <PrayerFilter filters={filters} onFiltersChange={setFilters} />
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={translate('sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nearest">{translate('nearestFirst')}</SelectItem>
              <SelectItem value="verified">{translate('mostVerified')}</SelectItem>
              <SelectItem value="newest">{translate('recentlyAdded')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-lg">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-destructive">{translate('failedToLoadMosques')}</p>
          <p className="text-muted-foreground">{translate('pleaseTryAgainLater')}</p>
        </div>
      ) : sortedMosques.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMosques.map((mosque) => (
            <MosqueCard
              key={mosque._id}
              mosque={mosque}
              showDistance={!!userLocation}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">{translate('noMosquesFound')}</h2>
          <p className="text-muted-foreground mb-6">
            {userLocation
              ? translate('noMosquesFoundNear')
              : translate('beFirstCommunity')}
          </p>
          <Button asChild>
            <a href="/add">{translate('addMosque')}</a>
          </Button>
        </div>
      )}
    </div>
  )
}
