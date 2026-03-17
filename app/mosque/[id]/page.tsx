'use client'

import { use, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import { MosqueData } from '@/lib/types'
import { toast } from 'sonner'
import { useLanguage } from '@/components/language-provider'
import { timestampToTimeString } from '@/lib/time-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Globe,
  ArrowLeft,
  Navigation,
  Users,
  Car,
  Accessibility,
  Droplets,
  Wind,
  ExternalLink,
  Loader2,
  Share2,
} from 'lucide-react'

const MosqueMap = dynamic(() => import('@/components/map/mosque-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-75 bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <MapPin className="h-8 w-8 text-muted-foreground" />
    </div>
  ),
})

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MosqueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [verifying, setVerifying] = useState(false)
  const { translate } = useLanguage()

  const { data: mosque, error, isLoading } = useSWR<MosqueData>(
    `/api/mosques/${id}`,
    fetcher
  )

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const response = await fetch(`/api/mosques/${id}/verify`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.alreadyVerified) {
        toast.info(translate('alreadyVerified'))
      } else if (response.ok) {
        toast.success(translate('verifyThanks'))
        mutate(`/api/mosques/${id}`)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(translate('verifyFailed'))
    } finally {
      setVerifying(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: mosque?.name,
          text: `Check out ${mosque?.name} on Mosque Finder`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(translate('copiedLink'))
    }
  }

  const handleGetDirections = () => {
    if (mosque) {
      const [lng, lat] = mosque.location.coordinates
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        '_blank'
      )
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-64 mb-8" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-75" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !mosque) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">{translate('mosqueNotFound')}</h1>
        <p className="text-muted-foreground mb-6">
          {translate('mosqueNotFoundDesc')}
        </p>
        <Link href="/map">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {translate('backToMap')}
          </Button>
        </Link>
      </div>
    )
  }

  const facilities = [
    { key: 'femaleArea', label: translate('femalePrayerArea'), icon: Users },
    { key: 'parking', label: translate('parkingAvailable'), icon: Car },
    { key: 'wheelchairAccess', label: translate('wheelchairAccessible'), icon: Accessibility },
    { key: 'wuduFacilities', label: translate('wuduFacilities'), icon: Droplets },
    { key: 'airConditioned', label: translate('airConditioned'), icon: Wind },
  ] as const

  const prayerTimes = [
    { key: 'fajr', label: 'Fajr', highlight: false },
    { key: 'dhuhr', label: 'Dhuhr', highlight: false },
    { key: 'asr', label: 'Asr', highlight: false },
    { key: 'maghrib', label: 'Maghrib', highlight: false },
    { key: 'isha', label: 'Isha', highlight: false },
    { key: 'jummah', label: 'Jummah', highlight: true },
  ] as const

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Link href="/map" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {translate('backToMap')}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">{mosque.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4 shrink-0" />
            {mosque.address}, {mosque.city}, {mosque.country}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <CheckCircle className="h-4 w-4 mr-1" />
            {translate('verifiedCount', { count: mosque.verificationCount })}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Map */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-75">
              <MosqueMap
                mosques={[mosque]}
                center={[
                  mosque.location.coordinates[1],
                  mosque.location.coordinates[0],
                ]}
                zoom={15}
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleGetDirections} className="flex-1">
              <Navigation className="h-4 w-4 mr-2" />
              {translate('getDirections')}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Verify */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                {translate('verifyHint')}
              </p>
              <Button
                onClick={handleVerify}
                disabled={verifying}
                variant="secondary"
                className="w-full"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {translate('verifying')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {translate('verifyThisMosque')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Prayer Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {translate('jamatTimes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {prayerTimes.map(({ key, label, highlight }) => (
                  <div
                    key={key}
                    className={`rounded-lg p-3 text-center ${
                      highlight ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                    }`}
                  >
                    <p className={`text-sm ${highlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {label}
                    </p>
                    <p className={`text-lg font-semibold ${highlight ? 'text-primary' : ''}`}>
                      {timestampToTimeString(mosque.jamatTimes[key])}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>{translate('facilities')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {facilities.map(({ key, label, icon: Icon }) => {
                  const available = mosque.facilities[key]
                  return (
                    <Badge
                      key={key}
                      variant={available ? 'default' : 'outline'}
                      className={available ? '' : 'opacity-50'}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {label}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          {(mosque.phone || mosque.website || mosque.description) && (
            <Card>
              <CardHeader>
                <CardTitle>{translate('additionalInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mosque.phone && (
                  <a
                    href={`tel:${mosque.phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {mosque.phone}
                  </a>
                )}
                {mosque.website && (
                  <a
                    href={mosque.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    {translate('visitWebsite')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {mosque.description && (
                  <>
                    <Separator />
                    <p className="text-sm text-muted-foreground">{mosque.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
