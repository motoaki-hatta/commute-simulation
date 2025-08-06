'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react'

export default function SeedTimeSlotsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    data?: {
      connections: number
      timeSlots: number
      totalRecords: number
      coverage: string
    }
    error?: string
  } | null>(null)

  const handleSeedTimeSlots = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/seed-timeslots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ 
        success: false, 
        message: 'データ投入中にエラーが発生しました',
        error: 'データ投入中にエラーが発生しました' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <Clock className="w-12 h-12 text-blue-600 mr-3" />
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              時間帯別データ投入
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              各駅間接続に対して時間帯別の詳細データ（混雑度、運行頻度、遅延情報等）を投入します。
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">投入されるデータ</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h3 className="font-semibold mb-2">📊 時間帯</h3>
                <ul className="space-y-1">
                  <li>• 06:00-07:00（早朝）</li>
                  <li>• 07:00-08:00（通勤ラッシュ前）</li>
                  <li>• 08:00-09:00（通勤ラッシュ）</li>
                  <li>• 09:00-10:00（通勤ラッシュ後）</li>
                  <li>• 10:00-11:00（日中）</li>
                  <li>• 17:00-18:00（帰宅ラッシュ前）</li>
                  <li>• 18:00-19:00（帰宅ラッシュ）</li>
                  <li>• 19:00-20:00（帰宅ラッシュ後）</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📈 データ項目</h3>
                <ul className="space-y-1">
                  <li>• 混雑度（1-5段階）</li>
                  <li>• 運行頻度（本数/時）</li>
                  <li>• 平均遅延時間（分）</li>
                  <li>• 定時性スコア（0.0-1.0）</li>
                  <li>• 快適性スコア（0.0-1.0）</li>
                  <li>• 平日・週末データ</li>
                  <li>• 路線別特性調整</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <button
              onClick={handleSeedTimeSlots}
              disabled={loading}
              className={`px-8 py-4 rounded-lg text-white text-lg font-semibold transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  時間帯別データを投入中...
                </div>
              ) : (
                <div className="flex items-center">
                  <Clock className="w-6 h-6 mr-3" />
                  時間帯別データを投入
                </div>
              )}
            </button>
          </div>

          {result && (
            <div className={`rounded-lg border-2 p-6 ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-4">
                {result.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
                )}
                <h3 className={`text-xl font-semibold ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.success ? '✅ 投入完了' : '❌ 投入失敗'}
                </h3>
              </div>
              
              <p className={`text-lg mb-4 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              
              {result.success && result.data && (
                <div className="bg-white rounded-lg p-4 border border-green-300">
                  <h4 className="font-semibold text-green-900 mb-3">投入結果詳細</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
                    <div>
                      <p><strong>駅間接続数:</strong> {result.data.connections}</p>
                      <p><strong>時間帯数:</strong> {result.data.timeSlots}</p>
                    </div>
                    <div>
                      <p><strong>総レコード数:</strong> {result.data.totalRecords}</p>
                      <p><strong>カバレッジ:</strong> {result.data.coverage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!result.success && (
                <div className="bg-white rounded-lg p-4 border border-red-300">
                  <h4 className="font-semibold text-red-900 mb-2">エラー詳細</h4>
                  <p className="text-sm text-red-800">{result.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">管理メニュー</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/admin/seed" 
                className="block p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-center"
              >
                <div className="text-2xl mb-2">🏫</div>
                <div className="font-medium text-gray-900">基本データ</div>
                <div className="text-sm text-gray-600">学校・駅・路線</div>
              </Link>
              <Link 
                href="/admin/seed-connections" 
                className="block p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-center"
              >
                <div className="text-2xl mb-2">🚇</div>
                <div className="font-medium text-gray-900">接続データ</div>
                <div className="text-sm text-gray-600">駅間接続・所要時間</div>
              </Link>
              <div className="block p-4 bg-blue-100 border-2 border-blue-300 rounded-lg text-center">
                <div className="text-2xl mb-2">⏰</div>
                <div className="font-medium text-blue-900">時間帯データ</div>
                <div className="text-sm text-blue-700">混雑度・運行頻度</div>
              </div>
            </div>
            <div className="text-center mt-6">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← アプリに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 