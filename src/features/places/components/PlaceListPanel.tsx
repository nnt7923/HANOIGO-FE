import { Compass, MapPin, Star } from 'lucide-react'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ImageStrip } from '../../../components/ui/ImageStrip'
import type { Place } from '../../../types/api.type'
import { categoryMeta } from './discoverMeta'
import { hasCoordinates } from './discoverUtils'

export function PlaceListPanel({
  loading,
  places,
  selectedPlaceId,
  onSelect,
}: {
  loading: boolean
  places: Place[]
  selectedPlaceId?: string
  onSelect: (place: Place) => void
}) {
  return (
    <aside className="map-list-panel">
      <div className="panel-title">
        <div>
          <strong>{places.length} places</strong>
          <span>{loading ? 'Refreshing map' : 'Hanoi area results'}</span>
        </div>
        <Compass size={18} />
      </div>
      <div className="list-column">
        {loading && <p className="muted">Loading</p>}
        {places.length === 0 && !loading && <EmptyState icon={Compass} label="No places found" />}
        {places.map((place) => (
          <button className={selectedPlaceId === place._id ? 'place-card active' : 'place-card'} key={place._id} onClick={() => onSelect(place)} type="button">
            <ImageStrip images={place.images} name={place.name} />
            <div>
              <span className="pill compact">{categoryMeta[place.category].label}</span>
              <strong>{place.name}</strong>
              <span>
                <MapPin size={14} />
                {place.address}
              </span>
              <small>
                <Star size={14} />
                {place.ratingAverage?.toFixed?.(1) ?? '0.0'} ({place.ratingCount})
                {!hasCoordinates(place) && ' | unmapped'}
              </small>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}
