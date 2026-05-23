import { apiFetch, clearTokens, saveTokens, toQuery } from './http'
import type {
  AuthResponse,
  Itinerary,
  ItineraryVisibility,
  Notification,
  OtpPurpose,
  PaginationQuery,
  Place,
  PlaceCategory,
  PlaceInput,
  Review,
  SafeUser,
  SocialComment,
  SocialPost,
  UploadAsset,
  UserRole,
} from '../types/api.type'

export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      apiFetch<{ message: string; email: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    verifyOtp: (body: { email: string; code: string; purpose: OtpPurpose }) =>
      authRequest('/auth/verify-otp', body),
    resendOtp: (body: { email: string; purpose: OtpPurpose }) =>
      apiFetch<{ message: string }>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      authRequest('/auth/login', body),
    loginGoogle: (idToken: string) => authRequest('/auth/login/google', { idToken }),
    logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }).finally(clearTokens),
    logoutAll: () =>
      apiFetch<void>('/auth/logout-all', { method: 'POST' }).finally(clearTokens),
    revokeToken: (refreshToken: string) =>
      apiFetch<void>('/auth/revoke-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      apiFetch<void>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }).finally(clearTokens),
    forgotPassword: (email: string) =>
      apiFetch<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (body: { email: string; code: string; newPassword: string }) =>
      apiFetch<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  users: {
    me: () => apiFetch<SafeUser>('/users/me'),
    updateMe: (body: { name?: string; avatarUrl?: string }) =>
      apiFetch<SafeUser>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    quota: () => apiFetch<unknown>('/users/me/quota'),
    ownerRequest: (body: {
      businessName: string
      businessAddress: string
      contactPhone: string
      reason: string
    }) =>
      apiFetch<unknown>('/users/me/owner-request', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    list: (query?: PaginationQuery) =>
      apiFetch<SafeUser[]>(`/users${toQuery(query)}`),
    updateRole: (id: string, role: UserRole) =>
      apiFetch<SafeUser>(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    updateSubscription: (
      id: string,
      body: Partial<
        Pick<
          SafeUser,
          | 'subscriptionPlan'
          | 'monthlyItineraryLimit'
          | 'placeLimit'
          | 'subscriptionStatus'
          | 'subscriptionExpiresAt'
        >
      >,
    ) =>
      apiFetch<SafeUser>(`/users/${id}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    ownerRequests: () => apiFetch<unknown[]>('/users/owner-requests'),
    approveOwnerRequest: (id: string) =>
      apiFetch<unknown>(`/users/owner-requests/${id}/approve`, {
        method: 'POST',
      }),
    rejectOwnerRequest: (id: string) =>
      apiFetch<unknown>(`/users/owner-requests/${id}/reject`, {
        method: 'POST',
      }),
  },

  uploads: {
    image: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return apiFetch<UploadAsset>('/uploads/image', {
        method: 'POST',
        body: formData,
      })
    },
    images: (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      return apiFetch<UploadAsset[]>('/uploads/images', {
        method: 'POST',
        body: formData,
      })
    },
    deleteImage: (publicId: string) =>
      apiFetch<unknown>('/uploads/image', {
        method: 'DELETE',
        body: JSON.stringify({ publicId }),
      }),
  },

  places: {
    list: (
      query?: PaginationQuery & {
        q?: string
        category?: PlaceCategory
        longitude?: number
        latitude?: number
        radiusMeters?: number
      },
    ) => apiFetch<Place[]>(`/places${toQuery(query)}`),
    detail: (identifier: string) => apiFetch<Place>(`/places/${identifier}`),
    manage: (query?: PaginationQuery) =>
      apiFetch<Place[]>(`/places/manage${toQuery(query)}`),
    manageDetail: (identifier: string) =>
      apiFetch<Place>(`/places/manage/${identifier}`),
    create: (body: PlaceInput) =>
      apiFetch<Place>('/places', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (identifier: string, body: Partial<PlaceInput>) =>
      apiFetch<Place>(`/places/${identifier}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (identifier: string) =>
      apiFetch<void>(`/places/${identifier}`, { method: 'DELETE' }),
    approve: (identifier: string) =>
      apiFetch<Place>(`/places/${identifier}/approve`, { method: 'POST' }),
    reject: (identifier: string) =>
      apiFetch<Place>(`/places/${identifier}/reject`, { method: 'POST' }),
    suspend: (identifier: string) =>
      apiFetch<Place>(`/places/${identifier}/suspend`, { method: 'POST' }),
  },

  reviews: {
    list: (placeIdentifier: string, query?: PaginationQuery) =>
      apiFetch<Review[]>(`/places/${placeIdentifier}/reviews${toQuery(query)}`),
    create: (
      placeIdentifier: string,
      body: { rating: number; comment: string; images?: string[] },
    ) =>
      apiFetch<Review>(`/places/${placeIdentifier}/reviews`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (reviewId: string, body: { rating?: number; comment?: string; images?: string[] }) =>
      apiFetch<Review>(`/reviews/${reviewId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (reviewId: string) =>
      apiFetch<void>(`/reviews/${reviewId}`, { method: 'DELETE' }),
    report: (reviewId: string, reason: string) =>
      apiFetch<unknown>(`/reviews/${reviewId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    reply: (reviewId: string, reply: string) =>
      apiFetch<Review>(`/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply }),
      }),
    hide: (reviewId: string) =>
      apiFetch<Review>(`/reviews/${reviewId}/hide`, { method: 'PATCH' }),
    unhide: (reviewId: string) =>
      apiFetch<Review>(`/reviews/${reviewId}/unhide`, { method: 'PATCH' }),
  },

  itineraries: {
    mine: (query?: PaginationQuery) =>
      apiFetch<Itinerary[]>(`/itineraries${toQuery(query)}`),
    publicList: (query?: PaginationQuery) =>
      apiFetch<Itinerary[]>(`/itineraries/public${toQuery(query)}`),
    generate: (body: {
      area: string
      days: number
      budgetVnd: number
      preferences: string[]
      longitude?: number
      latitude?: number
      radiusMeters?: number
    }) =>
      apiFetch<Itinerary>('/itineraries/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateVisibility: (id: string, visibility: ItineraryVisibility) =>
      apiFetch<Itinerary>(`/itineraries/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visibility }),
      }),
    clone: (id: string) =>
      apiFetch<Itinerary>(`/itineraries/${id}/clone`, { method: 'POST' }),
  },

  notifications: {
    list: (query?: PaginationQuery) =>
      apiFetch<Notification[]>(`/notifications${toQuery(query)}`),
    read: (id: string) =>
      apiFetch<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),
    readAll: () =>
      apiFetch<Notification[]>('/notifications/read-all', { method: 'PATCH' }),
    create: (body: {
      recipient: string
      title: string
      message: string
      type: Notification['type']
      metadata?: Record<string, unknown>
    }) =>
      apiFetch<Notification>('/notifications', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  social: {
    feed: (
      query?: PaginationQuery & {
        placeId?: string
        authorId?: string
        type?: SocialPost['type']
        tag?: string
      },
    ) => apiFetch<SocialPost[]>(`/social/feed${toQuery(query)}`),
    followingFeed: (query?: PaginationQuery) =>
      apiFetch<SocialPost[]>(`/social/feed/following${toQuery(query)}`),
    placePosts: (placeId: string, query?: PaginationQuery) =>
      apiFetch<SocialPost[]>(`/social/places/${placeId}/posts${toQuery(query)}`),
    post: (id: string) => apiFetch<SocialPost>(`/social/posts/${id}`),
    createPost: (body: {
      placeId: string
      content: string
      type: SocialPost['type']
      images?: string[]
      tags?: string[]
      visitDate?: string
    }) =>
      apiFetch<SocialPost>('/social/posts', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updatePost: (id: string, body: Partial<SocialPost>) =>
      apiFetch<SocialPost>(`/social/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deletePost: (id: string) =>
      apiFetch<void>(`/social/posts/${id}`, { method: 'DELETE' }),
    like: (id: string) =>
      apiFetch<{ liked: true }>(`/social/posts/${id}/like`, { method: 'POST' }),
    unlike: (id: string) =>
      apiFetch<{ liked: false }>(`/social/posts/${id}/like`, { method: 'DELETE' }),
    save: (id: string) =>
      apiFetch<{ saved: true }>(`/social/posts/${id}/save`, { method: 'POST' }),
    unsave: (id: string) =>
      apiFetch<{ saved: false }>(`/social/posts/${id}/save`, { method: 'DELETE' }),
    comments: (id: string) =>
      apiFetch<SocialComment[]>(`/social/posts/${id}/comments`),
    createComment: (id: string, body: { content: string; parentCommentId?: string }) =>
      apiFetch<SocialComment>(`/social/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    deleteComment: (id: string) =>
      apiFetch<{ deleted: true }>(`/social/comments/${id}`, { method: 'DELETE' }),
    follow: (userId: string) =>
      apiFetch<{ following: true }>(`/social/follows/${userId}`, {
        method: 'POST',
      }),
    unfollow: (userId: string) =>
      apiFetch<{ following: false }>(`/social/follows/${userId}`, {
        method: 'DELETE',
      }),
    reportPost: (id: string, reason: string) =>
      apiFetch<unknown>(`/social/posts/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    reportComment: (id: string, reason: string) =>
      apiFetch<unknown>(`/social/comments/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    hidePost: (id: string) =>
      apiFetch<SocialPost>(`/social/posts/${id}/hide`, { method: 'PATCH' }),
    unhidePost: (id: string) =>
      apiFetch<SocialPost>(`/social/posts/${id}/unhide`, { method: 'PATCH' }),
    hideComment: (id: string) =>
      apiFetch<SocialComment>(`/social/comments/${id}/hide`, { method: 'PATCH' }),
    unhideComment: (id: string) =>
      apiFetch<SocialComment>(`/social/comments/${id}/unhide`, { method: 'PATCH' }),
  },
}

async function authRequest(path: string, body: unknown) {
  const response = await apiFetch<AuthResponse>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  saveTokens(response)
  return response
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'Request failed'
}
