import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 既にデータが存在するかチェック
    const existingSchools = await prisma.school.count()
    if (existingSchools > 0) {
      return NextResponse.json({ 
        message: 'Database already seeded', 
        schools: existingSchools 
      })
    }

    // 以下、既存のseed処理...
    // deleteMany()を削除し、createMany()のみ実行

    // 路線データを作成
    const lines = await prisma.line.createMany({
      data: [
        {
          name: 'JR山手線',
          operator: 'JR東日本',
          lineColor: '#9ACD32',
          frequencyWeekday: 24, // 2-3分間隔
          frequencyWeekend: 20
        },
        {
          name: 'JR中央線快速',
          operator: 'JR東日本', 
          lineColor: '#F15A22',
          frequencyWeekday: 12, // 5分間隔
          frequencyWeekend: 10
        },
        {
          name: '東京メトロ丸ノ内線',
          operator: '東京メトロ',
          lineColor: '#F62E36',
          frequencyWeekday: 18, // 3-4分間隔
          frequencyWeekend: 15
        },
        {
          name: '東京メトロ銀座線',
          operator: '東京メトロ',
          lineColor: '#F39700',
          frequencyWeekday: 20, // 3分間隔
          frequencyWeekend: 18
        },
        {
          name: '京王線',
          operator: '京王電鉄',
          lineColor: '#E73895',
          frequencyWeekday: 15, // 4分間隔
          frequencyWeekend: 12
        }
      ]
    })

    // 路線IDを取得
    const lineData = await prisma.line.findMany()
    const yamanoteLine = lineData.find(l => l.name === 'JR山手線')!
    const chuoLine = lineData.find(l => l.name === 'JR中央線快速')!
    const marunouchiLine = lineData.find(l => l.name === '東京メトロ丸ノ内線')!
    const ginzaLine = lineData.find(l => l.name === '東京メトロ銀座線')!
    const keioLine = lineData.find(l => l.name === '京王線')!

    // 駅データを作成
    const stations = await prisma.station.createMany({
      data: [
        // JR山手線の駅
        { name: '新宿駅', prefecture: '東京都', latitude: 35.6896, longitude: 139.7006 },
        { name: '渋谷駅', prefecture: '東京都', latitude: 35.6580, longitude: 139.7016 },
        { name: '池袋駅', prefecture: '東京都', latitude: 35.7295, longitude: 139.7109 },
        { name: '東京駅', prefecture: '東京都', latitude: 35.6812, longitude: 139.7671 },
        { name: '品川駅', prefecture: '東京都', latitude: 35.6284, longitude: 139.7387 },
        { name: '上野駅', prefecture: '東京都', latitude: 35.7140, longitude: 139.7774 },
        
        // 中央線の駅
        { name: '四ツ谷駅', prefecture: '東京都', latitude: 35.6851, longitude: 139.7307 },
        { name: '市ヶ谷駅', prefecture: '東京都', latitude: 35.6938, longitude: 139.7253 },
        { name: '飯田橋駅', prefecture: '東京都', latitude: 35.7026, longitude: 139.7444 },
        { name: '水道橋駅', prefecture: '東京都', latitude: 35.7018, longitude: 139.7528 },
        { name: '御茶ノ水駅', prefecture: '東京都', latitude: 35.6993, longitude: 139.7648 },
        
        // メトロ駅
        { name: '赤坂見附駅', prefecture: '東京都', latitude: 35.6731, longitude: 139.7371 },
        { name: '表参道駅', prefecture: '東京都', latitude: 35.6657, longitude: 139.7103 },
        { name: '銀座駅', prefecture: '東京都', latitude: 35.6719, longitude: 139.7648 },
        
        // 京王線
        { name: '明大前駅', prefecture: '東京都', latitude: 35.6563, longitude: 139.6368 },
        { name: '下高井戸駅', prefecture: '東京都', latitude: 35.6518, longitude: 139.6309 }
      ]
    })

    // 駅IDを取得
    const stationData = await prisma.station.findMany()
    const shinjukuStation = stationData.find(s => s.name === '新宿駅')!
    const shibuyaStation = stationData.find(s => s.name === '渋谷駅')!
    const ikebukuroStation = stationData.find(s => s.name === '池袋駅')!
    const tokyoStation = stationData.find(s => s.name === '東京駅')!
    const yotsuya = stationData.find(s => s.name === '四ツ谷駅')!
    const iidabashi = stationData.find(s => s.name === '飯田橋駅')!
    const suidobashi = stationData.find(s => s.name === '水道橋駅')!
    const akasakamitsuke = stationData.find(s => s.name === '赤坂見附駅')!
    const meijimae = stationData.find(s => s.name === '明大前駅')!
    const ochanomizu = stationData.find(s => s.name === '御茶ノ水駅')!

    // 駅-路線の関係を作成
    await prisma.stationLine.createMany({
      data: [
        // 山手線
        { stationId: shinjukuStation.id, lineId: yamanoteLine.id, order: 1 },
        { stationId: shibuyaStation.id, lineId: yamanoteLine.id, order: 2 },
        { stationId: ikebukuroStation.id, lineId: yamanoteLine.id, order: 3 },
        { stationId: tokyoStation.id, lineId: yamanoteLine.id, order: 4 },
        
        // 中央線
        { stationId: shinjukuStation.id, lineId: chuoLine.id, order: 1 },
        { stationId: yotsuya.id, lineId: chuoLine.id, order: 2 },
        { stationId: iidabashi.id, lineId: chuoLine.id, order: 3 },
        { stationId: suidobashi.id, lineId: chuoLine.id, order: 4 },
        { stationId: ochanomizu.id, lineId: chuoLine.id, order: 5 },
        
        // 丸ノ内線
        { stationId: ikebukuroStation.id, lineId: marunouchiLine.id, order: 1 },
        { stationId: iidabashi.id, lineId: marunouchiLine.id, order: 2 },
        { stationId: ochanomizu.id, lineId: marunouchiLine.id, order: 3 },
        { stationId: akasakamitsuke.id, lineId: marunouchiLine.id, order: 4 },
        
        // 京王線
        { stationId: shinjukuStation.id, lineId: keioLine.id, order: 1 },
        { stationId: meijimae.id, lineId: keioLine.id, order: 2 }
      ]
    })

    // 学校データを作成
    const schools = await prisma.school.createMany({
      data: [
        {
          name: '早稲田大学',
          prefecture: '東京都',
          address: '新宿区戸塚町1-104',
          latitude: 35.7090,
          longitude: 139.7197
        },
        {
          name: '慶應義塾大学（三田キャンパス）',
          prefecture: '東京都', 
          address: '港区三田2-15-45',
          latitude: 35.6478,
          longitude: 139.7414
        },
        {
          name: '明治大学（駿河台キャンパス）',
          prefecture: '東京都',
          address: '千代田区神田駿河台1-1',
          latitude: 35.6993,
          longitude: 139.7607  
        },
        {
          name: '法政大学（市ヶ谷キャンパス）',
          prefecture: '東京都',
          address: '千代田区富士見2-17-1',
          latitude: 35.6957,
          longitude: 139.7516
        },
        {
          name: '上智大学',
          prefecture: '東京都',
          address: '千代田区紀尾井町7-1',
          latitude: 35.6832,
          longitude: 139.7370
        }
      ]
    })

    // 学校IDを取得
    const schoolData = await prisma.school.findMany()
    const waseda = schoolData.find(s => s.name === '早稲田大学')!
    const keio = schoolData.find(s => s.name === '慶應義塾大学（三田キャンパス）')!
    const meiji = schoolData.find(s => s.name === '明治大学（駿河台キャンパス）')!
    const hosei = schoolData.find(s => s.name === '法政大学（市ヶ谷キャンパス）')!
    const sophia = schoolData.find(s => s.name === '上智大学')!

    // 学校-駅の関係を作成
    await prisma.schoolStation.createMany({
      data: [
        // 早稲田大学
        { schoolId: waseda.id, stationId: iidabashi.id, walkingTime: 15, distance: 1.2, isPrimary: true },
        
        // 慶應義塾大学（三田）
        { schoolId: keio.id, stationId: akasakamitsuke.id, walkingTime: 7, distance: 0.6, isPrimary: true },
        
        // 明治大学（駿河台）
        { schoolId: meiji.id, stationId: ochanomizu.id, walkingTime: 3, distance: 0.3, isPrimary: true },
        { schoolId: meiji.id, stationId: suidobashi.id, walkingTime: 5, distance: 0.4, isPrimary: false },
        
        // 法政大学（市ヶ谷）
        { schoolId: hosei.id, stationId: iidabashi.id, walkingTime: 8, distance: 0.7, isPrimary: true },
        
        // 上智大学
        { schoolId: sophia.id, stationId: yotsuya.id, walkingTime: 5, distance: 0.4, isPrimary: true },
        { schoolId: sophia.id, stationId: akasakamitsuke.id, walkingTime: 12, distance: 1.0, isPrimary: false }
      ]
    })

    return NextResponse.json({ 
      success: true, 
      message: 'サンプルデータの投入が完了しました',
      data: {
        schools: 5,
        stations: 15,
        lines: 5
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: 'データ投入中にエラーが発生しました' }, 
      { status: 500 }
    )
  }
}