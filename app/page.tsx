'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { MosqueData } from '@/lib/types'
import SearchBar from '@/components/search-bar'
import MosqueCard from '@/components/mosque-card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, List, X, Loader2 } from 'lucide-react'

const MosqueMap = dynamic(() => import('@/components/map/mosque-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [locating, setLocating] = useState(false)

  // Build API URL based on user location
  const apiUrl = userLocation
    ? `/api/mosques?lat=${userLocation[0]}&lng=${userLocation[1]}&radius=50000`
    : '/api/mosques'

  const { data: mosquesData, error, isLoading } = useSWR<MosqueData[]>(apiUrl, fetcher)
  
  // Ensure mosques is always an array
  const mosques = Array.isArray(mosquesData) ? mosquesData : []

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
      <div className="p-4 bg-card border-b">
        <SearchBar
          onLocationFound={handleLocationFound}
          className="max-w-3xl mx-auto"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <div
          className={`
            absolute md:relative z-10 h-full bg-background border-r transition-all duration-300
            ${showSidebar ? 'w-full md:w-96' : 'w-0'}
          `}
        >
          {showSidebar && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Nearby Mosques</h2>
                  <p className="text-sm text-muted-foreground">
                    {isLoading
                      ? 'Loading...'
                      : `${mosques.length} mosques found`}
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
                    <p>Failed to load mosques</p>
                    <p className="text-sm">Please try again later</p>
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
                    <p className="font-medium">No mosques found</p>
                    <p className="text-sm">Be the first to add a mosque in this area</p>
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

          {/* Mobile toggle button */}
          {!showSidebar && (
            <Button
              className="absolute bottom-4 left-4 z-10 md:hidden shadow-lg"
              onClick={() => setShowSidebar(true)}
            >
              <List className="h-4 w-4 mr-2" />
              Show List
            </Button>
          )}

          {/* Loading indicator */}
          {locating && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Finding your location...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
