import type { Place } from '../../../types/api.type'

export function hasCoordinates(place: Place) {
  const [longitude, latitude] = place.location?.coordinates ?? []
  return Number.isFinite(longitude) && Number.isFinite(latitude)
}

export function openInMaps(place: Place) {
  const [longitude, latitude] = place.location?.coordinates ?? []
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return
  window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank', 'noopener,noreferrer')
}
