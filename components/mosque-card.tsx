'use client'

import Link from 'next/link'
import { MosqueData } from '@/lib/types'
import { getNextPrayerTime } from '@/lib/filter-utils'
import { timestampToTimeString } from '@/lib/time-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Clock,
  CheckCircle,
  Navigation,
  Users,
  Car,
  Accessibility,
  Droplets,
  Wind,
} from 'lucide-react'

interface MosqueCardProps {
  mosque: MosqueData
  showDistance?: boolean
}

export default function MosqueCard({ mosque, showDistance }: MosqueCardProps) {
  const nextPrayer = getNextPrayerTime(mosque)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg leading-tight">{mosque.name}</CardTitle>
          <div className="flex gap-1 flex-wrap justify-end">
            {nextPrayer && (
              <Badge variant="default" className="shrink-0 bg-primary">
                <Clock className="h-3 w-3 mr-1" />
                {nextPrayer.name} {nextPrayer.time}
              </Badge>
            )}
            <Badge variant="secondary" className="shrink-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              {mosque.verificationCount}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{mosque.address}, {mosque.city}</span>
        </div>
        {showDistance && mosque.distance && (
          <div className="flex items-center gap-1 text-sm text-primary">
            <Navigation className="h-3 w-3" />
            <span>{(mosque.distance / 1000).toFixed(1)} km away</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-muted rounded p-2 text-center">
            <p className="text-muted-foreground">Fajr</p>
            <p className="font-medium">{timestampToTimeString(mosque.jamatTimes.fajr)}</p>
          </div>
          <div className="bg-muted rounded p-2 text-center">
            <p className="text-muted-foreground">Dhuhr</p>
            <p className="font-medium">{timestampToTimeString(mosque.jamatTimes.dhuhr)}</p>
          </div>
          <div className="bg-muted rounded p-2 text-center">
            <p className="text-muted-foreground">Asr</p>
            <p className="font-medium">{timestampToTimeString(mosque.jamatTimes.asr)}</p>
          </div>
          <div className="bg-muted rounded p-2 text-center">
            <p className="text-muted-foreground">Maghrib</p>
            <p className="font-medium">{timestampToTimeString(mosque.jamatTimes.maghrib)}</p>
          </div>
          <div className="bg-muted rounded p-2 text-center">
            <p className="text-muted-foreground">Isha</p>
            <p className="font-medium">{timestampToTimeString(mosque.jamatTimes.isha)}</p>
          </div>
          <div className="bg-primary/10 rounded p-2 text-center">
            <p className="text-muted-foreground">Jummah</p>
            <p className="font-medium text-primary">{timestampToTimeString(mosque.jamatTimes.jummah)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {mosque.facilities.femaleArea && (
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Female Area
            </Badge>
          )}
          {mosque.facilities.parking && (
            <Badge variant="outline" className="text-xs">
              <Car className="h-3 w-3 mr-1" />
              Parking
            </Badge>
          )}
          {mosque.facilities.wheelchairAccess && (
            <Badge variant="outline" className="text-xs">
              <Accessibility className="h-3 w-3 mr-1" />
              Accessible
            </Badge>
          )}
          {mosque.facilities.wuduFacilities && (
            <Badge variant="outline" className="text-xs">
              <Droplets className="h-3 w-3 mr-1" />
              Wudu
            </Badge>
          )}
          {mosque.facilities.airConditioned && (
            <Badge variant="outline" className="text-xs">
              <Wind className="h-3 w-3 mr-1" />
              A/C
            </Badge>
          )}
        </div>

        <Link href={`/mosque/${mosque._id}`}>
          <Button className="w-full" size="sm">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
