import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Mosque from '@/lib/models/mosque'
import { getClientIP } from '@/lib/mosque-update-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params
    const clientIP = getClientIP(request)

    const mosque = await Mosque.findById(id)

    if (!mosque) {
      return NextResponse.json({ error: 'Mosque not found' }, { status: 404 })
    }

    // Check if this IP has already verified
    if (mosque.verifiedIPs.includes(clientIP)) {
      return NextResponse.json(
        { error: 'You have already verified this mosque', alreadyVerified: true },
        { status: 400 }
      )
    }

    // Add verification
    mosque.verificationCount += 1
    mosque.verifiedIPs.push(clientIP)
    await mosque.save()

    return NextResponse.json({
      success: true,
      verificationCount: mosque.verificationCount,
    })
  } catch (error) {
    console.error('Error verifying mosque:', error)
    return NextResponse.json(
      { error: 'Failed to verify mosque' },
      { status: 500 }
    )
  }
}
