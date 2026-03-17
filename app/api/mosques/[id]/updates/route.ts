import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Mosque from '@/lib/models/mosque'
import MosqueUpdate from '@/lib/models/mosque-update'
import {
  applyUpdateToMosque,
  getClientIP,
  hasAnyUpdateContent,
  normalizeOptionalText,
} from '@/lib/mosque-update-utils'
import { isTimeString, timeStringToTimestamp } from '@/lib/time-utils'

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jummah'] as const
const FACILITY_KEYS = [
  'femaleArea',
  'parking',
  'wheelchairAccess',
  'wuduFacilities',
  'airConditioned',
] as const

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params

    const updates = await MosqueUpdate.find({ mosqueId: id })
      .sort({ createdAt: -1 })
      .limit(20)

    return NextResponse.json(updates)
  } catch (error) {
    console.error('Error fetching mosque updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mosque updates' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()
    const clientIP = getClientIP(request)

    const mosque = await Mosque.findById(id)

    if (!mosque) {
      return NextResponse.json({ error: 'Mosque not found' }, { status: 404 })
    }

    const jamatTimes: Record<string, number> = {}
    const incomingJamatTimes = body?.jamatTimes ?? {}

    for (const key of PRAYER_KEYS) {
      const rawValue = incomingJamatTimes[key]
      if (rawValue === undefined) {
        continue
      }

      if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
        if (rawValue !== mosque.jamatTimes[key]) {
          jamatTimes[key] = rawValue
        }
        continue
      }

      if (isTimeString(rawValue)) {
        const timestamp = timeStringToTimestamp(rawValue)
        if (timestamp !== mosque.jamatTimes[key]) {
          jamatTimes[key] = timestamp
        }
      }
    }

    const facilities: Record<string, boolean> = {}
    const incomingFacilities = body?.facilities ?? {}

    for (const key of FACILITY_KEYS) {
      const rawValue = incomingFacilities[key]
      if (typeof rawValue === 'boolean' && rawValue !== mosque.facilities[key]) {
        facilities[key] = rawValue
      }
    }

    const contactInfo: Record<string, string | null> = {}
    const incomingContactInfo = body?.contactInfo ?? {}

    const address = normalizeOptionalText(incomingContactInfo.address)
    if (address !== undefined && address !== mosque.address) {
      contactInfo.address = address
    }

    const city = normalizeOptionalText(incomingContactInfo.city)
    if (city !== undefined && city !== mosque.city) {
      contactInfo.city = city
    }

    const country = normalizeOptionalText(incomingContactInfo.country)
    if (country !== undefined && country !== mosque.country) {
      contactInfo.country = country
    }

    const phone = normalizeOptionalText(incomingContactInfo.phone)
    if (phone !== undefined && (phone ?? undefined) !== mosque.phone) {
      contactInfo.phone = phone
    }

    const website = normalizeOptionalText(incomingContactInfo.website)
    if (website !== undefined && (website ?? undefined) !== mosque.website) {
      contactInfo.website = website
    }

    const description = normalizeOptionalText(incomingContactInfo.description)
    if (description !== undefined && (description ?? undefined) !== mosque.description) {
      contactInfo.description = description
    }

    const proposal = {
      jamatTimes,
      facilities,
      contactInfo,
    }

    if (!hasAnyUpdateContent(proposal)) {
      return NextResponse.json(
        { error: 'No changes detected. Please update at least one field.' },
        { status: 400 }
      )
    }

    const note = normalizeOptionalText(body?.note)
    const createdUpdate = new MosqueUpdate({
      mosqueId: id,
      jamatTimes,
      facilities,
      contactInfo,
      note: note ?? undefined,
      supportCount: 1,
      supportedIPs: [clientIP],
      status: 'approved',
      resolvedAt: new Date(),
    })

    applyUpdateToMosque(mosque, createdUpdate)

    await Promise.all([mosque.save(), createdUpdate.save()])

    return NextResponse.json(
      {
        success: true,
        applied: true,
        update: createdUpdate,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating mosque update:', error)
    return NextResponse.json(
      { error: 'Failed to submit update suggestion' },
      { status: 500 }
    )
  }
}
