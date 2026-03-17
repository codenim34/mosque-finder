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

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
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
      toast.error('Please select a location on the map')
      return
    }

    if (!formData.name || !formData.address || !formData.city || !formData.country) {
      toast.error('Please fill in all required fields')
      return
    }

    const times = formData.jamatTimes
    if (!times.fajr || !times.dhuhr || !times.asr || !times.maghrib || !times.isha || !times.jummah) {
      toast.error('Please fill in all prayer times')
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
      toast.success('Mosque added successfully!')
      router.push(`/mosque/${mosque._id}`)
    } catch (error) {
      console.error('Error adding mosque:', error)
      toast.error('Failed to add mosque. Please try again.')
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Add a Mosque</h1>
        <p className="text-muted-foreground mt-2">
          Help the community by adding mosque information. Others can verify the details you provide.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Enter the mosque&apos;s name and location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Mosque Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Al-Rahman Mosque"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                placeholder="e.g., 123 Main Street"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., London"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="e.g., United Kingdom"
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
              Location on Map *
            </CardTitle>
            <CardDescription>Click on the map or search to set the exact location</CardDescription>
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
              Jamat Times *
            </CardTitle>
            <CardDescription>Enter the congregation prayer times (use 24-hour or 12-hour format)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fajr">Fajr</Label>
                <Input
                  id="fajr"
                  placeholder="e.g., 5:30 AM"
                  value={formData.jamatTimes.fajr}
                  onChange={(e) => updateJamatTime('fajr', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dhuhr">Dhuhr</Label>
                <Input
                  id="dhuhr"
                  placeholder="e.g., 1:30 PM"
                  value={formData.jamatTimes.dhuhr}
                  onChange={(e) => updateJamatTime('dhuhr', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asr">Asr</Label>
                <Input
                  id="asr"
                  placeholder="e.g., 5:00 PM"
                  value={formData.jamatTimes.asr}
                  onChange={(e) => updateJamatTime('asr', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maghrib">Maghrib</Label>
                <Input
                  id="maghrib"
                  placeholder="e.g., 7:30 PM"
                  value={formData.jamatTimes.maghrib}
                  onChange={(e) => updateJamatTime('maghrib', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isha">Isha</Label>
                <Input
                  id="isha"
                  placeholder="e.g., 9:00 PM"
                  value={formData.jamatTimes.isha}
                  onChange={(e) => updateJamatTime('isha', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jummah" className="text-primary font-medium">Jummah (Friday)</Label>
                <Input
                  id="jummah"
                  placeholder="e.g., 1:15 PM"
                  value={formData.jamatTimes.jummah}
                  onChange={(e) => updateJamatTime('jummah', e.target.value)}
                  required
                  className="border-primary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
            <CardDescription>Select the facilities available at this mosque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.femaleArea}
                  onCheckedChange={(checked) => updateFacility('femaleArea', !!checked)}
                />
                <span>Female Prayer Area</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.parking}
                  onCheckedChange={(checked) => updateFacility('parking', !!checked)}
                />
                <span>Parking Available</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.wheelchairAccess}
                  onCheckedChange={(checked) => updateFacility('wheelchairAccess', !!checked)}
                />
                <span>Wheelchair Accessible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.wuduFacilities}
                  onCheckedChange={(checked) => updateFacility('wuduFacilities', !!checked)}
                />
                <span>Wudu Facilities</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.facilities.airConditioned}
                  onCheckedChange={(checked) => updateFacility('airConditioned', !!checked)}
                />
                <span>Air Conditioned</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information (Optional)</CardTitle>
            <CardDescription>Add contact details and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g., +44 123 456 7890"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
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
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Any additional information about the mosque..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Mosque...
              </>
            ) : (
              'Add Mosque'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
