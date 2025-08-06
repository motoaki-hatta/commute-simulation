'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Search, Filter, X, Star, Users } from 'lucide-react'

interface School {
  id: string
  name: string
  prefecture: string
  address: string
  schoolStations: Array<{
    id: string
    walkingTime: number
    distance: number
    isPrimary: boolean
    station: {
      id: string
      name: string
    }
  }>
}

interface FilterState {
  prefecture: string
  maxCommuteTime: string
  maxWalkingTime: string
  searchTerm: string
}

function SchoolsPageContent() {
  const searchParams = useSearchParams()
  const [schools, setSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    prefecture: '',
    maxCommuteTime: '',
    maxWalkingTime: '',
    searchTerm: ''
  })

  // URLパラメータから初期検索条件を設定
  useEffect(() => {
    const searchQuery = searchParams.get('search')
    if (searchQuery) {
      setFilters(prev => ({
        ...prev,
        searchTerm: searchQuery
      }))
    }
  }, [searchParams])

  // データ取得
  useEffect(() => {
    fetchSchools()
  }, [])

  // フィルタリング
  useEffect(() => {
    applyFilters()
  }, [schools, filters])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools-detailed')
      if (response.ok) {
        const data = await response.json()
        setSchools(data)
      } else {
        console.error('学校データの取得に失敗しました')
      }
    } catch (error) {
      console.error('学校データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = schools

    if (filters.prefecture) {
      filtered = filtered.filter(school => school.prefecture === filters.prefecture)
    }

    if (filters.maxWalkingTime) {
      const maxTime = parseInt(filters.maxWalkingTime)
      filtered = filtered.filter(school => 
        school.schoolStations.some(station => station.walkingTime <= maxTime)
      )
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
    setFilters({
      prefecture: '',
      maxCommuteTime: '',
      maxWalkingTime: '',
      searchTerm: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')
  const prefectures = [...new Set(schools.map(school => school.prefecture))].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-black mb-2">学校データを読み込み中</h2>
          <p className="text-gray-600">しばらくお待ちください...</p>
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
              学校一覧
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              あなたにぴったりの学校を見つけましょう
            </p>

            {/* 統計情報 */}
            <div className="flex justify-center items-center space-x-12 mb-8">
              <div className="text-center">
                <div className="text-3xl font-black text-black">{schools.length}</div>
                <div className="text-sm text-gray-500">登録学校数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-black">{filteredSchools.length}</div>
                <div className="text-sm text-gray-500">検索結果</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-black">{prefectures.length}</div>
                <div className="text-sm text-gray-500">対応都道府県</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フィルターセクション */}
      <section className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                フィルター
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  クリア
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {filteredSchools.length} 校が見つかりました
            </div>
          </div>

          {/* フィルター展開エリア */}
          <div className={`overflow-hidden transition-all duration-300 ${
            showFilters ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="grid md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">キーワード検索</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="学校名、住所で検索"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">都道府県</label>
                <select
                  value={filters.prefecture}
                  onChange={(e) => handleFilterChange('prefecture', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                >
                  <option value="">全ての都道府県</option>
                  {prefectures.map((prefecture) => (
                    <option key={prefecture} value={prefecture}>{prefecture}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大徒歩時間</label>
                <select
                  value={filters.maxWalkingTime}
                  onChange={(e) => handleFilterChange('maxWalkingTime', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                >
                  <option value="">制限なし</option>
                  <option value="5">5分以内</option>
                  <option value="10">10分以内</option>
                  <option value="15">15分以内</option>
                  <option value="20">20分以内</option>
                </select>
              </div>

              <div className="flex items-end">
                <Link
                  href="/compare"
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center font-medium"
                >
                  学校比較へ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 学校リスト */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {filteredSchools.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">学校が見つかりません</h3>
              <p className="text-gray-600 mb-6">検索条件を変更してお試しください</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                フィルターをクリア
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSchools.map((school, index) => (
                <div
                  key={school.id}
                  className="group bg-white rounded-lg border-2 border-gray-100 hover:border-black transition-colors p-6"
                >
                  {/* 学校名とアドレス */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gray-700 transition-colors">
                      {school.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {school.prefecture}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {school.address}
                    </p>
                  </div>

                  {/* 最寄り駅情報 */}
                  {school.schoolStations.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        最寄り駅
                      </h4>
                      <div className="space-y-2">
                        {school.schoolStations.slice(0, 2).map((schoolStation, idx) => (
                          <div
                            key={schoolStation.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              schoolStation.isPrimary ? 'bg-gray-50 border border-gray-200' : 'bg-gray-25'
                            }`}
                          >
                            <div className="flex items-center">
                              {schoolStation.isPrimary && (
                                <Star className="w-3 h-3 text-black mr-2" />
                              )}
                              <span className="text-sm font-medium text-black">
                                {schoolStation.station.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">
                              徒歩{schoolStation.walkingTime}分
                            </span>
                          </div>
                        ))}
                        {school.schoolStations.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            他 {school.schoolStations.length - 2} 駅
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/schools/${school.id}`}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center text-sm font-medium"
                    >
                      詳細を見る
                    </Link>
                    {school.schoolStations.length > 0 && (
                      <Link
                        href={`/simulate?school=${school.id}`}
                        className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        ルート検索
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* フローティングアクションボタン */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/compare"
          className="group flex items-center px-6 py-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          学校比較
        </Link>
      </div>
    </div>
  )
}

export default function SchoolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-black mb-2">学校一覧を読み込み中</h2>
          <p className="text-gray-600">しばらくお待ちください...</p>
        </div>
      </div>
    }>
      <SchoolsPageContent />
    </Suspense>
  )
}