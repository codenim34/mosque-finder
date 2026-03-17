'use client'

import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { MosqueData } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, MapPin, Clock, Navigation } from 'lucide-react'

// Custom mosque marker icon
const mosqueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#166534" width="32" height="32">
      <path d="M12 2C12 2 7 6 7 10C7 12 8 14 8 14L4 14V22H20V14L16 14C16 14 17 12 17 10C17 6 12 2 12 2ZM12 5C12 5 14 7.5 14 10C14 11 13.5 12 13 13H11C10.5 12 10 11 10 10C10 7.5 12 5 12 5ZM9 16H15V20H9V16Z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// User location marker
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

interface MapEventsProps {
  onMapClick?: (lat: number, lng: number) => void
}

function MapEvents({ onMapClick }: MapEventsProps) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

interface RecenterMapProps {
  lat: number
  lng: number
  zoom?: number
}

function RecenterMap({ lat, lng, zoom }: RecenterMapProps) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], zoom || map.getZoom())
  }, [lat, lng, zoom, map])
  return null
}

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
  center = [21.4225, 39.8262], // Default to Mecca
  zoom = 13,
  userLocation,
  onMapClick,
  selectedLocation,
  className = '',
}: MosqueMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center)

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation)
    }
  }, [userLocation])

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {onMapClick && <MapEvents onMapClick={onMapClick} />}
      
      {userLocation && (
        <>
          <RecenterMap lat={userLocation[0]} lng={userLocation[1]} zoom={14} />
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {selectedLocation && (
        <Marker position={selectedLocation} icon={mosqueIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-medium">Selected Location</p>
            </div>
          </Popup>
        </Marker>
      )}

      {mosques.map((mosque) => (
        <Marker
          key={mosque._id}
          position={[
            mosque.location.coordinates[1],
            mosque.location.coordinates[0],
          ]}
          icon={mosqueIcon}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-base mb-1">{mosque.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {mosque.address}
              </p>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {mosque.verificationCount} verified
                </Badge>
                {mosque.distance && (
                  <Badge variant="outline" className="text-xs">
                    <Navigation className="h-3 w-3 mr-1" />
                    {(mosque.distance / 1000).toFixed(1)} km
                  </Badge>
                )}
              </div>

              <div className="text-xs space-y-1 mb-3">
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">Fajr:</span> {mosque.jamatTimes.fajr}
                  <span className="mx-1">|</span>
                  <span className="font-medium">Dhuhr:</span> {mosque.jamatTimes.dhuhr}
                </p>
              </div>

              <Link href={`/mosque/${mosque._id}`}>
                <Button size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
