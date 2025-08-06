// Prismaから生成された型をインポート
// 注: 型は直接定義して使用する（Prismaクライアントから推論）

// 基本的なPrismaモデルの型定義（スキーマから推論）
interface School {
  id: string
  name: string
  prefecture: string
  address: string
  createdAt: Date
  updatedAt: Date
}

interface Station {
  id: string
  name: string
  prefecture: string
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
}

interface Line {
  id: string
  name: string
  operator: string
  color?: string | null
  createdAt: Date
  updatedAt: Date
}

interface SchoolStation {
  id: string
  schoolId: string
  stationId: string
  walkingTime: number
  distance: number
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

interface StationConnection {
  id: string
  fromStationId: string
  toStationId: string
  lineId: string
  travelTime: number
  distance: number
  fare: number
  createdAt: Date
  updatedAt: Date
}

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