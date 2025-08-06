import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        prefecture: true,
        address: true,
        schoolStations: {
          select: {
            id: true,
            walkingTime: true,
            distance: true,
            isPrimary: true,
            station: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            isPrimary: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(schools)
  } catch (error) {
    console.error('Schools detailed API error:', error)
    return NextResponse.json(
      { error: '詳細学校データの取得に失敗しました' },
      { status: 500 }
    )
  }
} 