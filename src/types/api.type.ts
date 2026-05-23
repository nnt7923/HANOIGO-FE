export type UserRole = 'user' | 'owner' | 'admin'
export type OtpPurpose = 'email_verification' | 'password_reset'

export type PlaceCategory =
  | 'food'
  | 'cafe'
  | 'stay'
  | 'attraction'
  | 'workspace'
  | 'transport'
  | 'other'

export type PlaceStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'suspended'

export type SubscriptionPlan = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'expired'
export type ItineraryVisibility = 'private' | 'public' | 'unlisted'
export type ItinerarySource = 'gemini' | 'cache' | 'fallback'
export type ReviewStatus = 'published' | 'hidden'
export type PostType = 'check_in' | 'experience' | 'tip'
export type PostStatus = 'published' | 'hidden' | 'deleted'
export type NotificationType = 'system' | 'review' | 'itinerary' | 'subscription'

export type PaginationQuery = {
  page?: number
  limit?: number
}

export type SafeUser = {
  id: string
  name: string
  email: string
  role: UserRole
  authProvider: 'local' | 'google'
  emailVerifiedAt?: string
  avatarUrl?: string
  subscriptionPlan: SubscriptionPlan
  subscriptionStatus: SubscriptionStatus
  subscriptionExpiresAt?: string
  monthlyItineraryLimit: number
  placeLimit: number
  itineraryUsageCount: number
  usageResetAt: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: Pick<SafeUser, 'id' | 'email' | 'role'>
}

export type UploadAsset = {
  publicId: string
  secureUrl: string
  width: number
  height: number
  format: string
  bytes: number
  status: 'temporary' | 'attached' | 'deleted'
}

export type Place = {
  _id: string
  name: string
  slug: string
  description: string
  category: PlaceCategory
  address: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  owner: string | { _id: string; name: string; email: string; role: UserRole }
  status: PlaceStatus
  moderationReason?: string
  reviewedBy?: string
  reviewedAt?: string
  images: string[]
  tags: string[]
  ratingAverage: number
  ratingCount: number
  openingHours?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export type Review = {
  _id: string
  user: string | { _id: string; name: string; avatarUrl?: string }
  place: string
  rating: number
  comment: string
  images: string[]
  status: ReviewStatus
  ownerReply?: string
  createdAt: string
  updatedAt: string
}

export type Itinerary = {
  _id: string
  user: string | { _id: string; name: string; avatarUrl?: string }
  title: string
  area: string
  days: number
  budgetVnd: number
  preferences: string[]
  places: Place[]
  plan: {
    summary?: string
    days?: Array<{
      day: number
      theme: string
      items: Array<{
        time: string
        placeName: string
        activity: string
        estimatedCostVnd: number
      }>
    }>
    tips?: string[]
    [key: string]: unknown
  }
  source: ItinerarySource
  visibility: ItineraryVisibility
  cloneCount: number
  clonedFrom?: string
  expiresAt: string
}

export type SocialPost = {
  _id: string
  author: string | { _id: string; name: string; avatarUrl?: string }
  place:
    | string
    | {
        _id: string
        name: string
        slug: string
        category: PlaceCategory
        address: string
        ratingAverage: number
      }
  content: string
  type: PostType
  status: PostStatus
  images: string[]
  tags: string[]
  visitDate?: string
  likeCount: number
  commentCount: number
  saveCount: number
  reportCount: number
  createdAt: string
  updatedAt: string
}

export type SocialComment = {
  _id: string
  author: string | { _id: string; name: string; avatarUrl?: string }
  post: string
  content: string
  parentCommentId?: string
  status: PostStatus
  createdAt: string
  updatedAt: string
}

export type Notification = {
  _id: string
  recipient: string
  title: string
  message: string
  type: NotificationType
  metadata?: Record<string, unknown>
  readAt?: string
  createdAt: string
  updatedAt: string
}

export type PlaceInput = {
  name: string
  description: string
  category: PlaceCategory
  address: string
  longitude: number
  latitude: number
  images?: string[]
  tags?: string[]
  openingHours?: Record<string, string>
}
