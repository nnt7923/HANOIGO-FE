import { RefreshCw, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { AdvancedPlaceFilters } from '../features/places/components/AdvancedPlaceFilters'
import { CategoryRail } from '../features/places/components/CategoryRail'
import { DiscoverStats } from '../features/places/components/DiscoverStats'
import { MapSelectionCard } from '../features/places/components/MapSelectionCard'
import { PlaceDetailPanel } from '../features/places/components/PlaceDetailPanel'
import { PlaceListPanel } from '../features/places/components/PlaceListPanel'
import { TravelMap } from '../features/places/components/TravelMap'
import { hasCoordinates } from '../features/places/components/discoverUtils'
import { api, getErrorMessage } from '../services/hanoigo.api'
import type { Place, PlaceCategory, Review } from '../types/api.type'

export function PlacesPage() {
  const { user } = useAuth()
  const [places, setPlaces] = useState<Place[]>([])
  const [selected, setSelected] = useState<Place | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<PlaceCategory | ''>('')
  const [longitude, setLongitude] = useState('')
  const [latitude, setLatitude] = useState('')
  const [radiusMeters, setRadiusMeters] = useState('5000')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewFiles, setReviewFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mappedCount = useMemo(() => places.filter(hasCoordinates).length, [places])
  const averageRating = useMemo(() => {
    const rated = places.filter((place) => Number.isFinite(place.ratingAverage) && place.ratingAverage > 0)
    if (rated.length === 0) return '0.0'
    return (rated.reduce((total, place) => total + place.ratingAverage, 0) / rated.length).toFixed(1)
  }, [places])

  async function loadPlaces(nextCategory = category) {
    setLoading(true)
    setError('')
    setCategory(nextCategory)
    try {
      const data = await api.places.list({
        q: query || undefined,
        category: nextCategory || undefined,
        longitude: longitude ? Number(longitude) : undefined,
        latitude: latitude ? Number(latitude) : undefined,
        radiusMeters: radiusMeters ? Number(radiusMeters) : undefined,
        limit: 24,
      })
      setPlaces(data)
      setSelected((current) => {
        if (!current) return data[0] ?? null
        return data.find((place) => place._id === current._id) ?? data[0] ?? null
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selected) return
    api.reviews
      .list(selected.slug || selected._id)
      .then(setReviews)
      .catch((err) => setError(getErrorMessage(err)))
  }, [selected])

  async function submitReview(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    try {
      const uploaded = reviewFiles.length > 0 ? await api.uploads.images(reviewFiles) : []
      const review = await api.reviews.create(selected.slug || selected._id, {
        rating,
        comment,
        images: uploaded.map((asset) => asset.secureUrl),
      })
      setReviews((items) => [review, ...items])
      setComment('')
      setReviewFiles([])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function reportReview(review: Review) {
    try {
      await api.reviews.report(review._id, 'Spam or inappropriate content')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function deleteReview(review: Review) {
    try {
      await api.reviews.remove(review._id)
      setReviews((items) => items.filter((item) => item._id !== review._id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function replyReview(review: Review) {
    const reply = window.prompt('Owner reply')
    if (!reply) return
    try {
      const next = await api.reviews.reply(review._id, reply)
      setReviews((items) => items.map((item) => (item._id === review._id ? next : item)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <section className="page-grid discover-page">
      <header className="page-header travel-header">
        <div>
          <span className="eyebrow">Live travel map</span>
          <h1>Explore Hanoi by mood, route, and neighborhood.</h1>
          <p>Find cafes, stays, landmarks, work spots, and local food with a real map view built around your next stop.</p>
        </div>
        <form
          className="search-row discover-search"
          onSubmit={(event) => {
            event.preventDefault()
            loadPlaces(category)
          }}
        >
          <div className="search-box">
            <Search size={18} />
            <input aria-label="Search places" onChange={(event) => setQuery(event.target.value)} placeholder="Search" value={query} />
          </div>
          <button className="icon-button" title="Refresh" type="submit">
            <RefreshCw size={18} />
          </button>
        </form>
      </header>

      <CategoryRail activeCategory={category} onSelect={loadPlaces} />
      <AdvancedPlaceFilters
        latitude={latitude}
        longitude={longitude}
        onLatitudeChange={setLatitude}
        onLongitudeChange={setLongitude}
        onRadiusMetersChange={setRadiusMeters}
        radiusMeters={radiusMeters}
      />
      <DiscoverStats averageRating={averageRating} category={category} mappedCount={mappedCount} placesCount={places.length} radiusMeters={radiusMeters} />

      {error && <p className="surface-error">{error}</p>}

      <div className="discover-layout">
        <PlaceListPanel loading={loading} onSelect={setSelected} places={places} selectedPlaceId={selected?._id} />

        <div className="map-stage">
          <TravelMap places={places} selectedPlaceId={selected?._id} onSelectPlace={setSelected} />
          {selected && <MapSelectionCard place={selected} />}
        </div>

        <PlaceDetailPanel
          canReview={Boolean(user)}
          comment={comment}
          onCommentChange={setComment}
          onDeleteReview={deleteReview}
          onRatingChange={setRating}
          onReplyReview={replyReview}
          onReportReview={reportReview}
          onReviewFilesChange={setReviewFiles}
          onSubmitReview={submitReview}
          rating={rating}
          reviewFiles={reviewFiles}
          reviews={reviews}
          selected={selected}
        />
      </div>
    </section>
  )
}
