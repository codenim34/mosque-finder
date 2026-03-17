import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Mosque from '@/lib/models/mosque'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '10000' // Default 10km in meters
    const query = searchParams.get('query')

    let mosques

    if (lat && lng) {
      // Geospatial query for nearby mosques
      mosques = await Mosque.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            distanceField: 'distance',
            maxDistance: parseInt(radius),
            spherical: true,
          },
        },
        { $limit: 50 },
      ])
    } else if (query) {
      // Text search
      mosques = await Mosque.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(50)
    } else {
      // Return all mosques (limited)
      mosques = await Mosque.find({}).sort({ createdAt: -1 }).limit(100)
    }

    return NextResponse.json(mosques)
  } catch (error) {
    console.error('Error fetching mosques:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mosques' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    const mosque = new Mosque({
      name: body.name,
      address: body.address,
      city: body.city,
      country: body.country,
      location: {
        type: 'Point',
        coordinates: [body.longitude, body.latitude],
      },
      jamatTimes: body.jamatTimes,
      facilities: body.facilities,
      phone: body.phone,
      website: body.website,
      description: body.description,
      verificationCount: 0,
      verifiedIPs: [],
    })

    await mosque.save()

    return NextResponse.json(mosque, { status: 201 })
  } catch (error) {
    console.error('Error creating mosque:', error)
    return NextResponse.json(
      { error: 'Failed to create mosque' },
      { status: 500 }
    )
  }
}
