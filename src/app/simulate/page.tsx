'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Clock, Train, Star, ArrowRight, Loader2, Route, Zap, Target } from 'lucide-react'

interface School {
  id: string
  name: string
  prefecture: string
  address: string
}

interface Station {
  id: string
  name: string
  prefecture: string
}

interface RouteResult {
  school: {
    id: string
    name: string
  }
  fromStation: {
    id: string
    name: string
  }
  timeSlot: string
  dayType: string
  routes: Array<{
    totalTime: number
    walkingTime: number
    trainTime: number
    waitingTime: number
    transfers: number
    fare: number
    commuteScore: number
    crowdLevel?: number
    reliabilityScore?: number
    comfortScore?: number
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
  }>
}

function SimulatePageContent() {
  const searchParams = useSearchParams()
  const [schools, setSchools] = useState<School[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [selectedSchool, setSelectedSchool] = useState<string>('')
  const [selectedFromStation, setSelectedFromStation] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('08:00-09:00')
  const [selectedDayType, setSelectedDayType] = useState<string>('weekday')
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [result, setResult] = useState<RouteResult | null>(null)

  // URLパラメータから初期値を設定
  useEffect(() => {
    const schoolParam = searchParams.get('school')
    const stationParam = searchParams.get('station')
    
    if (schoolParam) {
      setSelectedSchool(schoolParam)
    }
    if (stationParam) {
      setSelectedFromStation(stationParam)
    }
  }, [searchParams])

  // データ取得関数
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [schoolsRes, stationsRes] = await Promise.all([
        fetch('/api/schools'),
        fetch('/api/stations')
      ])

      if (schoolsRes.ok && stationsRes.ok) {
        const schoolsData = await schoolsRes.json()
        const stationsData = await stationsRes.json()
        setSchools(schoolsData)
        setStations(stationsData)
      } else {
        console.error('データの取得に失敗しました')
        alert('データの取得に失敗しました')
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
      alert('データ取得エラーが発生しました')
    } finally {
      setDataLoading(false)
    }
  }

  const handleSimulate = async () => {
    if (!selectedSchool || !selectedFromStation) {
      alert('学校と出発駅を選択してください')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: selectedSchool,
          fromStationId: selectedFromStation,
          timeSlot: selectedTimeSlot,
          dayType: selectedDayType
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        console.error('シミュレーションに失敗しました')
        alert('シミュレーションに失敗しました')
      }
    } catch (error) {
      console.error('シミュレーションエラー:', error)
      alert('シミュレーションエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'walk':
        return <MapPin className="w-5 h-5 text-black" />
      case 'train':
        return <Train className="w-5 h-5 text-black" />
      case 'transfer':
        return <ArrowRight className="w-5 h-5 text-black" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const selectedSchoolData = schools.find(school => school.id === selectedSchool)
  const selectedStationData = stations.find(station => station.id === selectedFromStation)

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-black mb-2">シミュレーションを準備中</h2>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <section className="pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-black mb-6">
              通学シミュレーション
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              あなたの通学ルートを詳細にシミュレーション。<br/>
              <span className="font-bold text-black">最適なルート</span>を見つけて理想の学校生活を
            </p>

            {/* 機能説明カード */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-6">
                <Route className="w-8 h-8 text-black mx-auto mb-3" />
                <h3 className="font-bold text-black mb-2">詳細ルート</h3>
                <p className="text-sm text-gray-600">乗り換えも含めた詳細な経路</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <Zap className="w-8 h-8 text-black mx-auto mb-3" />
                <h3 className="font-bold text-black mb-2">リアルタイム計算</h3>
                <p className="text-sm text-gray-600">運行頻度を考慮した実用的な時間</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <Target className="w-8 h-8 text-black mx-auto mb-3" />
                <h3 className="font-bold text-black mb-2">通いやすさスコア</h3>
                <p className="text-sm text-gray-600">総合評価で一目で判断</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 検索フォーム */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg border-2 border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">ルートを検索</h2>
              <p className="text-gray-600">学校と出発駅を選択してシミュレーションを開始</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 出発駅選択 */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-lg font-semibold text-black mb-3 block">出発駅</span>
                  <select
                    value={selectedFromStation}
                    onChange={(e) => setSelectedFromStation(e.target.value)}
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none"
                  >
                    <option value="">出発駅を選択してください</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name} ({station.prefecture})
                      </option>
                    ))}
                  </select>
                </label>
                {selectedStationData && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-black mr-2" />
                      <div>
                        <div className="font-semibold text-black">{selectedStationData.name}</div>
                        <div className="text-sm text-gray-600">{selectedStationData.prefecture}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 学校選択 */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-lg font-semibold text-black mb-3 block">目的地（学校）</span>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none"
                  >
                    <option value="">学校を選択してください</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedSchoolData && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-black mr-2" />
                      <div>
                        <div className="font-semibold text-black">{selectedSchoolData.name}</div>
                        <div className="text-sm text-gray-600">{selectedSchoolData.prefecture}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 時間帯・曜日選択 */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-100">
              <h3 className="text-lg font-bold text-black mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                通学時間帯を選択
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* 時間帯選択 */}
                <div>
                  <label className="block">
                    <span className="text-base font-semibold text-black mb-2 block">出発時間帯</span>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="06:00-07:00">06:00-07:00 (早朝)</option>
                      <option value="07:00-08:00">07:00-08:00 (通勤ラッシュ前)</option>
                      <option value="08:00-09:00">08:00-09:00 (通勤ラッシュ)</option>
                      <option value="09:00-10:00">09:00-10:00 (通勤ラッシュ後)</option>
                      <option value="10:00-11:00">10:00-11:00 (日中)</option>
                      <option value="17:00-18:00">17:00-18:00 (帰宅ラッシュ前)</option>
                      <option value="18:00-19:00">18:00-19:00 (帰宅ラッシュ)</option>
                      <option value="19:00-20:00">19:00-20:00 (帰宅ラッシュ後)</option>
                    </select>
                  </label>
                </div>

                {/* 曜日タイプ選択 */}
                <div>
                  <label className="block">
                    <span className="text-base font-semibold text-black mb-2 block">曜日タイプ</span>
                    <select
                      value={selectedDayType}
                      onChange={(e) => setSelectedDayType(e.target.value)}
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="weekday">平日</option>
                      <option value="weekend">週末・祝日</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* 時間帯情報の説明 */}
              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <Target className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">選択した時間帯の特徴</p>
                    <p className="text-blue-700">
                      {selectedTimeSlot === '08:00-09:00' && '最も混雑する通勤ラッシュ時間帯です。電車の遅延や混雑が予想されます。'}
                      {selectedTimeSlot === '07:00-08:00' && '通勤ラッシュ前の時間帯です。比較的快適に通学できます。'}
                      {selectedTimeSlot === '09:00-10:00' && '通勤ラッシュ後の時間帯です。混雑は落ち着いています。'}
                      {selectedTimeSlot === '06:00-07:00' && '早朝の時間帯です。電車は空いていますが、運行本数が少ない場合があります。'}
                      {selectedTimeSlot === '10:00-11:00' && '日中の時間帯です。最も快適に通学できます。'}
                      {selectedTimeSlot === '17:00-18:00' && '帰宅ラッシュ前の時間帯です。'}
                      {selectedTimeSlot === '18:00-19:00' && '帰宅ラッシュの時間帯です。混雑が予想されます。'}
                      {selectedTimeSlot === '19:00-20:00' && '帰宅ラッシュ後の時間帯です。'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* シミュレーション実行ボタン */}
            <div className="text-center mt-8">
              <button
                onClick={handleSimulate}
                disabled={!selectedSchool || !selectedFromStation || loading}
                className={`px-12 py-4 rounded-lg text-white text-lg font-bold transition-colors ${
                  !selectedSchool || !selectedFromStation || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    ルートを検索中...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Search className="w-6 h-6 mr-3" />
                    ルートを検索
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 結果表示 */}
      {result && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="space-y-8">
              {/* 基本情報 */}
              <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
                <div className="bg-black p-6 text-white">
                  <h2 className="text-2xl font-bold mb-4">シミュレーション結果</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-center">
                      <MapPin className="w-6 h-6 mr-3" />
                      <div>
                        <div className="text-gray-300 text-sm">出発駅</div>
                        <div className="text-xl font-bold">{result.fromStation.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-6 h-6 mr-3" />
                      <div>
                        <div className="text-gray-300 text-sm">目的地</div>
                        <div className="text-xl font-bold">{result.school.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-6 h-6 mr-3" />
                      <div>
                        <div className="text-gray-300 text-sm">時間帯・曜日</div>
                        <div className="text-lg font-bold">
                          {result.timeSlot} ({result.dayType === 'weekday' ? '平日' : '週末'})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center">
                    <p className="text-lg text-black mb-4">
                      {result.routes && result.routes.length > 0 
                        ? `${result.routes.length} 通りのルートが見つかりました`
                        : 'ルートが見つかりませんでした'
                      }
                    </p>
                    {result.routes && result.routes.length > 0 && (
                      <div className="text-sm text-gray-600">
                        通いやすさスコア順に表示しています
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ルート候補 */}
              {result.routes && result.routes.length > 0 ? (
                result.routes.map((route, index) => (
                  <div key={index} className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
                    {/* ルートヘッダー */}
                    <div className="bg-gray-50 p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-black">
                          ルート {index + 1} {index === 0 && <span className="ml-2 px-3 py-1 bg-black text-white rounded-lg text-sm font-medium">おすすめ</span>}
                        </h3>
                        <div className="flex items-center">
                          <Star className="w-6 h-6 text-black mr-2" />
                          <span className={`text-2xl font-bold ${
                            route.commuteScore >= 80 ? 'text-black' :
                            route.commuteScore >= 60 ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {route.commuteScore}
                          </span>
                          <span className="text-gray-500 text-lg ml-1">/100</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        目的駅: {route.targetStation.name}
                      </div>

                      {/* 時間・運賃情報 */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                          <Clock className="w-6 h-6 text-black mx-auto mb-2" />
                          <div className="text-xs text-gray-600 mb-1">総時間</div>
                          <div className="text-lg font-bold text-black">{route.totalTime}分</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                          <Train className="w-6 h-6 text-black mx-auto mb-2" />
                          <div className="text-xs text-gray-600 mb-1">乗車時間</div>
                          <div className="text-lg font-bold text-black">{route.trainTime}分</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                          <MapPin className="w-6 h-6 text-black mx-auto mb-2" />
                          <div className="text-xs text-gray-600 mb-1">徒歩時間</div>
                          <div className="text-lg font-bold text-black">{route.walkingTime}分</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                          <Clock className="w-6 h-6 text-black mx-auto mb-2" />
                          <div className="text-xs text-gray-600 mb-1">待ち時間</div>
                          <div className="text-lg font-bold text-black">{route.waitingTime || 0}分</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                          <div className="text-2xl font-bold text-black mb-2">¥</div>
                          <div className="text-xs text-gray-600 mb-1">運賃</div>
                          <div className="text-lg font-bold text-black">{route.fare}</div>
                        </div>
                      </div>

                      {/* 乗り換え情報 */}
                      {route.transfers > 0 && (
                        <div className="mt-4">
                          <div className="inline-flex items-center bg-gray-100 text-black text-sm px-4 py-2 rounded-lg">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            乗り換え {route.transfers}回
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ルート詳細 */}
                    <div className="p-6">
                      <h4 className="font-bold text-black mb-4 flex items-center">
                        <Route className="w-5 h-5 mr-2 text-black" />
                        ルート詳細
                      </h4>
                      {route.steps && route.steps.length > 0 ? (
                        <div className="space-y-3">
                          {route.steps.map((step, stepIndex) => (
                            <div 
                              key={stepIndex} 
                              className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="mr-4">
                                {getStepIcon(step.type)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-black">{step.description}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {step.line && (
                                    <span className="inline-block bg-gray-200 text-black px-2 py-1 rounded text-xs mr-2">
                                      {step.line}
                                    </span>
                                  )}
                                  {step.operator && (
                                    <span className="text-gray-500 text-xs">
                                      [{step.operator}]
                                    </span>
                                  )}
                                  {step.fare && step.fare > 0 && (
                                    <span className="ml-2 text-black text-xs font-medium">
                                      ¥{step.fare}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-black">{step.time}分</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-8">
                          <Route className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p>ルート詳細を読み込み中...</p>
                        </div>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-center space-x-4">
                        <Link
                          href={`/schools/${result.school.id}`}
                          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                          学校詳細を見る
                        </Link>
                        <Link
                          href={`/compare?station=${result.fromStation.id}`}
                          className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          他の学校と比較
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border-2 border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-4">ルートが見つかりませんでした</h3>
                  <p className="text-gray-600 mb-6">
                    選択された出発駅から学校への経路が見つかりませんでした。<br/>
                    別の駅を選択するか、学校の詳細ページで最寄り駅を確認してください。
                  </p>
                  <Link
                    href={`/schools/${result.school.id}`}
                    className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    学校詳細を見る
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default function SimulatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-black mb-2">シミュレーションを読み込み中</h2>
          <p className="text-gray-600">しばらくお待ちください...</p>
        </div>
      </div>
    }>
      <SimulatePageContent />
    </Suspense>
  )
}