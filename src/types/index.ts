// Prismaから生成された型をインポート
import type { School, Station, Line, SchoolStation, StationConnection } from '@/generated/prisma'

// 時間帯別データの型定義
export interface TimeSlotInfo {
  timeSlot: string
  dayType: 'weekday' | 'weekend' | 'holiday'
  crowdLevel: number // 1-5
  frequency: number // 本数/時
  averageDelay: number // 分
  reliabilityScore: number // 0.0-1.0
  comfortScore: number // 0.0-1.0
}

// 通学計算用の型定義
export interface CommuteRoute {
  id: string
  school: School
  totalTime: number
  walkingTime: number
  trainTime: number
  transfers: number
  frequency: number
  commuteScore: number // 通いやすさスコア
  stations: Array<{
    station: Station
    line?: Line
    travelTime?: number
  }>
}

// 検索条件の型
export interface SearchParams {
  prefecture?: string
  maxCommuteTime?: number
  minFrequency?: number
  maxWalkingTime?: number
}

// 学校詳細情報（リレーション含む）
export interface SchoolWithStations extends School {
  schoolStations: Array<{
    station: Station
    walkingTime: number
    distance: number
    isPrimary: boolean
  }>
}

// 学校比較機能用の型定義
export interface SchoolComparisonData {
  school: School
  bestRoute: {
    totalTime: number
    trainTime: number
    walkingTime: number
    waitingTime?: number
    transfers: number
    fare: number
    commuteScore: number
    targetStation: {
      id: string
      name: string
    }
    steps: Array<{
      type: 'walk' | 'train' | 'transfer'
      description: string
      time: number
      line?: string
      operator?: string
      fare?: number
    }>
  } | null
  error?: string
}

export interface ComparisonRequest {
  fromStationId: string
  schoolIds: string[]
}

export interface ComparisonResult {
  fromStation: {
    id: string
    name: string
  }
  schools: SchoolComparisonData[]
  summary: {
    totalSchools: number
    averageTime: number
    averageScore: number
  }
}

// ソート条件の型
export type SortKey = 'name' | 'commuteScore' | 'totalTime' | 'fare' | 'transfers'
export type SortOrder = 'asc' | 'desc'

// エクスポート（再エクスポート）
export type { School, Station, Line, SchoolStation, StationConnection }