import { Compass, Flag, ImagePlus, MapPin, MessageSquareReply, RefreshCw, Search, Send, Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { EmptyState } from '../components/ui/EmptyState'
import { ImageStrip } from '../components/ui/ImageStrip'
import { useAuth } from '../features/auth/hooks/useAuth'
import { displayAuthor } from '../lib/display'
import { api, getErrorMessage } from '../services/hanoigo.api'
import type { Place, PlaceCategory, Review } from '../types/api.type'

const categories: Array<PlaceCategory | ''> = [
  '',
  'food',
  'cafe',
  'stay',
  'attraction',
  'workspace',
  'transport',
  'other',
]

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

  async function loadPlaces() {
    setLoading(true)
    setError('')
    try {
      const data = await api.places.list({
        q: query || undefined,
        category: category || undefined,
        longitude: longitude ? Number(longitude) : undefined,
        latitude: latitude ? Number(latitude) : undefined,
        radiusMeters: radiusMeters ? Number(radiusMeters) : undefined,
        limit: 24,
      })
      setPlaces(data)
      if (!selected && data[0]) setSelected(data[0])
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
    <section className="page-grid">
      <header className="page-header">
        <div>
          <span className="eyebrow">Published places</span>
          <h1>Discover Hanoi spots</h1>
        </div>
        <form
          className="search-row"
          onSubmit={(event) => {
            event.preventDefault()
            loadPlaces()
          }}
        >
          <div className="search-box">
            <Search size={18} />
            <input aria-label="Search places" onChange={(event) => setQuery(event.target.value)} placeholder="Search" value={query} />
          </div>
          <select aria-label="Category" onChange={(event) => setCategory(event.target.value as PlaceCategory | '')} value={category}>
            {categories.map((item) => (
              <option key={item || 'all'} value={item}>
                {item || 'all'}
              </option>
            ))}
          </select>
          <input aria-label="Longitude" onChange={(event) => setLongitude(event.target.value)} placeholder="Lng" value={longitude} />
          <input aria-label="Latitude" onChange={(event) => setLatitude(event.target.value)} placeholder="Lat" value={latitude} />
          <input aria-label="Radius" onChange={(event) => setRadiusMeters(event.target.value)} placeholder="Radius" type="number" value={radiusMeters} />
          <button className="icon-button" title="Refresh" type="submit">
            <RefreshCw size={18} />
          </button>
        </form>
      </header>

      {error && <p className="surface-error">{error}</p>}

      <div className="split-layout">
        <div className="list-column">
          {loading && <p className="muted">Loading</p>}
          {places.map((place) => (
            <button className={selected?._id === place._id ? 'place-card active' : 'place-card'} key={place._id} onClick={() => setSelected(place)} type="button">
              <ImageStrip images={place.images} name={place.name} />
              <div>
                <strong>{place.name}</strong>
                <span>
                  <MapPin size={14} />
                  {place.address}
                </span>
                <small>
                  <Star size={14} />
                  {place.ratingAverage?.toFixed?.(1) ?? '0.0'} ({place.ratingCount})
                </small>
              </div>
            </button>
          ))}
        </div>

        <div className="detail-column">
          {selected ? (
            <>
              <div className="detail-hero">
                <ImageStrip images={selected.images} name={selected.name} large />
                <div>
                  <span className="pill">{selected.category}</span>
                  <h2>{selected.name}</h2>
                  <p>{selected.description}</p>
                  <p className="meta-line">
                    <MapPin size={16} />
                    {selected.address}
                  </p>
                </div>
              </div>
              <div className="toolbar">
                <span className="metric">
                  <Star size={16} />
                  {selected.ratingAverage?.toFixed?.(1) ?? '0.0'}
                </span>
                <span className="metric">{selected.status}</span>
                <span className="metric">{selected.tags.join(', ') || 'no tags'}</span>
              </div>

              {user && (
                <form className="inline-form" onSubmit={submitReview}>
                  <select aria-label="Rating" onChange={(event) => setRating(Number(event.target.value))} value={rating}>
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} stars
                      </option>
                    ))}
                  </select>
                  <input onChange={(event) => setComment(event.target.value)} placeholder="Review" required value={comment} />
                  <label className="file-input compact-file">
                    <ImagePlus size={15} />
                    <span>{reviewFiles.length > 0 ? `${reviewFiles.length}` : 'Images'}</span>
                    <input accept="image/*" multiple onChange={(event) => setReviewFiles(Array.from(event.target.files ?? []))} type="file" />
                  </label>
                  <button className="primary-button compact" type="submit">
                    <Send size={15} />
                    Post
                  </button>
                </form>
              )}

              <div className="item-list">
                {reviews.map((review) => (
                  <article className="review-item" key={review._id}>
                    <strong>{displayAuthor(review.user)}</strong>
                    <span>
                      <Star size={14} />
                      {review.rating}
                    </span>
                    <p>{review.comment}</p>
                    <ImageStrip images={review.images} name="Review" />
                    {review.ownerReply && <small>Reply: {review.ownerReply}</small>}
                    <div className="toolbar">
                      <button className="ghost-button slim" disabled={!user} onClick={() => reportReview(review)} type="button">
                        <Flag size={15} />
                        Report
                      </button>
                      <button className="ghost-button slim" disabled={!user} onClick={() => replyReview(review)} type="button">
                        <MessageSquareReply size={15} />
                        Reply
                      </button>
                      <button className="ghost-button slim danger" disabled={!user} onClick={() => deleteReview(review)} type="button">
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={Compass} label="No place selected" />
          )}
        </div>
      </div>
    </section>
  )
}
