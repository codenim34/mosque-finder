import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Mosque from '@/lib/models/mosque'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params
    const mosque = await Mosque.findById(id)

    if (!mosque) {
      return NextResponse.json({ error: 'Mosque not found' }, { status: 404 })
    }

    return NextResponse.json(mosque)
  } catch (error) {
    console.error('Error fetching mosque:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mosque' },
      { status: 500 }
    )
  }
}
