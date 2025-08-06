import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RouteFinder } from '@/utils/route-finder'
import type { ComparisonRequest, ComparisonResult, SchoolComparisonData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: ComparisonRequest = await request.json()
    const { fromStationId, schoolIds } = body

    if (!fromStationId || !schoolIds || schoolIds.length === 0) {
      return NextResponse.json(
        { error: '出発駅と学校IDが必要です' },
        { status: 400 }
      )
    }

    // 出発駅情報を取得
    const fromStation = await prisma.station.findUnique({
      where: { id: fromStationId }
    })

    if (!fromStation) {
      return NextResponse.json(
        { error: '指定された出発駅が見つかりません' },
        { status: 404 }
      )
    }

    // 学校情報を取得
    const schools = await prisma.school.findMany({
      where: {
        id: { in: schoolIds }
      },
      include: {
        schoolStations: {
          include: {
            station: true
          }
        }
      }
    })

    if (schools.length === 0) {
      return NextResponse.json(
        { error: '指定された学校が見つかりません' },
        { status: 404 }
      )
    }

    // 各学校に対してルート計算を実行
    const comparisonData: SchoolComparisonData[] = []
    let totalTime = 0
    let totalScore = 0
    let validRoutes = 0

    for (const school of schools) {
      try {
        // 学校の最寄り駅リストを取得
        const nearestStationIds = school.schoolStations.map(
          schoolStation => schoolStation.station.id
        )

        if (nearestStationIds.length === 0) {
          comparisonData.push({
            school,
            bestRoute: null,
            error: '最寄り駅情報がありません'
          })
          continue
        }

        // 各最寄り駅への最適ルートを計算
        let bestRoute = null
        let bestScore = -1

        for (const targetStationId of nearestStationIds) {
          try {
            // 学校駅情報を取得（徒歩時間のため）
            const schoolStation = school.schoolStations.find(
              ss => ss.station.id === targetStationId
            )
            
            if (!schoolStation) continue

            const routes = await RouteFinder.findRoutes(
              fromStationId, 
              targetStationId, 
              schoolStation.walkingTime
            )
            
            if (routes.length > 0) {
              // 最もスコアの高いルートを選択
              const topRoute = routes[0]
              
              if (topRoute.commuteScore > bestScore) {
                bestScore = topRoute.commuteScore

                bestRoute = {
                  totalTime: topRoute.totalTime,
                  trainTime: topRoute.trainTime,
                  walkingTime: topRoute.walkingTime,
                  waitingTime: topRoute.waitingTime,
                  transfers: topRoute.transfers,
                  fare: topRoute.totalFare,
                  commuteScore: topRoute.commuteScore,
                  targetStation: {
                    id: schoolStation.station.id,
                    name: schoolStation.station.name
                  },
                  steps: topRoute.segments.map(segment => ({
                    type: 'train' as const,
                    description: `${segment.departureStation.name} → ${segment.arrivalStation.name}`,
                    time: segment.travelTime,
                    line: segment.line.name,
                    operator: segment.line.operator,
                    fare: segment.fare
                  }))
                }
              }
            }
          } catch (error) {
            console.error(`ルート計算エラー (${fromStationId} -> ${targetStationId}):`, error)
            continue
          }
        }

        comparisonData.push({
          school,
          bestRoute,
          error: bestRoute ? undefined : 'ルートが見つかりませんでした'
        })

        // 統計計算用
        if (bestRoute) {
          totalTime += bestRoute.totalTime
          totalScore += bestRoute.commuteScore
          validRoutes++
        }
      } catch (error) {
        console.error(`学校 ${school.id} の処理エラー:`, error)
        comparisonData.push({
          school,
          bestRoute: null,
          error: '処理中にエラーが発生しました'
        })
      }
    }

    // 比較結果の作成
    const result: ComparisonResult = {
      fromStation: {
        id: fromStation.id,
        name: fromStation.name
      },
      schools: comparisonData,
      summary: {
        totalSchools: schools.length,
        averageTime: validRoutes > 0 ? totalTime / validRoutes : 0,
        averageScore: validRoutes > 0 ? totalScore / validRoutes : 0
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('比較API エラー:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 