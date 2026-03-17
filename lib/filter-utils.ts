import { MosqueData } from './types'
import { PrayerFilters } from '@/components/prayer-filter'

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function isUpcomingTime(prayerTime: string, prayerName: string): boolean {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const dayOfWeek = now.getDay()

  // For Jummah, only show on Friday
  if (prayerName === 'jummah' && dayOfWeek !== 5) {
    return false
  }

  try {
    const prayerMinutes = timeToMinutes(prayerTime)
    return prayerMinutes > currentMinutes
  } catch {
    return false
  }
}

function hasUpcomingPrayer(mosque: MosqueData, prayerType?: string): boolean {
  if (!prayerType || prayerType === 'any') return true

  const prayer = mosque.jamaTimes[prayerType as keyof typeof mosque.jamaTimes]
  if (!prayer) return false

  return isUpcomingTime(prayer, prayerType)
}

export function filterMosques(mosques: MosqueData[], filters: PrayerFilters): MosqueData[] {
  return mosques.filter((mosque) => {
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

export function getUpcomingPrayers(mosque: MosqueData): string[] {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const dayOfWeek = now.getDay()

  const upcomingPrayers: string[] = []

  const prayers = [
    { name: 'fajr', time: mosque.jamaTimes.fajr },
    { name: 'dhuhr', time: mosque.jamaTimes.dhuhr },
    { name: 'asr', time: mosque.jamaTimes.asr },
    { name: 'maghrib', time: mosque.jamaTimes.maghrib },
    { name: 'isha', time: mosque.jamaTimes.isha },
  ]

  // Add Jummah only on Friday
  if (dayOfWeek === 5) {
    prayers.push({ name: 'jummah', time: mosque.jamaTimes.jummah })
  }

  for (const prayer of prayers) {
    try {
      const prayerMinutes = timeToMinutes(prayer.time)
      if (prayerMinutes > currentMinutes) {
        upcomingPrayers.push(prayer.name)
      }
    } catch {
      // Skip invalid times
    }
  }

  return upcomingPrayers
}

export function getNextPrayerTime(mosque: MosqueData): { name: string; time: string } | null {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const dayOfWeek = now.getDay()

  const prayers = [
    { name: 'Fajr', time: mosque.jamaTimes.fajr },
    { name: 'Dhuhr', time: mosque.jamaTimes.dhuhr },
    { name: 'Asr', time: mosque.jamaTimes.asr },
    { name: 'Maghrib', time: mosque.jamaTimes.maghrib },
    { name: 'Isha', time: mosque.jamaTimes.isha },
  ]

  // Add Jummah only on Friday
  if (dayOfWeek === 5) {
    prayers.push({ name: 'Jummah', time: mosque.jamaTimes.jummah })
  }

  for (const prayer of prayers) {
    try {
      const prayerMinutes = timeToMinutes(prayer.time)
      if (prayerMinutes > currentMinutes) {
        return { name: prayer.name, time: prayer.time }
      }
    } catch {
      // Skip invalid times
    }
  }

  return null
}
