import { Bell, Check, ImagePlus, KeyRound, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'
import { Field } from '../components/ui/Field'
import { Stat } from '../components/ui/Stat'
import { useAuth } from '../features/auth/hooks/useAuth'
import { api, getErrorMessage } from '../services/hanoigo.api'
import type { Notification } from '../types/api.type'

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
    <section className="page-grid">
      <header className="page-header">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Profile</h1>
        </div>
      </header>
      {error && <p className="surface-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}
      <div className="split-layout">
        <div className="detail-column">
          <form className="panel-form" onSubmit={saveProfile}>
            <Avatar name={user.name} src={avatarUrl} large />
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

          <form className="panel-form" onSubmit={submitPassword}>
            <strong>
              <KeyRound size={15} />
              Change password
            </strong>
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
        </div>

        <div className="detail-column">
          <div className="stat-grid">
            <Stat label="Plan" value={user.subscriptionPlan} />
            <Stat label="Status" value={user.subscriptionStatus} />
            <Stat label="Itineraries" value={String(user.itineraryUsageCount)} />
            <Stat label="Place limit" value={String(user.placeLimit)} />
          </div>
          {quota ? <pre className="json-panel">{JSON.stringify(quota, null, 2)}</pre> : null}
          <div className="toolbar">
            <button className="ghost-button slim" onClick={markAllRead} type="button">
              <Check size={15} />
              Read all
            </button>
          </div>
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
        </div>
      </div>
    </section>
  )
}
