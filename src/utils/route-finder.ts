import { prisma } from '@/lib/prisma'

export interface RouteSegment {
  departureStation: {
    id: string
    name: string
  }
  arrivalStation: {
    id: string
    name: string
  }
  line: {
    id: string
    name: string
    operator: string
    frequencyWeekday: number
  }
  travelTime: number
  distance: number
  fare: number
}

export interface CompleteRoute {
  segments: RouteSegment[]
  totalTime: number
  totalFare: number
  totalDistance: number
  transfers: number
  walkingTime: number
  trainTime: number
  waitingTime: number
  commuteScore: number
}

export interface RouteOptions {
  prioritize: 'time' | 'cost' | 'transfers' | 'comfort'
  timeOfDay: 'morning' | 'evening' | 'daytime'
  maxTransfers: number
  timeSlot?: string
  dayType?: 'weekday' | 'weekend' | 'holiday'
}

export class RouteFinder {
  /**
   * 最適なルートを複数検索する
   */
  static async findRoutes(
    fromStationId: string,
    toStationId: string,
    walkingTime: number,
    options: RouteOptions = {
      prioritize: 'comfort',
      timeOfDay: 'morning',
      maxTransfers: 2,
      timeSlot: '08:00-09:00',
      dayType: 'weekday'
    }
  ): Promise<CompleteRoute[]> {
    try {
      // 直通ルートを検索
      const directRoutes = await this.findDirectRoutes(fromStationId, toStationId)
      
      // 1回乗り換えルートを検索
      const oneTransferRoutes = await this.findOneTransferRoutes(fromStationId, toStationId)
      
      // 全ルートを結合
      const allRoutes = [...directRoutes, ...oneTransferRoutes]
      
      // 各ルートに徒歩時間と待ち時間を追加
      const completeRoutes = allRoutes.map(route => 
        this.completeRouteCalculation(route, walkingTime, options.timeOfDay)
      )
      
      // ルートを評価・ソート
      const rankedRoutes = completeRoutes
        .map(route => ({
          ...route,
          commuteScore: this.calculateAdvancedCommuteScore(route, options)
        }))
        .sort((a, b) => b.commuteScore - a.commuteScore)
      
      return rankedRoutes.slice(0, 3) // 上位3つを返す
      
    } catch (error) {
      console.error('Route finding error:', error)
      return []
    }
  }

  /**
   * 直通ルートを検索
   */
  private static async findDirectRoutes(
    fromStationId: string,
    toStationId: string
  ): Promise<RouteSegment[][]> {
    const directConnections = await prisma.stationConnection.findMany({
      where: {
        departureId: fromStationId,
        arrivalId: toStationId
      },
      include: {
        departureStation: true,
        arrivalStation: true,
        line: true
      }
    })

    const routes: RouteSegment[][] = []
    
    for (const conn of directConnections) {
      const route: RouteSegment = {
        departureStation: {
          id: conn.departureStation.id,
          name: conn.departureStation.name
        },
        arrivalStation: {
          id: conn.arrivalStation.id,
          name: conn.arrivalStation.name
        },
        line: {
          id: conn.line.id,
          name: conn.line.name,
          operator: conn.line.operator,
          frequencyWeekday: conn.line.frequencyWeekday
        },
        travelTime: conn.travelTime,
        distance: conn.distance,
        fare: conn.fare || 0
      }
      routes.push([route])
    }
    
    return routes
  }

