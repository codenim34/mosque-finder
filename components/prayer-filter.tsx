'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

export interface PrayerFilters {
  upcomingPrayer?: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'jummah' | 'any'
  femaleArea?: boolean
  wheelchairAccess?: boolean
  parking?: boolean
  wuduFacilities?: boolean
}

interface PrayerFilterProps {
  filters: PrayerFilters
  onFiltersChange: (filters: PrayerFilters) => void
}

const prayerTimes = [
  { value: 'fajr', label: 'Fajr', icon: '🌙' },
  { value: 'dhuhr', label: 'Dhuhr', icon: '☀️' },
  { value: 'asr', label: 'Asr', icon: '⛅' },
  { value: 'maghrib', label: 'Maghrib', icon: '🌅' },
  { value: 'isha', label: 'Isha', icon: '🌙' },
  { value: 'jummah', label: 'Jummah', icon: '📅' },
]

export default function PrayerFilter({ filters, onFiltersChange }: PrayerFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { translate } = useLanguage()

  const facilities = [
    { id: 'femaleArea', label: translate('femalePrayerArea') },
    { id: 'wheelchairAccess', label: translate('wheelchairAccessible') },
    { id: 'parking', label: translate('parkingAvailable') },
    { id: 'wuduFacilities', label: translate('wuduFacilities') },
  ]

  const hasActiveFilters = Object.values(filters).some((v) => v === true || (v && v !== 'any'))

  const handlePrayerChange = (prayer: string) => {
    onFiltersChange({
      ...filters,
      upcomingPrayer: prayer === 'any' ? 'any' : (prayer as any),
    })
  }

  const handleFacilityChange = (facilityKey: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [facilityKey]: checked || undefined,
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({})
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant={hasActiveFilters ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        {translate('filter')}
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-1 px-1.5">
            {Object.values(filters).filter((v) => v === true || (v && v !== 'any')).length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{translate('filterMosques')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Prayer Time Filter */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">{translate('upcomingPrayer')}</label>
            <Select
              value={filters.upcomingPrayer || 'any'}
              onValueChange={handlePrayerChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{translate('showAllTimes')}</SelectItem>
                {prayerTimes.map((prayer) => (
                  <SelectItem key={prayer.value} value={prayer.value}>
                    {prayer.icon} {prayer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {translate('upcomingPrayerHint')}
            </p>
          </div>

          {/* Facilities Filter */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">{translate('facilities')}</label>
            <div className="space-y-3">
              {facilities.map((facility) => (
                <div key={facility.id} className="flex items-center gap-2">
                  <Checkbox
                    id={facility.id}
                    checked={filters[facility.id as keyof PrayerFilters] === true}
                    onCheckedChange={(checked) =>
                      handleFacilityChange(facility.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={facility.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {facility.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="w-full text-muted-foreground"
            >
              {translate('clearAllFilters')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
