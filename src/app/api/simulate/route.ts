import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { RouteFinder } from '@/utils/route-finder'

export async function POST(request: NextRequest) {
  try {
    const { schoolId, fromStationId, timeSlot = '08:00-09:00', dayType = 'weekday', options } = await request.json()

    if (!schoolId || !fromStationId) {
      return NextResponse.json(
        { error: 'schoolIdとfromStationIdが必要です' },
        { status: 400 }
      )
    }

    // 学校情報を取得
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        schoolStations: {
          include: {
            station: {
              include: {
                stationLines: {
                  include: {
                    line: true
                  }
                }
              }
            }
          },
          orderBy: {
            isPrimary: 'desc'
          }
        }
      }
    })

    if (!school) {
      return NextResponse.json(
        { error: '学校が見つかりません' },
        { status: 404 }
      )
    }

    // 出発駅情報を取得
    const fromStation = await prisma.station.findUnique({
      where: { id: fromStationId },
      include: {
        stationLines: {
          include: {
            line: true
          }
        }
      }
    })

    if (!fromStation) {
      return NextResponse.json(
        { error: '出発駅が見つかりません' },
        { status: 404 }
      )
    }

    // 各最寄り駅への最適ルートを検索
    const allRoutes = []

    for (const schoolStation of school.schoolStations) {
      const routes = await RouteFinder.findRoutes(
        fromStationId,
        schoolStation.stationId,
        schoolStation.walkingTime,
        options || {
          prioritize: 'comfort',
          timeOfDay: 'morning',
          maxTransfers: 2,
          timeSlot,
          dayType: dayType as 'weekday' | 'weekend' | 'holiday'
        }
      )

      // 各ルートにターゲット駅情報を追加
      const routesWithTarget = routes.map(route => ({
        ...route,
        targetStation: {
          id: schoolStation.station.id,
          name: schoolStation.station.name,
          isPrimary: schoolStation.isPrimary
        }
      }))

      allRoutes.push(...routesWithTarget)
    }

    // 全ルートを通いやすさスコア順にソート
    allRoutes.sort((a, b) => b.commuteScore - a.commuteScore)

    // 上位ルートを選択（最大3つ、異なる最寄り駅を優先）
    const selectedRoutes = []
    const usedStations = new Set()

    for (const route of allRoutes) {
      if (selectedRoutes.length >= 3) break
      
      // 既に使用した駅でない場合、または主要駅の場合は追加
      if (!usedStations.has(route.targetStation.id) || route.targetStation.isPrimary) {
        selectedRoutes.push(route)
        usedStations.add(route.targetStation.id)
      }
    }

    // レスポンス形式に変換
    const formattedRoutes = selectedRoutes.map(route => ({
      totalTime: route.totalTime,
      walkingTime: route.walkingTime,
      trainTime: route.trainTime,
      transfers: route.transfers,
      fare: route.totalFare,
      commuteScore: route.commuteScore,
      waitingTime: route.waitingTime,
      targetStation: route.targetStation,
      steps: generateDetailedSteps(route, school.name)
    }))

    const result = {
      school: {
        id: school.id,
        name: school.name,
        prefecture: school.prefecture,
        address: school.address
      },
      fromStation: {
        id: fromStation.id,
        name: fromStation.name,
        prefecture: fromStation.prefecture
      },
      timeSlot,
      dayType,
      routes: formattedRoutes
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Simulate API error:', error)
    return NextResponse.json(
      { error: 'シミュレーションに失敗しました' },
      { status: 500 }
    )
  }
}

// 詳細ステップを生成する関数
function generateDetailedSteps(route: {
  segments: Array<{
    departureStation: { name: string }
    arrivalStation: { name: string }
    line: { name: string; operator: string }
    travelTime: number
    fare: number
  }>
  walkingTime: number
}, schoolName: string) {
  const steps: Array<{
    type: 'walk' | 'train' | 'transfer'
    description: string
    time: number
    line?: string
    operator?: string
    fare?: number
  }> = []

  // 電車の区間を追加
  route.segments.forEach((segment, index: number) => {
    if (index > 0) {
      // 乗り換え案内を追加
      steps.push({
        type: 'transfer' as const,
        description: `${segment.departureStation.name}で乗り換え`,
        time: 3,
        line: `${route.segments[index-1].line.name} → ${segment.line.name}`
      })
    }

    steps.push({
      type: 'train' as const,
      description: `${segment.departureStation.name}から${segment.arrivalStation.name}`,
      time: segment.travelTime,
      line: segment.line.name,
      operator: segment.line.operator,
      fare: segment.fare
    })
  })

  // 最後に徒歩区間を追加
  if (route.walkingTime > 0) {
    const lastSegment = route.segments[route.segments.length - 1]
    steps.push({
      type: 'walk' as const,
      description: `${lastSegment.arrivalStation.name}から${schoolName}まで徒歩`,
      time: route.walkingTime
    })
  }

  return steps
}