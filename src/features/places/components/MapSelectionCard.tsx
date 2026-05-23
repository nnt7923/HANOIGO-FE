import { Star } from 'lucide-react'
import type { Place } from '../../../types/api.type'
import { categoryMeta } from './discoverMeta'

export function MapSelectionCard({ place }: { place: Place }) {
  return (
    <div className="map-floating-card">
      <span className="pill compact">{categoryMeta[place.category].label}</span>
      <strong>{place.name}</strong>
      <span>
        <Star size={14} />
        {place.ratingAverage?.toFixed?.(1) ?? '0.0'} | {place.address}
      </span>
    </div>
  )
}
