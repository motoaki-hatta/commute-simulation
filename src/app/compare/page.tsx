'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Clock, Train, Star, ArrowUpDown, CheckSquare, Square, Loader2, Users, BarChart3, Award, Zap } from 'lucide-react'
import type { School, Station, ComparisonResult, SchoolComparisonData, SortKey, SortOrder } from '@/types'

interface FilterState {
  prefecture: string
  searchTerm: string
}

function ComparePageContent() {
  const searchParams = useSearchParams()
  const [schools, setSchools] = useState<School[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [selectedFromStation, setSelectedFromStation] = useState<string>('')
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loadingSchools, setLoadingSchools] = useState(true)
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    prefecture: '',
    searchTerm: ''
  })
  const [sortKey, setSortKey] = useState<SortKey>('commuteScore')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // URLパラメータから初期値を設定
  useEffect(() => {
    const stationParam = searchParams.get('station')
    if (stationParam) {
      setSelectedFromStation(stationParam)
    }
  }, [searchParams])

  // データ取得
  useEffect(() => {
    fetchData()
  }, [])

  // フィルタリング
  useEffect(() => {
    applyFilters()
  }, [schools, filters])

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
      }
    } catch (error) {
      console.error('データの取得に失敗しました:', error)
    } finally {
      setLoadingSchools(false)
    }
  }

  const applyFilters = () => {
    let filtered = schools

    if (filters.prefecture) {
      filtered = filtered.filter(school => school.prefecture === filters.prefecture)
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(school => 
        school.name.toLowerCase().includes(searchTerm) ||
        school.prefecture.toLowerCase().includes(searchTerm) ||
        school.address.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredSchools(filtered)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ prefecture: '', searchTerm: '' })
  }

  const toggleSchoolSelection = (schoolId: string) => {
    const newSelected = new Set(selectedSchoolIds)
    if (newSelected.has(schoolId)) {
      newSelected.delete(schoolId)
    } else {
      newSelected.add(schoolId)
    }
    setSelectedSchoolIds(newSelected)
  }

  const selectAllFilteredSchools = () => {
    const allFilteredIds = new Set(filteredSchools.map(school => school.id))
    setSelectedSchoolIds(allFilteredIds)
  }

  const clearAllSelections = () => {
    setSelectedSchoolIds(new Set())
  }

  const handleCompare = async () => {
    if (!selectedFromStation || selectedSchoolIds.size === 0) {
      alert('出発駅と比較する学校を選択してください')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStationId: selectedFromStation,
          schoolIds: Array.from(selectedSchoolIds)
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        console.error('比較に失敗しました')
        alert('比較に失敗しました')
      }
    } catch (error) {
      console.error('比較エラー:', error)
      alert('比較エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder(key === 'commuteScore' ? 'desc' : 'asc')
    }
  }

  const sortedResults = result?.schools.sort((a, b) => {
    if (!a.bestRoute && !b.bestRoute) return 0
    if (!a.bestRoute) return 1
    if (!b.bestRoute) return -1

    let aValue: number | string
    let bValue: number | string

    switch (sortKey) {
      case 'name':
        aValue = a.school.name
        bValue = b.school.name
        break
      case 'commuteScore':
        aValue = a.bestRoute.commuteScore
        bValue = b.bestRoute.commuteScore
        break
      case 'totalTime':
        aValue = a.bestRoute.totalTime
        bValue = b.bestRoute.totalTime
        break
      case 'fare':
        aValue = a.bestRoute.fare
        bValue = b.bestRoute.fare
        break
      case 'transfers':
        aValue = a.bestRoute.transfers
        bValue = b.bestRoute.transfers
        break
      default:
        return 0
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue, 'ja')
        : bValue.localeCompare(aValue, 'ja')
    }

    const numA = Number(aValue)
    const numB = Number(bValue)
    return sortOrder === 'asc' ? numA - numB : numB - numA
  })

  const prefectures = [...new Set(schools.map(school => school.prefecture))].sort()

  if (loadingSchools) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-black mb-2">学校比較を準備中</h2>
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
              学校比較
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              複数の学校の通いやすさを一目で比較。<br/>
              <span className="font-bold text-black">データに基づいた</span>最適な学校選びをサポートします
            </p>

            {/* 機能説明カード */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-6">
                <BarChart3 className="w-8 h-8 text-black mx-auto mb-3" />
                <h3 className="font-bold text-black mb-2">スコア比較</h3>
                <p className="text-sm text-gray-600">通いやすさを数値で比較</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <Award className="w-8 h-8 text-black mx-auto mb-3" />
                <h3 className="font-bold text-black mb-2">ランキング表示</h3>
                <p className="text-sm text-gray-600">条件別でソート可能</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <Zap className="w-8 h-8 text-black mx-auto mb-3" />
                <h3 className="font-bold text-black mb-2">一括比較</h3>
                <p className="text-sm text-gray-600">複数校を同時に分析</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 出発駅選択 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg border-2 border-gray-100 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-black mb-2">出発駅を選択</h2>
              <p className="text-gray-600">どこから通学しますか？</p>
            </div>
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
          </div>
        </div>
      </section>

      {/* 学校選択 */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">比較する学校を選択</h2>
                <div className="flex gap-3">
                  <button
                    onClick={selectAllFilteredSchools}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    全て選択
                  </button>
                  <button
                    onClick={clearAllSelections}
                    className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    選択解除
                  </button>
                </div>
              </div>

              {/* フィルター */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">都道府県</label>
                  <select
                    value={filters.prefecture}
                    onChange={(e) => handleFilterChange('prefecture', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-black focus:outline-none"
                  >
                    <option value="">全ての都道府県</option>
                    {prefectures.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>{prefecture}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">学校名検索</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="学校名で検索"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    フィルターをクリア
                  </button>
                </div>
              </div>

              {/* 選択状況 */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-black mr-2" />
                    <span className="text-black font-medium">
                      {selectedSchoolIds.size} 校選択中 / {filteredSchools.length} 校表示中
                    </span>
                  </div>
                  {selectedSchoolIds.size > 0 && (
                    <div className="text-sm text-gray-600">
                      最大20校まで選択可能
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 学校リスト */}
            <div className="max-h-96 overflow-y-auto">
              {filteredSchools.map((school, index) => (
                <div
                  key={school.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedSchoolIds.has(school.id) ? 'bg-gray-50 border-l-4 border-l-black' : ''
                  }`}
                  onClick={() => toggleSchoolSelection(school.id)}
                >
                  <div className="flex items-center">
                    <div className="mr-4">
                      {selectedSchoolIds.has(school.id) ? (
                        <CheckSquare className="w-6 h-6 text-black" />
                      ) : (
                        <Square className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-1">{school.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{school.prefecture} • {school.address}</span>
                      </div>
                    </div>
                    {selectedSchoolIds.has(school.id) && (
                      <div className="ml-4">
                        <span className="px-3 py-1 bg-black text-white rounded-lg text-xs font-medium">
                          選択中
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredSchools.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">条件に合う学校が見つかりません</p>
                  <p className="text-sm">フィルター条件を変更してお試しください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 比較実行ボタン */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <button
            onClick={handleCompare}
            disabled={!selectedFromStation || selectedSchoolIds.size === 0 || loading}
            className={`px-12 py-4 rounded-lg text-white text-lg font-bold transition-colors ${
              !selectedFromStation || selectedSchoolIds.size === 0 || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                比較実行中...
              </div>
            ) : (
              <div className="flex items-center">
                <Users className="w-6 h-6 mr-3" />
                {selectedSchoolIds.size}校を比較する
              </div>
            )}
          </button>
        </div>
      </section>

      {/* 比較結果 */}
      {result && (
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
              {/* 結果ヘッダー */}
              <div className="bg-black p-8 text-white">
                <h2 className="text-3xl font-bold mb-4">比較結果</h2>
                <div className="flex items-center text-gray-300 mb-6">
                  <MapPin className="w-5 h-5 mr-2" />
                  出発駅: {result.fromStation.name}
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-gray-300 text-sm">比較学校数</div>
                    <div className="text-3xl font-bold">{result.summary.totalSchools}校</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-gray-300 text-sm">平均所要時間</div>
                    <div className="text-3xl font-bold">{Math.round(result.summary.averageTime)}分</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-gray-300 text-sm">平均通いやすさスコア</div>
                    <div className="text-3xl font-bold">{Math.round(result.summary.averageScore)}/100</div>
                  </div>
                </div>
              </div>

              {/* 結果テーブル */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-black transition-colors"
                        >
                          学校名
                          <ArrowUpDown className="w-3 h-3 ml-2" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('commuteScore')}
                          className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-black transition-colors"
                        >
                          通いやすさスコア
                          <ArrowUpDown className="w-3 h-3 ml-2" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('totalTime')}
                          className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-black transition-colors"
                        >
                          所要時間
                          <ArrowUpDown className="w-3 h-3 ml-2" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('fare')}
                          className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-black transition-colors"
                        >
                          運賃
                          <ArrowUpDown className="w-3 h-3 ml-2" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('transfers')}
                          className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-black transition-colors"
                        >
                          乗り換え
                          <ArrowUpDown className="w-3 h-3 ml-2" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        最寄り駅
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedResults?.map((schoolData, index) => (
                      <tr 
                        key={schoolData.school.id} 
                        className={`transition-colors hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-black">{schoolData.school.name}</div>
                            <div className="text-sm text-gray-500">{schoolData.school.prefecture}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {schoolData.bestRoute ? (
                            <div className="flex items-center">
                              <Star className="w-5 h-5 text-black mr-2" />
                              <span className={`text-lg font-bold ${
                                schoolData.bestRoute.commuteScore >= 80 ? 'text-black' :
                                schoolData.bestRoute.commuteScore >= 60 ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {schoolData.bestRoute.commuteScore}
                              </span>
                              <span className="text-gray-500 text-sm ml-1">/100</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm font-medium">ルートが見つかりません</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {schoolData.bestRoute ? (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-bold text-black">{schoolData.bestRoute.totalTime}分</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {schoolData.bestRoute ? (
                            <span className="text-sm font-bold text-black">¥{schoolData.bestRoute.fare}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {schoolData.bestRoute ? (
                            <div className="flex items-center">
                              <Train className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium">{schoolData.bestRoute.transfers}回</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {schoolData.bestRoute ? (
                            <span className="text-sm text-gray-600 font-medium">{schoolData.bestRoute.targetStation.name}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/schools/${schoolData.school.id}`}
                              className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
                            >
                              詳細
                            </Link>
                            {schoolData.bestRoute && (
                              <Link
                                href={`/simulate?school=${schoolData.school.id}&station=${selectedFromStation}`}
                                className="px-3 py-1 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                              >
                                シミュレーション
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-black mb-2">学校比較を読み込み中</h2>
          <p className="text-gray-600">しばらくお待ちください...</p>
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
} 