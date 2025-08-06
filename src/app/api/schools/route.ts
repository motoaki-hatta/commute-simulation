import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // seedで投入したデータベースから学校データを取得
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        prefecture: true,
        address: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(schools)
  } catch (error) {
    console.error('Schools API error:', error)
    return NextResponse.json(
      { error: '学校データの取得に失敗しました' },
      { status: 500 }
    )
  }
}