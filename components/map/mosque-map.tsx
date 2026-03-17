'use client'

import { useEffect, useState, useRef } from 'react'
import { MosqueData } from '@/lib/types'
import { defaultLocale, t } from '@/lib/i18n'

interface MosqueMapProps {
  mosques: MosqueData[]
  center?: [number, number]
  zoom?: number
  userLocation?: [number, number] | null
  onMapClick?: (lat: number, lng: number) => void
  selectedLocation?: [number, number] | null
  className?: string
}

export default function MosqueMap({
  mosques,
  center = [21.4225, 39.8262],
  zoom = 13,
  userLocation,
  onMapClick,
  selectedLocation,
  className = '',
}: MosqueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)
  const selectedMarkerRef = useRef<L.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [locale, setLocale] = useState(defaultLocale)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedLocale = window.localStorage.getItem('mosque-finder-locale')
    if (savedLocale === 'bn' || savedLocale === 'en') {
      setLocale(savedLocale)
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // If map already exists, don't recreate
      if (mapRef.current) {
        setIsLoaded(true)
        return
      }

      // Check if container already has a map (Leaflet adds _leaflet_id)
      const container = mapContainerRef.current as HTMLElement & { _leaflet_id?: number } | null
      if (container && container._leaflet_id) {
        setIsLoaded(true)
        return
      }

      // Create map
      const map = L.map(mapContainerRef.current!, {
        center: userLocation || center,
        zoom: zoom,
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add click handler
      if (onMapClick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng)
        })
      }

      mapRef.current = map
      setIsLoaded(true)
    })

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update map center when userLocation changes
  useEffect(() => {
    if (!mapRef.current || !userLocation) return
    mapRef.current.setView(userLocation, 14)
  }, [userLocation])

  // Update user marker
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return

    import('leaflet').then((L) => {
      // Remove old user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }

      if (userLocation) {
        const userIcon = L.icon({
          iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
            </svg>
          `),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
          .addTo(mapRef.current!)
          .bindPopup(`<div class="text-center font-medium">${t(locale, 'yourLocation')}</div>`)
      }
    })
  }, [userLocation, isLoaded])

  // Update selected location marker
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return

    import('leaflet').then((L) => {
      // Remove old selected marker
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove()
        selectedMarkerRef.current = null
      }

      if (selectedLocation) {
        const selectedIcon = L.icon({
          iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#166534" width="32" height="32">
              <path d="M12 2C12 2 7 6 7 10C7 12 8 14 8 14L4 14V22H20V14L16 14C16 14 17 12 17 10C17 6 12 2 12 2ZM12 5C12 5 14 7.5 14 10C14 11 13.5 12 13 13H11C10.5 12 10 11 10 10C10 7.5 12 5 12 5ZM9 16H15V20H9V16Z"/>
            </svg>
          `),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })

        selectedMarkerRef.current = L.marker(selectedLocation, { icon: selectedIcon })
          .addTo(mapRef.current!)
          .bindPopup(`<div class="text-center font-medium">${t(locale, 'selectedLocation')}</div>`)
        
        mapRef.current!.setView(selectedLocation, 15)
      }
    })
  }, [selectedLocation, isLoaded])

  // Update mosque markers
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return

    import('leaflet').then((L) => {
      // Remove old markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Guard: ensure mosques is an array
      if (!Array.isArray(mosques) || mosques.length === 0) return

      const mosqueIcon = L.icon({
        iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#166534" width="32" height="32">
            <path d="M12 2C12 2 7 6 7 10C7 12 8 14 8 14L4 14V22H20V14L16 14C16 14 17 12 17 10C17 6 12 2 12 2ZM12 5C12 5 14 7.5 14 10C14 11 13.5 12 13 13H11C10.5 12 10 11 10 10C10 7.5 12 5 12 5ZM9 16H15V20H9V16Z"/>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      mosques.forEach((mosque) => {
        const marker = L.marker(
          [mosque.location.coordinates[1], mosque.location.coordinates[0]],
          { icon: mosqueIcon }
        ).addTo(mapRef.current!)

        const distanceText = mosque.distance 
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs">${t(locale, 'kmAway', { distance: (mosque.distance / 1000).toFixed(1) })}</span>` 
          : ''

        // Format times from timestamps
        const formatTime = (timestamp: number) => {
          const date = new Date(timestamp)
          return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
        }

        marker.bindPopup(`
          <div class="min-w-50 p-1">
            <h3 class="font-semibold text-base mb-1">${mosque.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${mosque.address}</p>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                ${t(locale, 'verifiedCount', { count: mosque.verificationCount })}
              </span>
              ${distanceText}
            </div>
            <div class="text-xs mb-3">
              <span class="font-medium">Fajr:</span> ${formatTime(mosque.jamatTimes.fajr)} | 
              <span class="font-medium">Dhuhr:</span> ${formatTime(mosque.jamatTimes.dhuhr)}
            </div>
            <a href="/mosque/${mosque._id}" class="block w-full text-center bg-green-700 hover:bg-green-800 text-white py-1.5 px-3 rounded text-sm">
              ${t(locale, 'mapPopupViewDetails')}
            </a>
          </div>
        `)

        markersRef.current.push(marker)
      })
    })
  }, [mosques, isLoaded])

  return (
    <div className={`w-full h-full relative ${className}`} style={{ minHeight: '400px' }}>
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-muted-foreground">{t(locale, 'loadingMap')}</div>
        </div>
      )}
    </div>
  )
}
