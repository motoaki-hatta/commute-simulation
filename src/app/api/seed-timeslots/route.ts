import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 既にデータが存在するかチェック
    const existingTimeSlots = await prisma.timeSlotData.count()
    if (existingTimeSlots > 0) {
      return NextResponse.json({ 
        message: 'Time slot data already seeded', 
        timeSlots: existingTimeSlots 
      })
    }

    // 全ての駅間接続を取得
    const connections = await prisma.stationConnection.findMany({
      include: {
        line: true,
        departureStation: true,
        arrivalStation: true
      }
    })

    // 時間帯別データの定義
    const timeSlots = [
      {
        slot: '06:00-07:00',
        crowdLevel: 2,
        frequency: 8,
        averageDelay: 1,
        reliabilityScore: 0.95,
        comfortScore: 0.8
      },
      {
        slot: '07:00-08:00',
        crowdLevel: 4,
        frequency: 12,
        averageDelay: 3,
        reliabilityScore: 0.85,
        comfortScore: 0.4
      },
      {
        slot: '08:00-09:00',
        crowdLevel: 5,
        frequency: 15,
        averageDelay: 5,
        reliabilityScore: 0.75,
        comfortScore: 0.2
      },
      {
        slot: '09:00-10:00',
        crowdLevel: 3,
        frequency: 10,
        averageDelay: 2,
        reliabilityScore: 0.90,
        comfortScore: 0.6
      },
      {
        slot: '10:00-11:00',
        crowdLevel: 2,
        frequency: 8,
        averageDelay: 1,
        reliabilityScore: 0.95,
        comfortScore: 0.8
      },
      {
        slot: '17:00-18:00',
        crowdLevel: 4,
        frequency: 12,
        averageDelay: 3,
        reliabilityScore: 0.85,
        comfortScore: 0.4
      },
      {
        slot: '18:00-19:00',
        crowdLevel: 5,
        frequency: 15,
        averageDelay: 4,
        reliabilityScore: 0.80,
        comfortScore: 0.3
      },
      {
        slot: '19:00-20:00',
        crowdLevel: 4,
        frequency: 12,
        averageDelay: 2,
        reliabilityScore: 0.88,
        comfortScore: 0.5
      }
    ]

    // 路線別の特性調整
    const getLineAdjustment = (lineName: string) => {
      switch (lineName) {
        case 'JR山手線':
          return { crowdMultiplier: 1.2, frequencyBonus: 3, delayMultiplier: 1.1 }
        case 'JR中央線快速':
          return { crowdMultiplier: 1.1, frequencyBonus: 2, delayMultiplier: 1.3 }
        case '東京メトロ丸ノ内線':
          return { crowdMultiplier: 1.0, frequencyBonus: 1, delayMultiplier: 0.8 }
        case '東京メトロ銀座線':
          return { crowdMultiplier: 0.9, frequencyBonus: 1, delayMultiplier: 0.7 }
        case '京王線':
          return { crowdMultiplier: 0.8, frequencyBonus: 0, delayMultiplier: 0.9 }
        default:
          return { crowdMultiplier: 1.0, frequencyBonus: 0, delayMultiplier: 1.0 }
      }
    }

    // 時間帯別データを生成
    const timeSlotDataToCreate = []

    for (const connection of connections) {
      const lineAdjustment = getLineAdjustment(connection.line.name)
      
      for (const timeSlot of timeSlots) {
        // 平日データ
        const adjustedCrowdLevel = Math.min(5, Math.max(1, 
          Math.round(timeSlot.crowdLevel * lineAdjustment.crowdMultiplier)
        ))
        const adjustedFrequency = Math.max(1, 
          timeSlot.frequency + lineAdjustment.frequencyBonus
        )
        const adjustedDelay = Math.max(0, 
          Math.round(timeSlot.averageDelay * lineAdjustment.delayMultiplier)
        )

        timeSlotDataToCreate.push({
          connectionId: connection.id,
          timeSlot: timeSlot.slot,
          dayType: 'weekday',
          crowdLevel: adjustedCrowdLevel,
          frequency: adjustedFrequency,
          averageDelay: adjustedDelay,
          reliabilityScore: Math.max(0.5, timeSlot.reliabilityScore - (adjustedDelay * 0.02)),
          comfortScore: Math.max(0.1, timeSlot.comfortScore - ((adjustedCrowdLevel - 1) * 0.1))
        })

        // 週末データ（平日より空いている）
        timeSlotDataToCreate.push({
          connectionId: connection.id,
          timeSlot: timeSlot.slot,
          dayType: 'weekend',
          crowdLevel: Math.max(1, adjustedCrowdLevel - 2),
          frequency: Math.max(1, Math.round(adjustedFrequency * 0.7)),
          averageDelay: Math.max(0, Math.round(adjustedDelay * 0.5)),
          reliabilityScore: Math.min(1.0, timeSlot.reliabilityScore + 0.1),
          comfortScore: Math.min(1.0, timeSlot.comfortScore + 0.3)
        })
      }
    }

    // データベースに投入
    await prisma.timeSlotData.createMany({
      data: timeSlotDataToCreate
    })

    return NextResponse.json({ 
      success: true, 
      message: '時間帯別データの投入が完了しました',
      data: {
        connections: connections.length,
        timeSlots: timeSlots.length,
        totalRecords: timeSlotDataToCreate.length,
        coverage: '平日・週末の8時間帯をカバー'
      }
    })

  } catch (error) {
    console.error('TimeSlot seed error:', error)
    return NextResponse.json(
      { success: false, error: '時間帯別データ投入中にエラーが発生しました' }, 
      { status: 500 }
    )
  }
} 