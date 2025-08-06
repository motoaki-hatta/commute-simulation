'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// アイコンの設定（Leafletのデフォルトアイコン問題を解決）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

interface LeafletMapProps {
  markers: MapMarker[]
  routes?: MapRoute[]
  center?: [number, number]
  zoom?: number
  height?: string
  className?: string
}

export default function LeafletMap({ 
  markers, 
  routes = [], 
  center, 
  zoom = 13, 
  height = '400px',
  className = '' 
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // 地図の初期化
    if (!mapInstance.current) {
      // 中心座標の自動計算
      const mapCenter = center || calculateCenter(markers)
      
      mapInstance.current = L.map(mapRef.current).setView(mapCenter, zoom)

      // タイルレイヤーの追加（OpenStreetMap）
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current)
    }

    const map = mapInstance.current

    // 既存のマーカーとルートをクリア
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    // マーカーの追加
    markers.forEach((marker) => {
      const icon = createCustomIcon(marker.type, marker.isPrimary)
      
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-gray-800">${marker.title}</h3>
            ${marker.description ? `<p class="text-sm text-gray-600 mt-1">${marker.description}</p>` : ''}
            ${marker.isPrimary ? '<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">主要</span>' : ''}
          </div>
        `)
    })

    // ルートの追加
    routes.forEach((route) => {
      const color = route.color || (route.type === 'train' ? '#3B82F6' : '#10B981')
      const dashArray = route.dashArray || (route.type === 'walk' ? '5, 5' : undefined)
      
      L.polyline(route.coordinates, {
        color: color,
        weight: route.type === 'train' ? 4 : 3,
        opacity: 0.8,
        dashArray: dashArray
      })
      .addTo(map)
      .bindPopup(route.lineName || (route.type === 'train' ? '電車ルート' : '徒歩ルート'))
    })

    // 地図の表示範囲を調整
    if (markers.length > 1) {
      const group = new L.FeatureGroup(
        markers.map(marker => L.marker([marker.lat, marker.lng]))
      )
      map.fitBounds(group.getBounds().pad(0.1))
    }

    return () => {
      // クリーンアップ
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [markers, routes, center, zoom])

  return (
    <div 
      ref={mapRef} 
      style={{ height }} 
      className={`w-full rounded-lg border border-gray-200 ${className}`}
    />
  )
}

// カスタムアイコンの作成
function createCustomIcon(type: 'school' | 'station' | 'transfer', isPrimary = false) {
  const colors = {
    school: isPrimary ? '#DC2626' : '#EF4444',     // 赤系
    station: isPrimary ? '#2563EB' : '#3B82F6',     // 青系
    transfer: '#F59E0B'                              // オレンジ
  }
  
  const size = isPrimary ? 32 : 24
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors[type]};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 24 ? '14px' : '12px'};
      ">
        ${type === 'school' ? '学' : type === 'station' ? '駅' : '乗'}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

// 中心座標の自動計算
function calculateCenter(markers: MapMarker[]): [number, number] {
  if (markers.length === 0) {
    return [35.6812, 139.7671] // 東京駅をデフォルト
  }
  
  const lat = markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length
  const lng = markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length
  
  return [lat, lng]
}