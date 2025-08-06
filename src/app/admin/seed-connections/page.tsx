'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function SeedConnectionsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const handleSeedConnections = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/seed-connections', {
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
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/seed" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← 管理画面に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">駅間接続データ投入</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              実際の駅間データを投入
            </h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                東京エリアの主要路線の実際の駅間時間・運賃データを投入します：
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• JR山手線: 主要駅間の接続</li>
                <li>• JR中央線快速: 新宿〜水道橋方面</li>
                <li>• 東京メトロ丸ノ内線: 池袋〜赤坂見附</li>
                <li>• 東京メトロ銀座線: 表参道〜銀座</li>
                <li>• 京王線: 新宿〜明大前方面</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={handleSeedConnections}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    データ投入中...
                  </>
                ) : (
                  '駅間接続データを投入'
                )}
              </button>
            </div>

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
                        駅間接続: {result.data.connections}件を投入しました。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result?.success && (
              <div className="mt-6 text-center">
                <Link
                  href="/simulate"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  シミュレーションをテスト
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}