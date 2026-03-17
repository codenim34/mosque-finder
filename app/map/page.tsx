'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { MosqueData } from '@/lib/types'
import SearchBar from '@/components/search-bar'
import MosqueCard from '@/components/mosque-card'
import PrayerFilter, { PrayerFilters } from '@/components/prayer-filter'
import { filterMosques } from '@/lib/filter-utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, List, X, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

const MosqueMap = dynamic(() => import('@/components/map/mosque-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [locating, setLocating] = useState(false)
  const [filters, setFilters] = useState<PrayerFilters>({})
  const { translate } = useLanguage()

  // Build API URL based on user location
  const apiUrl = userLocation
    ? `/api/mosques?lat=${userLocation[0]}&lng=${userLocation[1]}&radius=50000`
    : '/api/mosques'

  const { data: mosquesData, error, isLoading } = useSWR<MosqueData[]>(apiUrl, fetcher)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => {
      const mobile = media.matches
      setIsMobile(mobile)
      setShowSidebar(!mobile)
    }

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  // Ensure mosques is always an array
  const allMosques = Array.isArray(mosquesData) ? mosquesData : []
  const mosques = filterMosques(allMosques, filters)

  // Try to get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
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
    setUserLocation([lat, lng])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Search Bar */}
      <div className="p-4 bg-linear-to-r from-background via-secondary/60 to-background border-b">
        <SearchBar
          onLocationFound={handleLocationFound}
          className="max-w-3xl mx-auto"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            'absolute md:relative z-20 bg-background transition-all duration-300',
            'md:h-full md:border-r',
            isMobile
              ? 'inset-x-0 bottom-0 h-[72%] border-t rounded-t-2xl shadow-2xl'
              : 'h-full',
            isMobile
              ? (showSidebar ? 'translate-y-0' : 'translate-y-full')
              : (showSidebar ? 'w-full md:w-96' : 'w-0')
          )}
        >
          {showSidebar && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-card/80 backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-semibold">{translate('nearbyMosques')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {isLoading
                        ? translate('loading')
                        : translate('mosquesFound', { count: mosques.length })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setShowSidebar(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <PrayerFilter filters={filters} onFiltersChange={setFilters} />
              </div>

              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>{translate('failedToLoadMosques')}</p>
                    <p className="text-sm">{translate('pleaseTryAgainLater')}</p>
                  </div>
                ) : mosques.length > 0 ? (
                  <div className="space-y-4">
                    {mosques.map((mosque) => (
                      <MosqueCard
                        key={mosque._id}
                        mosque={mosque}
                        showDistance={!!userLocation}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">{translate('noMosquesFound')}</p>
                    <p className="text-sm">{translate('firstToAddMosque')}</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MosqueMap
            mosques={mosques || []}
            userLocation={userLocation}
            zoom={userLocation ? 13 : 3}
          />

          {isMobile && !showSidebar && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20">
              <Button
                className="shadow-lg rounded-full px-5"
                onClick={() => setShowSidebar(true)}
              >
                <List className="h-4 w-4 mr-2" />
                {translate('showList')}
              </Button>
            </div>
          )}

          {/* Mobile toggle button */}
          {!showSidebar && !isMobile && (
            <Button
              className="absolute bottom-4 left-4 z-10 md:hidden shadow-lg"
              onClick={() => setShowSidebar(true)}
            >
              <List className="h-4 w-4 mr-2" />
              {translate('showList')}
            </Button>
          )}

          {/* Loading indicator */}
          {locating && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{translate('findingLocation')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
