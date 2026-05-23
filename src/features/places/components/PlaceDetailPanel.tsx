import { Clock, Flag, ImagePlus, MapPin, MessageSquareReply, Send, Star, Trash2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ImageStrip } from '../../../components/ui/ImageStrip'
import { displayAuthor } from '../../../lib/display'
import type { Place, Review } from '../../../types/api.type'
import { categoryMeta } from './discoverMeta'
import { hasCoordinates, openInMaps } from './discoverUtils'

export function PlaceDetailPanel({
  canReview,
  comment,
  rating,
  reviewFiles,
  reviews,
  selected,
  onCommentChange,
  onDeleteReview,
  onRatingChange,
  onReportReview,
  onReplyReview,
  onReviewFilesChange,
  onSubmitReview,
}: {
  canReview: boolean
  comment: string
  rating: number
  reviewFiles: File[]
  reviews: Review[]
  selected: Place | null
  onCommentChange: (value: string) => void
  onDeleteReview: (review: Review) => void
  onRatingChange: (value: number) => void
  onReportReview: (review: Review) => void
  onReplyReview: (review: Review) => void
  onReviewFilesChange: (files: File[]) => void
  onSubmitReview: (event: FormEvent) => void
}) {
  return (
    <aside className="place-detail-panel detail-column">
      {selected ? (
        <>
          <div className="detail-hero">
            <ImageStrip images={selected.images} name={selected.name} large />
            {selected.images.length > 1 && (
              <div className="detail-thumbnails">
                {selected.images.slice(1, 4).map((image) => (
                  <img alt={selected.name} key={image} src={image} />
                ))}
              </div>
            )}
            <div>
              <DetailKicker place={selected} />
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
            {selected.openingHours && (
              <span className="metric">
                <Clock size={16} />
                Hours available
              </span>
            )}
            {hasCoordinates(selected) && (
              <span className="metric">
                <MapPin size={16} />
                {selected.location.coordinates[1].toFixed(4)}, {selected.location.coordinates[0].toFixed(4)}
              </span>
            )}
          </div>
          <div className="detail-actions">
            <button className="primary-button compact" disabled={!hasCoordinates(selected)} onClick={() => openInMaps(selected)} type="button">
              <MapPin size={15} />
              Open in maps
            </button>
            <button className="ghost-button slim" type="button">
              <Star size={15} />
              {selected.ratingCount} reviews
            </button>
          </div>

          {canReview && (
            <form className="inline-form" onSubmit={onSubmitReview}>
              <select aria-label="Rating" onChange={(event) => onRatingChange(Number(event.target.value))} value={rating}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
              <input onChange={(event) => onCommentChange(event.target.value)} placeholder="Review" required value={comment} />
              <label className="file-input compact-file">
                <ImagePlus size={15} />
                <span>{reviewFiles.length > 0 ? `${reviewFiles.length}` : 'Images'}</span>
                <input accept="image/*" multiple onChange={(event) => onReviewFilesChange(Array.from(event.target.files ?? []))} type="file" />
              </label>
              <button className="primary-button compact" type="submit">
                <Send size={15} />
                Post
              </button>
            </form>
          )}

          <div className="item-list">
            <div className="panel-title inline">
              <strong>Traveler reviews</strong>
              <span>{reviews.length} total</span>
            </div>
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
                  <button className="ghost-button slim" disabled={!canReview} onClick={() => onReportReview(review)} type="button">
                    <Flag size={15} />
                    Report
                  </button>
                  <button className="ghost-button slim" disabled={!canReview} onClick={() => onReplyReview(review)} type="button">
                    <MessageSquareReply size={15} />
                    Reply
                  </button>
                  <button className="ghost-button slim danger" disabled={!canReview} onClick={() => onDeleteReview(review)} type="button">
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
          </div>
        </>
      ) : (
        <EmptyState icon={MapPin} label="No place selected" />
      )}
    </aside>
  )
}

function DetailKicker({ place }: { place: Place }) {
  const Icon = categoryMeta[place.category].icon

  return (
    <span className="detail-kicker">
      <Icon size={16} />
      {categoryMeta[place.category].label}
    </span>
  )
}
