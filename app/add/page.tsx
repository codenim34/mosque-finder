'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2, MapPin, Clock, Building2, Phone, Globe, FileText } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-75 bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <MapPin className="h-8 w-8 text-muted-foreground" />
    </div>
  ),
})

interface FormData {
  name: string
  address: string
  city: string
  country: string
  phone: string
  website: string
  description: string
  location: { lat: number; lng: number } | null
  jamatTimes: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    jummah: string
  }
  facilities: {
    femaleArea: boolean
    parking: boolean
    wheelchairAccess: boolean
    wuduFacilities: boolean
    airConditioned: boolean
  }
}

export default function AddMosquePage() {
  const router = useRouter()
  const { translate } = useLanguage()
  const bi = (bn: string, en: string) => `${bn} (${en})`
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    website: '',
    description: '',
    location: null,
    jamatTimes: {
      fajr: '',
      dhuhr: '',
      asr: '',
      maghrib: '',
      isha: '',
      jummah: '',
    },
    facilities: {
      femaleArea: false,
      parking: false,
      wheelchairAccess: false,
      wuduFacilities: false,
      airConditioned: false,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.location) {
      toast.error(translate('selectLocationMap'))
      return
    }

    if (!formData.name || !formData.address || !formData.city || !formData.country) {
      toast.error(translate('fillRequiredFields'))
      return
    }

    const times = formData.jamatTimes
    if (!times.fajr || !times.dhuhr || !times.asr || !times.maghrib || !times.isha || !times.jummah) {
      toast.error(translate('fillPrayerTimes'))
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/mosques', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          latitude: formData.location.lat,
          longitude: formData.location.lng,
          jamatTimes: formData.jamatTimes,
          facilities: formData.facilities,
          phone: formData.phone,
          website: formData.website,
          description: formData.description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add mosque')
      }

      const mosque = await response.json()
      toast.success(translate('mosqueAddedSuccess'))
      router.push(`/mosque/${mosque._id}`)
    } catch (error) {
      console.error('Error adding mosque:', error)
      toast.error(translate('failedAddMosque'))
    } finally {
      setSubmitting(false)
    }
  }

  const updateField = (field: keyof FormData, value: string | boolean | object | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateJamatTime = (prayer: keyof FormData['jamatTimes'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      jamatTimes: { ...prev.jamatTimes, [prayer]: value },
    }))
  }

  const updateFacility = (facility: keyof FormData['facilities'], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      facilities: { ...prev.facilities, [facility]: value },
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 rounded-xl border bg-linear-to-br from-card via-card to-secondary/25 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-balance">{bi('মসজিদ যোগ করুন', 'Add Mosque')}</h1>
        <p className="text-muted-foreground mt-2">
          {bi('কমিউনিটির জন্য নির্ভরযোগ্য তথ্য যোগ করুন।', 'Add reliable mosque information for the community.')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {bi('মৌলিক তথ্য', 'Basic Information')}
            </CardTitle>
            <CardDescription>{bi('মসজিদের নাম ও ঠিকানা দিন', 'Provide mosque name and address')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{bi('মসজিদের নাম', 'Mosque Name')} *</Label>
              <Input
                id="name"
                placeholder="যেমন: আল-রহমান জামে মসজিদ / e.g., Al-Rahman Jame Masjid"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{bi('রাস্তার ঠিকানা', 'Street Address')} *</Label>
              <Input
                id="address"
                placeholder="যেমন: ১২৩ মেইন রোড / e.g., 123 Main Road"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{bi('শহর', 'City')} *</Label>
                <Input
                  id="city"
                  placeholder="যেমন: ঢাকা / e.g., Dhaka"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{bi('দেশ', 'Country')} *</Label>
                <Input
                  id="country"
                  placeholder="যেমন: বাংলাদেশ / e.g., Bangladesh"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {bi('মানচিত্রে অবস্থান', 'Location on Map')} *
            </CardTitle>
            <CardDescription>{bi('ম্যাপে পিন দিন বা সার্চ করুন', 'Pin on map or search location')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationPicker
              value={formData.location}
              onChange={(location) => updateField('location', location)}
            />
          </CardContent>
        </Card>

        {/* Prayer Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {bi('জামাতের সময়', 'Jamat Times')} *
            </CardTitle>
            <CardDescription>{bi('বিল্ট-ইন টাইম সিলেক্টর ব্যবহার করুন', 'Use built-in time selector (English HH:MM)')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fajr">ফজর (Fajr)</Label>
                <Input
                  id="fajr"
                  type="time"
                  lang="en"
                  step={60}
                  value={formData.jamatTimes.fajr}
                  onChange={(e) => updateJamatTime('fajr', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dhuhr">যোহর (Dhuhr)</Label>
                <Input
                  id="dhuhr"
                  type="time"
                  lang="en"
                  step={60}
                  value={formData.jamatTimes.dhuhr}
                  onChange={(e) => updateJamatTime('dhuhr', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asr">আসর (Asr)</Label>
                <Input
                  id="asr"
                  type="time"
                  lang="en"
                  step={60}
                  value={formData.jamatTimes.asr}
                  onChange={(e) => updateJamatTime('asr', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maghrib">মাগরিব (Maghrib)</Label>
                <Input
                  id="maghrib"
                  type="time"
                  lang="en"
                  step={60}
                  value={formData.jamatTimes.maghrib}
                  onChange={(e) => updateJamatTime('maghrib', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isha">এশা (Isha)</Label>
                <Input
                  id="isha"
                  type="time"
                  lang="en"
                  step={60}
                  value={formData.jamatTimes.isha}
                  onChange={(e) => updateJamatTime('isha', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jummah" className="text-primary font-medium">জুমা (Jummah - Friday)</Label>
                <Input
                  id="jummah"
                  type="time"
                  lang="en"
                  step={60}
                  value={formData.jamatTimes.jummah}
                  onChange={(e) => updateJamatTime('jummah', e.target.value)}
                  required
                  className="border-primary/50"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {bi('সময় ফরম্যাট: HH:MM (ইংরেজি)', 'Time format: HH:MM (English)')}
            </p>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>{bi('সুবিধাসমূহ', 'Facilities')}</CardTitle>
            <CardDescription>{bi('যে সুবিধাগুলো আছে সেগুলো নির্বাচন করুন', 'Select available facilities')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.femaleArea}
                  onCheckedChange={(checked) => updateFacility('femaleArea', !!checked)}
                />
                <span>{translate('femalePrayerArea')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.parking}
                  onCheckedChange={(checked) => updateFacility('parking', !!checked)}
                />
                <span>{translate('parkingAvailable')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.wheelchairAccess}
                  onCheckedChange={(checked) => updateFacility('wheelchairAccess', !!checked)}
                />
                <span>{translate('wheelchairAccessible')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.wuduFacilities}
                  onCheckedChange={(checked) => updateFacility('wuduFacilities', !!checked)}
                />
                <span>{translate('wuduFacilities')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.airConditioned}
                  onCheckedChange={(checked) => updateFacility('airConditioned', !!checked)}
                />
                <span>{translate('airConditioned')}</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>{bi('অতিরিক্ত তথ্য (ঐচ্ছিক)', 'Additional Information (Optional)')}</CardTitle>
            <CardDescription>{bi('যোগাযোগ ও বর্ণনা দিন', 'Add contact details and description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {bi('ফোন', 'Phone')}
                </Label>
                <Input
                  id="phone"
                  placeholder="যেমন: +8801XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {bi('ওয়েবসাইট', 'Website')}
                </Label>
                <Input
                  id="website"
                  placeholder="e.g., https://mosque.org"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {bi('বর্ণনা', 'Description')}
              </Label>
              <Textarea
                id="description"
                placeholder="মসজিদ সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            {translate('cancel')}
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {translate('addingMosque')}
              </>
            ) : (
              translate('addMosqueSubmit')
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
