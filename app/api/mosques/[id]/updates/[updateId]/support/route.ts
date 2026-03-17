import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  await params
  return NextResponse.json(
    { error: 'Update suggestions are applied instantly. Support is no longer required.' },
    { status: 410 }
  )
}
