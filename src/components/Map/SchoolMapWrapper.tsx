'use client'

import dynamic from 'next/dynamic'

// LeafletMapを動的インポート（SSR回避）
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">地図を読み込み中...</div>
    </div>
  )
})

interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  type: 'school' | 'station' | 'transfer'
  description?: string
  isPrimary?: boolean
}

interface MapRoute {
  coordinates: [number, number][]
  type: 'train' | 'walk'
  lineName?: string
  color?: string
  dashArray?: string
}

interface SchoolMapWrapperProps {
  markers: MapMarker[]
  routes?: MapRoute[]
  height?: string
  className?: string
}

export default function SchoolMapWrapper({ 
  markers, 
  routes = [], 
  height = '400px',
  className = '' 
}: SchoolMapWrapperProps) {
  return (
    <LeafletMap
      markers={markers}
      routes={routes}
      height={height}
      className={className}
    />
  )
} 