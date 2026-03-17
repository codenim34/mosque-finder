import { NextRequest } from 'next/server'
import { IMosque } from '@/lib/models/mosque'
import { IMosqueUpdate } from '@/lib/models/mosque-update'

export const UPDATE_APPROVAL_THRESHOLD = 3

const JAMAT_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jummah'] as const
const FACILITY_KEYS = [
  'femaleArea',
  'parking',
  'wheelchairAccess',
  'wuduFacilities',
  'airConditioned',
] as const

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

export function normalizeOptionalText(value: unknown): string | null | undefined {
  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  return trimmed
}

export function hasAnyUpdateContent(update: {
  jamatTimes?: Record<string, unknown>
  facilities?: Record<string, unknown>
  contactInfo?: Record<string, unknown>
}): boolean {
  const hasJamatTimes = Boolean(update.jamatTimes && Object.keys(update.jamatTimes).length)
  const hasFacilities = Boolean(update.facilities && Object.keys(update.facilities).length)
  const hasContactInfo = Boolean(update.contactInfo && Object.keys(update.contactInfo).length)
  return hasJamatTimes || hasFacilities || hasContactInfo
}

export function applyUpdateToMosque(mosque: IMosque, update: IMosqueUpdate): void {
  if (update.jamatTimes) {
    for (const key of JAMAT_KEYS) {
      const value = update.jamatTimes[key]
      if (typeof value === 'number') {
        mosque.jamatTimes[key] = value
      }
    }
  }

  if (update.facilities) {
    for (const key of FACILITY_KEYS) {
      const value = update.facilities[key]
      if (typeof value === 'boolean') {
        mosque.facilities[key] = value
      }
    }
  }

  if (update.contactInfo) {
    const { address, city, country, phone, website, description } = update.contactInfo

    if (typeof address === 'string') {
      mosque.address = address
    }
    if (typeof city === 'string') {
      mosque.city = city
    }
    if (typeof country === 'string') {
      mosque.country = country
    }

    if (phone !== undefined) {
      mosque.phone = phone ?? undefined
    }
    if (website !== undefined) {
      mosque.website = website ?? undefined
    }
    if (description !== undefined) {
      mosque.description = description ?? undefined
    }
  }
}
