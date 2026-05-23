import { Bell, Check, Crown, ImagePlus, KeyRound, LogOut, Map, Route, Sparkles, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'
import { Field } from '../components/ui/Field'
import { Stat } from '../components/ui/Stat'
import { useAuth } from '../features/auth/hooks/useAuth'
import { api, getErrorMessage } from '../services/hanoigo.api'
import type { Notification, SubscriptionPlan } from '../types/api.type'

const subscriptionPlans: Array<{
  id: SubscriptionPlan
  name: string
  price: string
  description: string
  icon: typeof Map
  features: string[]
}> = [
  {
    id: 'free',
    name: 'Free Explorer',
    price: '0 VND',
    description: 'Start saving places and building simple Hanoi plans.',
    icon: Map,
    features: ['Basic place discovery', 'Limited itinerary generations', 'Community reviews'],
  },
  {
    id: 'pro',
    name: 'Pro Traveler',
    price: 'Premium',
    description: 'For frequent trip planning and place management.',
    icon: Crown,
    features: ['Higher itinerary limits', 'More managed places', 'Priority travel planning tools'],
  },
]

export function ProfilePage() {
  const { user, refreshMe, changePassword, logoutAll } = useAuth()
  const [quota, setQuota] = useState<unknown>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [name, setName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setAvatarUrl(user.avatarUrl ?? '')
    api.users.quota().then(setQuota).catch(() => null)
    api.notifications.list({ limit: 10 }).then(setNotifications).catch(() => null)
  }, [user])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setError('')
    setStatus('')
    try {
      let nextAvatar = avatarUrl || undefined
      if (file) {
        const asset = await api.uploads.image(file)
        nextAvatar = asset.secureUrl
      }
      await api.users.updateMe({ name, avatarUrl: nextAvatar })
      await refreshMe()
      setStatus('Profile updated')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault()
    setError('')
    setStatus('')
    try {
      await changePassword(currentPassword, newPassword)
      setStatus('Password changed. Please login again.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function markRead(id: string) {
    try {
      const next = await api.notifications.read(id)
      setNotifications((items) => items.map((item) => (item._id === id ? next : item)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function markAllRead() {
    try {
      setNotifications(await api.notifications.readAll())
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (!user) return <EmptyState icon={User} label="Login required" />

  return (
    <section className="page-grid profile-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Traveler account</span>
          <h1>Profile</h1>
          <p>Manage your identity, travel limits, notifications, and HanoiGo package.</p>
        </div>
      </header>
      {error && <p className="surface-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}
      <div className="profile-layout">
        <aside className="profile-overview">
          <Avatar name={user.name} src={avatarUrl} large />
          <div>
            <span className="eyebrow">Signed in as</span>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <div className="profile-badges">
            <span className="pill">{user.role}</span>
            <span className="pill">{user.subscriptionPlan}</span>
            <span className="pill">{user.subscriptionStatus}</span>
          </div>
          <div className="stat-grid compact-stats">
            <Stat label="Itineraries" value={String(user.itineraryUsageCount)} />
            <Stat label="Place limit" value={String(user.placeLimit)} />
          </div>
        </aside>

        <div className="profile-main">
          <form className="panel-form profile-section-card" onSubmit={saveProfile}>
            <div className="panel-title inline">
              <div>
                <strong>Identity</strong>
                <span>Update the public details shown around HanoiGo.</span>
              </div>
              <User size={18} />
            </div>
            <Field label="Name" value={name} onChange={setName} required />
            <Field label="Avatar URL" value={avatarUrl} onChange={setAvatarUrl} />
            <label className="file-input">
              <ImagePlus size={16} />
              <span>{file ? file.name : 'Upload avatar'}</span>
              <input accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
            </label>
            <button className="primary-button" type="submit">
              <Check size={16} />
              Save
            </button>
          </form>

          <section className="package-section">
            <div className="panel-title inline">
              <div>
                <strong>Packages</strong>
                <span>Choose the travel capacity that fits your Hanoi plans.</span>
              </div>
              <Sparkles size={18} />
            </div>
            <div className="plan-grid">
              {subscriptionPlans.map((plan) => {
                const Icon = plan.icon
                const current = user.subscriptionPlan === plan.id

                return (
                  <article className={current ? 'plan-card current' : 'plan-card'} key={plan.id}>
                    <div className="plan-card-head">
                      <span className="plan-icon">
                        <Icon size={18} />
                      </span>
                      <span className={current ? 'pill compact' : 'metric'}>
                        {current ? 'Current plan' : 'Available'}
                      </span>
                    </div>
                    <div>
                      <h2>{plan.name}</h2>
                      <p>{plan.description}</p>
                    </div>
                    <strong className="plan-price">{plan.price}</strong>
                    <ul className="plan-features">
                      {plan.features.map((feature) => (
                        <li key={feature}>
                          <Route size={14} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </section>

          <form className="panel-form profile-section-card" onSubmit={submitPassword}>
            <div className="panel-title inline">
              <div>
                <strong>Security</strong>
                <span>Change password or end sessions on every device.</span>
              </div>
              <KeyRound size={18} />
            </div>
            <Field label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} required />
            <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} required />
            <button className="ghost-button" type="submit">
              <KeyRound size={16} />
              Change
            </button>
            <button className="ghost-button" onClick={logoutAll} type="button">
              <LogOut size={16} />
              Logout all
            </button>
          </form>
          <section className="profile-section-card">
            <div className="panel-title inline">
              <div>
                <strong>Notifications</strong>
                <span>System, review, itinerary, and subscription updates.</span>
              </div>
              <button className="ghost-button slim" onClick={markAllRead} type="button">
                <Check size={15} />
                Read all
              </button>
            </div>
            {quota ? <pre className="json-panel">{JSON.stringify(quota, null, 2)}</pre> : null}
            <div className="item-list">
              {notifications.map((item) => (
                <article className="compact-item" key={item._id}>
                  <strong>
                    <Bell size={15} />
                    {item.title}
                  </strong>
                  <span>{item.message}</span>
                  <span>{item.readAt ? 'read' : 'unread'}</span>
                  {!item.readAt && (
                    <button className="ghost-button slim" onClick={() => markRead(item._id)} type="button">
                      <Check size={15} />
                      Read
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
