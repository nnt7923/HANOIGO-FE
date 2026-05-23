import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { Place } from '../../../types/api.type'

const HANOI_CENTER: [number, number] = [21.0285, 105.8542]

type MapPlace = {
  place: Place
  position: [number, number]
}

export function TravelMap({
  places,
  selectedPlaceId,
  onSelectPlace,
}: {
  places: Place[]
  selectedPlaceId?: string
  onSelectPlace: (place: Place) => void
}) {
  const mappedPlaces = useMemo(
    () =>
      places
        .map((place) => {
          const position = getPlacePosition(place)
          return position ? { place, position } : null
        })
        .filter((item): item is MapPlace => Boolean(item)),
    [places],
  )

  return (
    <div className="travel-map-shell">
      <MapContainer center={HANOI_CENTER} className="travel-map" scrollWheelZoom zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport mappedPlaces={mappedPlaces} selectedPlaceId={selectedPlaceId} />
        {mappedPlaces.map(({ place, position }, index) => {
          const active = place._id === selectedPlaceId

          return (
            <Marker
              eventHandlers={{ click: () => onSelectPlace(place) }}
              icon={createMarkerIcon(active, index + 1)}
              key={place._id}
              position={position}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{place.name}</strong>
                  <span>{place.category}</span>
                  <p>{place.address}</p>
                  <button className="ghost-button slim" onClick={() => onSelectPlace(place)} type="button">
                    View place
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      {mappedPlaces.length === 0 && (
        <div className="map-empty-overlay">
          <strong>No mapped places</strong>
          <span>Places without valid coordinates stay visible in the list.</span>
        </div>
      )}
    </div>
  )
}

function MapViewport({
  mappedPlaces,
  selectedPlaceId,
}: {
  mappedPlaces: MapPlace[]
  selectedPlaceId?: string
}) {
  const map = useMap()

  useEffect(() => {
    const selected = mappedPlaces.find(({ place }) => place._id === selectedPlaceId)

    if (selected) {
      map.flyTo(selected.position, Math.max(map.getZoom(), 15), { duration: 0.7 })
      return
    }

    if (mappedPlaces.length > 1) {
      map.fitBounds(
        L.latLngBounds(mappedPlaces.map(({ position }) => position)),
        { maxZoom: 14, padding: [44, 44] },
      )
      return
    }

    if (mappedPlaces.length === 1) {
      map.setView(mappedPlaces[0].position, 14)
      return
    }

    map.setView(HANOI_CENTER, 13)
  }, [map, mappedPlaces, selectedPlaceId])

  return null
}

function getPlacePosition(place: Place): [number, number] | null {
  const [longitude, latitude] = place.location?.coordinates ?? []

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null
  }

  return [latitude, longitude]
}

function createMarkerIcon(active: boolean, index: number) {
  return L.divIcon({
    className: active ? 'travel-map-marker active' : 'travel-map-marker',
    html: `<span><b>${index}</b></span>`,
    iconAnchor: [18, 38],
    iconSize: [36, 38],
    popupAnchor: [0, -34],
  })
}
