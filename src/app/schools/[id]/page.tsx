import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Train, Star, ArrowRight } from 'lucide-react'
import { calculateCommuteScore } from '@/utils/commute-calculator'
import SchoolMapWrapper from '@/components/Map/SchoolMapWrapper'

// 型定義を修正
interface Props {
  params: Promise<{ id: string }>; // Promise型に修正
}

export default async function SchoolDetailPage({ params }: Props) {
  const { id } = await params; // await を追加
  
  // 学校の詳細情報を取得（schoolStationsとstationのリレーション含む）
  const school = await prisma.school.findUnique({
    where: { id: id },
    include: {
      schoolStations: {
        include: {
          station: true
        },
        orderBy: [
          { isPrimary: 'desc' },
          { walkingTime: 'asc' }
        ]
      }
    }
  })

  if (!school) {
    notFound()
  }

  // 地図用のマーカーデータを準備
  const mapMarkers = [
    // 学校マーカー
    {
      id: school.id,
      lat: school.latitude || 35.6812,
      lng: school.longitude || 139.7671,
      title: school.name,
      type: 'school' as const,
      description: school.address,
      isPrimary: true
    },
    // 最寄り駅マーカー
    ...school.schoolStations.map((schoolStation) => ({
      id: schoolStation.station.id,
      lat: schoolStation.station.latitude,
      lng: schoolStation.station.longitude,
      title: schoolStation.station.name,
      type: 'station' as const,
      description: `徒歩${schoolStation.walkingTime}分 (${schoolStation.distance}km)`,
      isPrimary: schoolStation.isPrimary
    }))
  ]

  // 徒歩ルート用のデータを準備
  const walkingRoutes = school.schoolStations
    .filter(ss => school.latitude && school.longitude)
    .map((schoolStation) => ({
      coordinates: [
        [school.latitude!, school.longitude!],
        [schoolStation.station.latitude, schoolStation.station.longitude]
      ] as [number, number][],
      type: 'walk' as const,
      lineName: `${school.name} ↔ ${schoolStation.station.name} (徒歩${schoolStation.walkingTime}分)`,
      color: schoolStation.isPrimary ? '#000000' : '#6B7280',
      dashArray: '5, 5'
    }))

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <section className="pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          {/* パンくずナビ */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-black hover:text-gray-600 transition-colors font-medium">
                ホーム
              </Link>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Link href="/schools" className="text-black hover:text-gray-600 transition-colors font-medium">
                学校一覧
              </Link>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{school.name}</span>
            </div>
          </nav>

          {/* 学校基本情報 */}
          <div className="bg-white rounded-lg border-2 border-gray-100 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-black mb-6">
                {school.name}
              </h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-black mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-black mb-1">所在地</div>
                    <div className="text-gray-600">{school.prefecture}</div>
                    <div className="text-gray-600">{school.address}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-black mb-3 flex items-center">
                    <Train className="w-5 h-5 mr-2 text-black" />
                    アクセス情報
                  </h3>
                  <div className="text-sm text-gray-600">
                    最寄り駅: {school.schoolStations.length}駅
                    {school.schoolStations.length > 0 && (
                      <div className="mt-2">
                        主要駅: {school.schoolStations.find(ss => ss.isPrimary)?.station.name || '未設定'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {/* 地図セクション */}
          <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-2 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-black" />
                位置・アクセス
              </h2>
              <p className="text-gray-600">学校の位置と最寄り駅への経路</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <SchoolMapWrapper
                  markers={mapMarkers}
                  routes={walkingRoutes}
                  height="400px"
                  className="rounded-lg border border-gray-200"
                />
              </div>

              {/* 地図凡例 */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">学校</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-black rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">主要最寄り駅</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">その他の最寄り駅</span>
                </div>
              </div>
            </div>
          </div>

          {/* 最寄り駅情報 */}
          <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-2 flex items-center">
                <Train className="w-6 h-6 mr-3 text-black" />
                最寄り駅・通学情報
              </h2>
              <p className="text-gray-600">各駅からの徒歩時間と通いやすさスコア</p>
            </div>

            <div className="p-6">
              {school.schoolStations.length > 0 ? (
                <div className="space-y-4">
                  {school.schoolStations.map((schoolStation) => {
                    const commuteScore = calculateCommuteScore(
                      schoolStation.walkingTime,
                      30, // 仮の電車時間
                      1,  // 仮の乗り換え回数
                      8   // 仮の頻度
                    )

                    return (
                      <div
                        key={schoolStation.id}
                        className={`group bg-white p-6 rounded-lg border-2 transition-colors ${
                          schoolStation.isPrimary
                            ? 'border-black hover:bg-gray-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {/* 主要駅バッジ */}
                        {schoolStation.isPrimary && (
                          <div className="flex justify-end mb-4">
                            <span className="px-3 py-1 bg-black text-white rounded-lg text-xs font-medium">
                              主要駅
                            </span>
                          </div>
                        )}

                        {/* 駅名 */}
                        <div className="flex items-center mb-6">
                          <Train className={`w-5 h-5 mr-3 ${schoolStation.isPrimary ? 'text-black' : 'text-gray-600'}`} />
                          <h3 className="text-xl font-bold text-black">
                            {schoolStation.station.name}
                          </h3>
                        </div>

                        {/* 詳細情報 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">徒歩時間:</span>
                            <span className="ml-2 font-semibold text-black">{schoolStation.walkingTime}分</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">距離:</span>
                            <span className="ml-2 font-semibold text-black">{schoolStation.distance}km</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-black mr-2" />
                            <span className="text-sm text-gray-600">通いやすさスコア:</span>
                            <span className={`ml-2 font-bold ${
                              commuteScore >= 80 ? 'text-black' :
                              commuteScore >= 60 ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {commuteScore}/100
                            </span>
                          </div>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex justify-center">
                          <Link
                            href={`/simulate?school=${school.id}&station=${schoolStation.station.id}`}
                            className={`group/btn px-8 py-3 rounded-lg font-medium transition-colors ${
                              schoolStation.isPrimary
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-100 text-black hover:bg-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <span>ルート検索</span>
                              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Train className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">最寄り駅情報なし</h3>
                  <p className="text-gray-600">この学校の最寄り駅情報はまだ登録されていません。</p>
                </div>
              )}
            </div>
          </div>

          {/* 通学シミュレーション */}
          <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-2 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-black" />
                通学シミュレーション
              </h2>
              <p className="text-gray-600">
                あなたの最寄り駅から{school.name}への通学ルートをシミュレーションできます。
              </p>
            </div>

            <div className="p-8">
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center space-x-8 p-6 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">{school.schoolStations.length}</div>
                      <div className="text-sm text-gray-600">アクセス可能駅</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">
                        {school.schoolStations.length > 0 
                          ? Math.min(...school.schoolStations.map(ss => ss.walkingTime))
                          : 0
                        }分
                      </div>
                      <div className="text-sm text-gray-600">最短徒歩時間</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link
                    href={`/simulate?school=${school.id}`}
                    className="inline-block px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold text-lg"
                  >
                    <div className="flex items-center">
                      <Clock className="w-6 h-6 mr-3" />
                      詳細シミュレーションを開始
                    </div>
                  </Link>
                  
                  <div className="text-sm text-gray-500">
                    運行本数・乗り換え・待ち時間を考慮した詳細な通学ルートを表示します
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-2">その他のアクション</h2>
              <p className="text-gray-600">学校比較や一覧に戻る</p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Link
                  href="/schools"
                  className="group p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-black mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-black mb-2">学校一覧に戻る</h3>
                    <p className="text-sm text-gray-600">他の学校も探してみる</p>
                  </div>
                </Link>

                <Link
                  href={`/compare?school=${school.id}`}
                  className="group p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-center">
                    <Star className="w-10 h-10 text-black mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-black mb-2">学校比較</h3>
                    <p className="text-sm text-gray-600">複数校で通いやすさを比較</p>
                  </div>
                </Link>

                <Link
                  href="/"
                  className="group p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-center">
                    <ArrowRight className="w-10 h-10 text-black mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-black mb-2">ホームに戻る</h3>
                    <p className="text-sm text-gray-600">最初から学校を探す</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}