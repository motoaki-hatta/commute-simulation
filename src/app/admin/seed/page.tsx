'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const handleSeedData = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/seed', {
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
        message: 'ネットワークエラーが発生しました'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/schools" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← 学校一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">サンプルデータ投入</h1>
          <p className="text-gray-600 mt-1">
            通学シミュレーション用のサンプルデータを投入します
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              投入されるサンプルデータ
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-800">学校データ</h3>
                <p className="text-gray-600 text-sm">
                  早稲田大学、慶應義塾大学、明治大学、法政大学、上智大学
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-800">駅データ</h3>
                <p className="text-gray-600 text-sm">
                  新宿駅、渋谷駅、池袋駅、東京駅など主要15駅
                </p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-medium text-gray-800">路線データ</h3>
                <p className="text-gray-600 text-sm">
                  JR山手線、中央線、東京メトロ丸ノ内線・銀座線、京王線
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800">注意事項</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    既存のデータはすべて削除され、新しいサンプルデータに置き換えられます。
                  </p>
                </div>
              </div>
            </div>

            {/* 実行ボタン */}
            <div className="text-center">
              <button
                onClick={handleSeedData}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    データ投入中...
                  </>
                ) : (
                  'サンプルデータを投入'
                )}
              </button>
            </div>

            {/* 結果表示 */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.success ? '成功' : 'エラー'}
                    </h4>
                    <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message}
                    </p>
                    {result.success && result.data && (
                      <div className="mt-2 text-sm text-green-700">
                        学校: {result.data.schools}件、駅: {result.data.stations}件、路線: {result.data.lines}件を投入しました。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 完了後のアクション */}
            {result?.success && (
              <div className="mt-6 text-center">
                <Link
                  href="/schools"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  学校一覧を確認する
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}