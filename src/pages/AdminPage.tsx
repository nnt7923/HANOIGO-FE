import { Bell, Check, EyeOff, RefreshCw, Shield, Slash, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { EmptyState } from '../components/ui/EmptyState'
import { Field } from '../components/ui/Field'
import { useAuth } from '../features/auth/hooks/useAuth'
import { displayAuthor, displayPlace } from '../lib/display'
import { api, getErrorMessage } from '../services/hanoigo.api'
import type { Place, SafeUser, SocialPost, SubscriptionPlan, SubscriptionStatus, UserRole } from '../types/api.type'

type OwnerRequest = {
  _id: string
  businessName: string
  businessAddress?: string
  contactPhone?: string
  reason?: string
  user?: SafeUser
}

export function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<SafeUser[]>([])
  const [ownerRequests, setOwnerRequests] = useState<OwnerRequest[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [recipient, setRecipient] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  async function load() {
    setError('')
    try {
      const [nextUsers, requests, managedPlaces, feed] = await Promise.all([
        api.users.list({ limit: 50 }),
        api.users.ownerRequests(),
        api.places.manage({ limit: 100 }),
        api.social.feed({ limit: 50 }),
      ])
      setUsers(nextUsers)
      setOwnerRequests(requests as OwnerRequest[])
      setPlaces(managedPlaces)
      setPosts(feed)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') load()
  }, [user])

  if (!user || user.role !== 'admin') return <EmptyState icon={Shield} label="Admin only" />

  async function approveOwner(id: string) {
    try {
      await api.users.approveOwnerRequest(id)
      setStatus('Owner request approved')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function rejectOwner(id: string) {
    try {
      await api.users.rejectOwnerRequest(id)
      setStatus('Owner request rejected')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function updateRole(id: string, role: UserRole) {
    try {
      const next = await api.users.updateRole(id, role)
      setUsers((items) => items.map((item) => (item.id === id ? next : item)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function updateSubscription(id: string, body: {
    subscriptionPlan?: SubscriptionPlan
    subscriptionStatus?: SubscriptionStatus
    monthlyItineraryLimit?: number
    placeLimit?: number
  }) {
    try {
      const next = await api.users.updateSubscription(id, body)
      setUsers((items) => items.map((item) => (item.id === id ? next : item)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function moderatePlace(place: Place, action: 'approve' | 'reject' | 'suspend') {
    try {
      const next = await api.places[action](place.slug || place._id)
      setPlaces((items) => items.map((item) => (item._id === place._id ? next : item)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function hidePost(post: SocialPost) {
    try {
      const next = post.status === 'hidden' ? await api.social.unhidePost(post._id) : await api.social.hidePost(post._id)
      setPosts((items) => items.map((item) => (item._id === post._id ? next : item)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function createNotification(event: FormEvent) {
    event.preventDefault()
    try {
      await api.notifications.create({
        recipient,
        title,
        message,
        type: 'system',
      })
      setStatus('Notification sent')
      setTitle('')
      setMessage('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <section className="page-grid">
      <header className="page-header">
        <div>
          <span className="eyebrow">Operations</span>
          <h1>Admin</h1>
        </div>
        <button className="ghost-button" onClick={load} type="button">
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>
      {error && <p className="surface-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}

      <div className="admin-grid">
        <section className="admin-section">
          <h2>Owner requests</h2>
          <div className="item-list">
            {ownerRequests.map((request) => (
              <article className="compact-item" key={request._id}>
                <strong>{request.businessName}</strong>
                <span>{request.user?.email ?? 'pending user'}</span>
                <span>{request.businessAddress}</span>
                <span>{request.reason}</span>
                <div className="toolbar">
                  <button className="ghost-button slim" onClick={() => approveOwner(request._id)} type="button">
                    <Check size={15} />
                    Approve
                  </button>
                  <button className="ghost-button slim danger" onClick={() => rejectOwner(request._id)} type="button">
                    <X size={15} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2>Users</h2>
          <div className="item-list">
            {users.map((item) => (
              <article className="compact-item" key={item.id}>
                <strong>
                  <Users size={15} />
                  {item.name}
                </strong>
                <span>
                  {item.email} | {item.role} | {item.subscriptionPlan}
                </span>
                <div className="toolbar">
                  <select aria-label="Role" onChange={(event) => updateRole(item.id, event.target.value as UserRole)} value={item.role}>
                    <option value="user">user</option>
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                  </select>
                  <select
                    aria-label="Plan"
                    onChange={(event) => updateSubscription(item.id, { subscriptionPlan: event.target.value as SubscriptionPlan })}
                    value={item.subscriptionPlan}
                  >
                    <option value="free">free</option>
                    <option value="pro">pro</option>
                  </select>
                  <select
                    aria-label="Subscription status"
                    onChange={(event) => updateSubscription(item.id, { subscriptionStatus: event.target.value as SubscriptionStatus })}
                    value={item.subscriptionStatus}
                  >
                    <option value="active">active</option>
                    <option value="canceled">canceled</option>
                    <option value="expired">expired</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2>Places</h2>
          <div className="item-list">
            {places.map((place) => (
              <article className="compact-item" key={place._id}>
                <strong>{place.name}</strong>
                <span>
                  {place.status} | {place.category} | {place.address}
                </span>
                <div className="toolbar">
                  <button className="ghost-button slim" onClick={() => moderatePlace(place, 'approve')} type="button">
                    <Check size={15} />
                    Approve
                  </button>
                  <button className="ghost-button slim danger" onClick={() => moderatePlace(place, 'reject')} type="button">
                    <X size={15} />
                    Reject
                  </button>
                  <button className="ghost-button slim" onClick={() => moderatePlace(place, 'suspend')} type="button">
                    <Slash size={15} />
                    Suspend
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2>Content</h2>
          <div className="item-list">
            {posts.map((post) => (
              <article className="compact-item" key={post._id}>
                <strong>{displayAuthor(post.author)}</strong>
                <span>{displayPlace(post.place)}</span>
                <p>{post.content}</p>
                <span>
                  {post.status} | reports {post.reportCount}
                </span>
                <button className="ghost-button slim" onClick={() => hidePost(post)} type="button">
                  <EyeOff size={15} />
                  {post.status === 'hidden' ? 'Unhide' : 'Hide'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2>Notify user</h2>
          <form className="panel-form" onSubmit={createNotification}>
            <Field label="Recipient user ID" value={recipient} onChange={setRecipient} required />
            <Field label="Title" value={title} onChange={setTitle} required />
            <Field label="Message" value={message} onChange={setMessage} required />
            <button className="primary-button" type="submit">
              <Bell size={16} />
              Send
            </button>
          </form>
        </section>
      </div>
    </section>
  )
}
