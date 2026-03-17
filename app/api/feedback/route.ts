import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import AppFeedback from '@/lib/models/app-feedback'
import { normalizeOptionalText } from '@/lib/mosque-update-utils'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

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
    const pagePath = normalizeOptionalText(body?.pagePath)

    const feedback = await AppFeedback.create({
      type,
      message,
      anonymous,
      name: anonymous ? undefined : name ?? undefined,
      contact: anonymous ? undefined : contact ?? undefined,
      pagePath: pagePath ?? undefined,
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error('Error creating app feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
