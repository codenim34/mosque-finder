import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Mosque from '@/lib/models/mosque'
import MosqueFeedback from '@/lib/models/mosque-feedback'
import { normalizeOptionalText } from '@/lib/mosque-update-utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params

    const feedback = await MosqueFeedback.find({ mosqueId: id })
      .sort({ createdAt: -1 })
      .limit(20)

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error fetching mosque feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
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

    const mosque = await Mosque.findById(id)
    if (!mosque) {
      return NextResponse.json({ error: 'Mosque not found' }, { status: 404 })
    }

    const type =
      body?.type === 'suggestion' || body?.type === 'problem' || body?.type === 'feedback'
        ? body.type
        : 'feedback'

    const message = normalizeOptionalText(body?.message)
    if (!message) {
      return NextResponse.json(
        { error: 'Please provide feedback message.' },
        { status: 400 }
      )
    }

    const anonymous = body?.anonymous !== false
    const name = normalizeOptionalText(body?.name)
    const contact = normalizeOptionalText(body?.contact)

    const feedback = await MosqueFeedback.create({
      mosqueId: id,
      type,
      message,
      anonymous,
      name: anonymous ? undefined : name ?? undefined,
      contact: anonymous ? undefined : contact ?? undefined,
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error('Error creating mosque feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
