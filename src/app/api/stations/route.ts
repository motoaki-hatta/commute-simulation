import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const stations = await prisma.station.findMany({
      select: {
        id: true,
        name: true,
        prefecture: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(stations)
  } catch (error) {
    console.error('Stations API error:', error)
    return NextResponse.json(
      { error: '駅データの取得に失敗しました' },
      { status: 500 }
    )
  }
}