import { MosqueData } from './types'
import { PrayerFilters } from '@/components/prayer-filter'

/**
 * Converts timestamp to HH:MM format for display
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Check if a prayer time is in the future
 */
function isUpcomingTime(prayerTimestamp: number): boolean {
  const now = Date.now()
  return prayerTimestamp > now
}

/**
 * Check if mosque has a specific upcoming prayer
 */
function hasUpcomingPrayer(mosque: MosqueData | null, prayerType?: string): boolean {
  if (!mosque || !mosque.jamatTimes) return false
  if (!prayerType || prayerType === 'any') return true

  const prayerTimestamp = mosque.jamatTimes[prayerType as keyof typeof mosque.jamatTimes]
  if (!prayerTimestamp) return false

  return isUpcomingTime(prayerTimestamp)
}

/**
 * Filter mosques based on selected criteria
 */
export function filterMosques(mosques: MosqueData[], filters: PrayerFilters): MosqueData[] {
  return mosques.filter((mosque) => {
    // Guard: ensure mosque and facilities exist
    if (!mosque || !mosque.facilities) return false

    // Filter by upcoming prayer time
    if (filters.upcomingPrayer && filters.upcomingPrayer !== 'any') {
      if (!hasUpcomingPrayer(mosque, filters.upcomingPrayer)) {
        return false
      }
    }

    // Filter by female prayer area
    if (filters.femaleArea && !mosque.facilities.femaleArea) {
      return false
    }

    // Filter by wheelchair access
    if (filters.wheelchairAccess && !mosque.facilities.wheelchairAccess) {
      return false
    }

    // Filter by parking
    if (filters.parking && !mosque.facilities.parking) {
      return false
    }

    // Filter by wudu facilities
    if (filters.wuduFacilities && !mosque.facilities.wuduFacilities) {
      return false
    }

    return true
  })
}

/**
 * Get all upcoming prayers for a mosque
 */
export function getUpcomingPrayers(mosque: MosqueData | null): string[] {
  if (!mosque || !mosque.jamatTimes) return []

  const now = Date.now()
  const dayOfWeek = new Date().getDay()
  const upcomingPrayers: string[] = []

  const prayers = [
    { name: 'fajr', timestamp: mosque.jamatTimes.fajr },
    { name: 'dhuhr', timestamp: mosque.jamatTimes.dhuhr },
    { name: 'asr', timestamp: mosque.jamatTimes.asr },
    { name: 'maghrib', timestamp: mosque.jamatTimes.maghrib },
    { name: 'isha', timestamp: mosque.jamatTimes.isha },
  ]

  // Add Jummah only on Friday
  if (dayOfWeek === 5) {
    prayers.push({ name: 'jummah', timestamp: mosque.jamatTimes.jummah })
  }

  for (const prayer of prayers) {
    if (prayer.timestamp && prayer.timestamp > now) {
      upcomingPrayers.push(prayer.name)
    }
  }

  return upcomingPrayers
}

/**
 * Get the next upcoming prayer time
 */
export function getNextPrayerTime(mosque: MosqueData | null): { name: string; time: string } | null {
  if (!mosque || !mosque.jamatTimes) return null

  const now = Date.now()
  const dayOfWeek = new Date().getDay()

  const prayers = [
    { name: 'Fajr', timestamp: mosque.jamatTimes.fajr },
    { name: 'Dhuhr', timestamp: mosque.jamatTimes.dhuhr },
    { name: 'Asr', timestamp: mosque.jamatTimes.asr },
    { name: 'Maghrib', timestamp: mosque.jamatTimes.maghrib },
    { name: 'Isha', timestamp: mosque.jamatTimes.isha },
  ]

  // Add Jummah only on Friday
  if (dayOfWeek === 5 && mosque.jamatTimes.jummah) {
    prayers.push({ name: 'Jummah', timestamp: mosque.jamatTimes.jummah })
  }

  for (const prayer of prayers) {
    if (prayer.timestamp && prayer.timestamp > now) {
      return {
        name: prayer.name,
        time: formatTime(prayer.timestamp),
      }
    }
  }

  return null
}
