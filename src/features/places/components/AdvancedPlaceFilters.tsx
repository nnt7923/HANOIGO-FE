import { SlidersHorizontal } from 'lucide-react'

export function AdvancedPlaceFilters({
  latitude,
  longitude,
  radiusMeters,
  onLatitudeChange,
  onLongitudeChange,
  onRadiusMetersChange,
}: {
  latitude: string
  longitude: string
  radiusMeters: string
  onLatitudeChange: (value: string) => void
  onLongitudeChange: (value: string) => void
  onRadiusMetersChange: (value: string) => void
}) {
  return (
    <details className="advanced-filters">
      <summary>
        <SlidersHorizontal size={16} />
        Advanced filters
      </summary>
      <div className="advanced-filter-grid">
        <label className="field">
          <span>Longitude</span>
          <input aria-label="Longitude" onChange={(event) => onLongitudeChange(event.target.value)} placeholder="Lng" value={longitude} />
        </label>
        <label className="field">
          <span>Latitude</span>
          <input aria-label="Latitude" onChange={(event) => onLatitudeChange(event.target.value)} placeholder="Lat" value={latitude} />
        </label>
        <label className="field">
          <span>Radius meters</span>
          <input aria-label="Radius" onChange={(event) => onRadiusMetersChange(event.target.value)} placeholder="Radius" type="number" value={radiusMeters} />
        </label>
      </div>
    </details>
  )
}
