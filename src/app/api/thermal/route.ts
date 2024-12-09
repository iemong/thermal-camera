export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const clients = new Set<WritableStreamDefaultWriter>()


export async function GET() {
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  clients.add(writer)

  const cleanup = () => {
    clients.delete(writer)
  }

  stream.readable.pipeTo(new WritableStream()).catch(() => cleanup())

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function sendToAllClients(data: unknown) {
  const encoder = new TextEncoder()
  const message = `data: ${JSON.stringify(data)}\n\n`

  clients.forEach((client) => {
    try {
      client.write(encoder.encode(message))
    } catch (e) {
      console.error('送信エラー:', e)
    }
  })
}

export async function POST(request: Request) {
  try {
    const data: { thermal_value: number[] } = await request.json()

    console.log(data)
    if (!Array.isArray(data['thermal_value'])) {
      return NextResponse.json({
        message: 'thermal_data is not an array'
      }, { status: 400 })
    }

    await sendToAllClients(data['thermal_value'])

    return NextResponse.json(data['thermal_value'])
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json({
      message: 'Internal Server Error'
    }, { status: 500 })
  }
} 
