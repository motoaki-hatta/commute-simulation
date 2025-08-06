import type { CommuteRoute, SchoolWithStations } from '@/types'

/**
 * 通いやすさスコアを計算する関数
 * @param totalTime 総移動時間（分）
 * @param frequency 運行本数（1時間あたり）
 * @param transfers 乗り換え回数
 * @param walkingTime 徒歩時間（分）
 * @returns 通いやすさスコア（0-100）
 */
export function calculateCommuteScore(
  totalTime: number,
  frequency: number,
  transfers: number,
  walkingTime: number
): number {
  // 基本スコア（100から開始）
  let score = 100

  // 時間ペナルティ（60分を基準）
  const timeRatio = Math.max(totalTime / 60, 0.1)
  score -= (timeRatio - 1) * 30

  // 運行本数ボーナス（6本/時を基準）
  const frequencyBonus = Math.min((frequency - 6) * 2, 20)
  score += frequencyBonus

  // 乗り換えペナルティ
  score -= transfers * 10

  // 徒歩時間ペナルティ（10分を基準）
  const walkingPenalty = Math.max((walkingTime - 10) * 0.5, 0)
  score -= walkingPenalty

  // 0-100の範囲に調整
  return Math.max(Math.min(Math.round(score), 100), 0)
}

/**
 * 学校の通学ルート候補を生成する
 * @param school 学校情報
 * @param fromStationId 出発駅ID
 * @returns 通学ルート配列
 */
export function generateCommuteRoutes(
  school: SchoolWithStations,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _fromStationId: string
): CommuteRoute[] {
  // ここでは簡略版の実装
  // 実際の実装では、駅間接続データを使って最適なルートを計算
  return school.schoolStations.map((schoolStation) => {
    const totalTime = 45 // 仮の値
    const walkingTime = schoolStation.walkingTime
    const trainTime = totalTime - walkingTime
    const transfers = 1 // 仮の値
    const frequency = 8 // 仮の値

    return {
      id: `${school.id}-${schoolStation.station.id}`,
      school,
      totalTime,
      walkingTime,
      trainTime,
      transfers,
      frequency,
      commuteScore: calculateCommuteScore(totalTime, frequency, transfers, walkingTime),
      stations: [
        { station: schoolStation.station }
      ]
    }
  })
}