  /**
   * 1回乗り換えルートを検索
   */
  private static async findOneTransferRoutes(
    fromStationId: string,
    toStationId: string
  ): Promise<RouteSegment[][]> {
    // 出発駅から到達可能な中継駅を取得
    const firstLeg = await prisma.stationConnection.findMany({
      where: {
        departureId: fromStationId
      },
      include: {
        departureStation: true,
        arrivalStation: true,
        line: true
      }
    })

    const routes: RouteSegment[][] = []

    for (const first of firstLeg) {
      // 中継駅から目的地への接続を検索
      const secondLeg = await prisma.stationConnection.findMany({
        where: {
          departureId: first.arrivalId,
          arrivalId: toStationId,
          // 同じ路線での折り返しを除外
          NOT: {
            lineId: first.lineId
          }
        },
        include: {
          departureStation: true,
          arrivalStation: true,
          line: true
        }
      })

      for (const second of secondLeg) {
        routes.push([
          {
            departureStation: {
              id: first.departureStation.id,
              name: first.departureStation.name
            },
            arrivalStation: {
              id: first.arrivalStation.id,
              name: first.arrivalStation.name
            },
            line: {
              id: first.line.id,
              name: first.line.name,
              operator: first.line.operator,
              frequencyWeekday: first.line.frequencyWeekday
            },
            travelTime: first.travelTime,
            distance: first.distance,
            fare: first.fare || 0
          },
          {
            departureStation: {
              id: second.departureStation.id,
              name: second.departureStation.name
            },
            arrivalStation: {
              id: second.arrivalStation.id,
              name: second.arrivalStation.name
            },
            line: {
              id: second.line.id,
              name: second.line.name,
              operator: second.line.operator,
              frequencyWeekday: second.line.frequencyWeekday
            },
            travelTime: second.travelTime,
            distance: second.distance,
            fare: second.fare || 0
          }
        ])
      }
    }

    return routes
  }

  /**
   * ルートの完全な計算（待ち時間、徒歩時間含む）
   */
  private static completeRouteCalculation(
    segments: RouteSegment[],
    walkingTime: number,
    timeOfDay: 'morning' | 'evening' | 'daytime'
  ): CompleteRoute {
    const trainTime = segments.reduce((sum, seg) => sum + seg.travelTime, 0)
    const totalFare = segments.reduce((sum, seg) => sum + seg.fare, 0)
    const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0)
    const transfers = Math.max(segments.length - 1, 0)

    // 待ち時間の計算（運行本数に基づく）
    let waitingTime = 0
    segments.forEach(segment => {
      const frequency = segment.line.frequencyWeekday
      const avgWaitTime = timeOfDay === 'morning' ? 
        Math.max(60 / frequency / 2, 1) : // ラッシュ時は待ち時間短縮
        60 / frequency / 2 // 平均待ち時間
      waitingTime += avgWaitTime
    })

    // 乗り換え時間（乗り換え1回につき3分と仮定）
    const transferTime = transfers * 3

    const totalTime = trainTime + walkingTime + waitingTime + transferTime

    return {
      segments,
      totalTime: Math.round(totalTime),
      totalFare,
      totalDistance: Math.round(totalDistance * 10) / 10,
      transfers,
      walkingTime,
      trainTime,
      waitingTime: Math.round(waitingTime),
      commuteScore: 0 // 後で計算
    }
  }

  /**
   * 高度な通いやすさスコア計算
   */
  private static calculateAdvancedCommuteScore(
    route: CompleteRoute,
    options: RouteOptions
  ): number {
    let score = 100

    // 基本的な時間ペナルティ
    const timeRatio = route.totalTime / 45 // 45分を基準
    score -= Math.max((timeRatio - 1) * 25, 0)

    // 乗り換え回数ペナルティ
    score -= route.transfers * 8

    // 徒歩時間ペナルティ
    const walkingPenalty = Math.max((route.walkingTime - 8) * 0.8, 0)
    score -= walkingPenalty

    // 運行本数ボーナス（各路線の平均）
    const avgFrequency = route.segments.reduce((sum, seg) => 
      sum + seg.line.frequencyWeekday, 0) / route.segments.length
    const frequencyBonus = Math.min((avgFrequency - 8) * 1.5, 15)
    score += frequencyBonus

    // 待ち時間ペナルティ
    score -= route.waitingTime * 0.5

    // 運賃ペナルティ（軽微）
    const fareRatio = route.totalFare / 300 // 300円を基準
    score -= Math.max((fareRatio - 1) * 5, 0)

    // 優先順位による調整
    switch (options.prioritize) {
      case 'time':
        score -= (route.totalTime - 30) * 0.8
        break
      case 'cost':
        score -= (route.totalFare - 200) * 0.1
        break
      case 'transfers':
        score -= route.transfers * 15
        break
      case 'comfort':
        // バランス型（デフォルト計算）
        break
    }

    return Math.max(Math.min(Math.round(score), 100), 0)
  }
}