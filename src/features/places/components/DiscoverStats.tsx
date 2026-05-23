import { categoryMeta } from './discoverMeta'
import type { PlaceCategory } from '../../../types/api.type'

export function DiscoverStats({
  averageRating,
  category,
  mappedCount,
  placesCount,
  radiusMeters,
}: {
  averageRating: string
  category: PlaceCategory | ''
  mappedCount: number
  placesCount: number
  radiusMeters: string
}) {
  return (
    <div className="discover-insights">
      <div>
        <strong>{placesCount}</strong>
        <span>{categoryMeta[category || 'all'].label} places</span>
      </div>
      <div>
        <strong>{mappedCount}</strong>
        <span>Mapped stops</span>
      </div>
      <div>
        <strong>{averageRating}</strong>
        <span>Average rating</span>
      </div>
      <div>
        <strong>{radiusMeters || 'Any'}</strong>
        <span>Radius meters</span>
      </div>
    </div>
  )
}
