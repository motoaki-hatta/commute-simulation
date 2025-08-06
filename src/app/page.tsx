'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Clock, Train, Star, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/schools?search=${encodeURIComponent(searchTerm.trim())}`)
    } else {
      router.push('/schools')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヒーローセクション */}
      <section className="pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-black mb-8 leading-tight">
              通学シミュレーション
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
              データに基づいた<span className="font-bold text-black">科学的なアプローチ</span>で<br />
              本当に通いやすい学校を見つけよう
            </p>

            {/* 検索ボックス */}
            <div className="max-w-2xl mx-auto mb-20">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    placeholder="学校名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-32 py-6 text-lg border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-8 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
                  >
                    検索
                  </button>
                </div>
              </form>
            </div>

            {/* 統計情報 */}
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-20">
              <div className="text-center">
                <div className="text-4xl font-black text-black mb-2">500+</div>
                <div className="text-gray-600">登録学校数</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-black mb-2">50+</div>
                <div className="text-gray-600">対応駅数</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-black mb-2">98%</div>
                <div className="text-gray-600">満足度</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
              なぜ選ばれるのか
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              従来の時間だけでは分からない、本当の「通いやすさ」を数値化
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 機能カード1 */}
            <div className="group">
              <div className="bg-white p-8 rounded-lg border-2 border-gray-100 hover:border-black transition-colors h-full">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">精密な時間計算</h3>
                <p className="text-gray-600 leading-relaxed">
                  電車の運行本数、待ち時間、乗り換え時間まで考慮した正確な通学時間
                </p>
              </div>
            </div>

            {/* 機能カード2 */}
            <div className="group">
              <div className="bg-white p-8 rounded-lg border-2 border-gray-100 hover:border-black transition-colors h-full">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">地図で直感的に</h3>
                <p className="text-gray-600 leading-relaxed">
                  学校と最寄り駅の位置関係を地図上で視覚的に確認できる
                </p>
              </div>
            </div>

            {/* 機能カード3 */}
            <div className="group">
              <div className="bg-white p-8 rounded-lg border-2 border-gray-100 hover:border-black transition-colors h-full">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Train className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">詳細ルート分析</h3>
                <p className="text-gray-600 leading-relaxed">
                  複数の通学ルートを比較し、最適な経路を提案
                </p>
              </div>
            </div>

            {/* 機能カード4 */}
            <div className="group">
              <div className="bg-white p-8 rounded-lg border-2 border-gray-100 hover:border-black transition-colors h-full">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">学校比較機能</h3>
                <p className="text-gray-600 leading-relaxed">
                  複数の学校の通いやすさを一覧で比較し、最適な選択をサポート
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-8">
            今すぐ始めよう
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            あなたにぴったりの学校を見つけて、理想の学校生活をスタートしませんか？
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Link
              href="/schools"
              className="group p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-black transition-colors"
            >
              <div className="text-center">
                <MapPin className="w-10 h-10 text-black mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-black mb-2">学校を探す</h3>
                <p className="text-gray-600 text-sm">豊富な学校データから検索</p>
              </div>
            </Link>

            <Link
              href="/simulate"
              className="group p-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="text-center">
                <Clock className="w-10 h-10 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">シミュレーション</h3>
                <p className="text-gray-300 text-sm">通学ルートを詳細分析</p>
              </div>
            </Link>

            <Link
              href="/compare"
              className="group p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-black transition-colors"
            >
              <div className="text-center">
                <Star className="w-10 h-10 text-black mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-black mb-2">学校比較</h3>
                <p className="text-gray-600 text-sm">複数校を一括比較</p>
              </div>
            </Link>
          </div>

          <div className="mt-16">
            <Link
              href="/schools"
              className="inline-flex items-center px-12 py-4 bg-black text-white text-lg font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              今すぐ始める
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">通学シミュレーション</h3>
            <p className="text-gray-400 mb-8">
              データサイエンスで学校選びを革新する
            </p>
            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-500 text-sm">
                © 2024 通学シミュレーション. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}