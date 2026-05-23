import { Building2, Check, ImagePlus, Pencil, Send, Trash2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { EmptyState } from '../components/ui/EmptyState'
import { Field } from '../components/ui/Field'
import { ImageStrip } from '../components/ui/ImageStrip'
import { useAuth } from '../features/auth/hooks/useAuth'
import { splitCsv } from '../lib/display'
import { api, getErrorMessage } from '../services/hanoigo.api'
import type { Place, PlaceCategory } from '../types/api.type'

const categories: PlaceCategory[] = [
  'food',
  'cafe',
  'stay',
  'attraction',
  'workspace',
  'transport',
  'other',
]

type PlaceFormState = {
  name: string
  description: string
  category: PlaceCategory
  address: string
  longitude: string
  latitude: string
  tags: string
  images: string
  openingHours: string
}

const emptyPlaceForm: PlaceFormState = {
  name: '',
  description: '',
  category: 'cafe',
  address: '',
  longitude: '105.525',
  latitude: '21.013',
  tags: '',
  images: '',
  openingHours: '',
}

export function OwnerDashboardPage() {
  const { user } = useAuth()
  const [places, setPlaces] = useState<Place[]>([])
  const [editing, setEditing] = useState<Place | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [reason, setReason] = useState('')
  const [placeForm, setPlaceForm] = useState<PlaceFormState>(emptyPlaceForm)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  async function loadManaged() {
    if (!user || !['owner', 'admin'].includes(user.role)) return
    try {
      setPlaces(await api.places.manage({ limit: 50 }))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    loadManaged()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) return <EmptyState icon={User} label="Login required" />

  async function submitOwnerRequest(event: FormEvent) {
    event.preventDefault()
    setError('')
    setStatus('')
    try {
      await api.users.ownerRequest({
        businessName,
        businessAddress,
        contactPhone,
        reason,
      })
      setReason('')
      setStatus('Owner request sent')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function submitPlace(event: FormEvent) {
    event.preventDefault()
    setError('')
    setStatus('')
    try {
      const uploaded = files.length > 0 ? await api.uploads.images(files) : []
      const images = [...splitCsv(placeForm.images), ...uploaded.map((asset) => asset.secureUrl)]
      const body = {
        name: placeForm.name,
        description: placeForm.description,
        category: placeForm.category,
        address: placeForm.address,
        longitude: Number(placeForm.longitude),
        latitude: Number(placeForm.latitude),
        tags: splitCsv(placeForm.tags),
        images,
        openingHours: parseOpeningHours(placeForm.openingHours),
      }

      if (editing) {
        await api.places.update(editing.slug || editing._id, body)
        setStatus('Place updated')
      } else {
        await api.places.create(body)
        setStatus('Place created')
      }

      setEditing(null)
      setPlaceForm(emptyPlaceForm)
      setFiles([])
      await loadManaged()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function deletePlace(place: Place) {
    setError('')
    try {
      await api.places.remove(place.slug || place._id)
      setPlaces((items) => items.filter((item) => item._id !== place._id))
      setStatus('Place deleted')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  function startEdit(place: Place) {
    const [longitude, latitude] = place.location?.coordinates ?? [105.525, 21.013]
    setEditing(place)
    setPlaceForm({
      name: place.name,
      description: place.description,
      category: place.category,
      address: place.address,
      longitude: String(longitude),
      latitude: String(latitude),
      tags: place.tags.join(', '),
      images: place.images.join(', '),
      openingHours: place.openingHours
        ? Object.entries(place.openingHours).map(([day, hours]) => `${day}=${hours}`).join(', ')
        : '',
    })
  }

  return (
    <section className="page-grid">
      <header className="page-header">
        <div>
          <span className="eyebrow">Owner workspace</span>
          <h1>Places</h1>
        </div>
      </header>
      {error && <p className="surface-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}
      {user.role === 'user' ? (
        <form className="panel-form narrow" onSubmit={submitOwnerRequest}>
          <Field label="Business name" value={businessName} onChange={setBusinessName} required />
          <Field label="Business address" value={businessAddress} onChange={setBusinessAddress} required />
          <Field label="Contact phone" value={contactPhone} onChange={setContactPhone} required />
          <Field label="Reason" value={reason} onChange={setReason} required />
          <button className="primary-button" type="submit">
            <Send size={16} />
            Submit
          </button>
        </form>
      ) : (
        <div className="split-layout">
          <form className="panel-form" onSubmit={submitPlace}>
            <strong>{editing ? 'Edit place' : 'Create place'}</strong>
            <Field label="Name" value={placeForm.name} onChange={(value) => setPlaceForm({ ...placeForm, name: value })} required />
            <Field label="Description" value={placeForm.description} onChange={(value) => setPlaceForm({ ...placeForm, description: value })} required />
            <select aria-label="Category" onChange={(event) => setPlaceForm({ ...placeForm, category: event.target.value as PlaceCategory })} value={placeForm.category}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Field label="Address" value={placeForm.address} onChange={(value) => setPlaceForm({ ...placeForm, address: value })} required />
            <div className="two-col">
              <Field label="Longitude" value={placeForm.longitude} onChange={(value) => setPlaceForm({ ...placeForm, longitude: value })} />
              <Field label="Latitude" value={placeForm.latitude} onChange={(value) => setPlaceForm({ ...placeForm, latitude: value })} />
            </div>
            <Field label="Tags CSV" value={placeForm.tags} onChange={(value) => setPlaceForm({ ...placeForm, tags: value })} />
            <Field label="Images CSV" value={placeForm.images} onChange={(value) => setPlaceForm({ ...placeForm, images: value })} />
            <Field label="Opening hours day=hours CSV" value={placeForm.openingHours} onChange={(value) => setPlaceForm({ ...placeForm, openingHours: value })} />
            <label className="file-input">
              <ImagePlus size={16} />
              <span>{files.length > 0 ? `${files.length} images selected` : 'Upload images'}</span>
              <input accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} type="file" />
            </label>
            <div className="toolbar">
              <button className="primary-button compact" type="submit">
                <Building2 size={16} />
                {editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button
                  className="ghost-button slim"
                  onClick={() => {
                    setEditing(null)
                    setPlaceForm(emptyPlaceForm)
                  }}
                  type="button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          <div className="item-list">
            {places.map((place) => (
              <article className="compact-item place-manage-item" key={place._id}>
                <ImageStrip images={place.images} name={place.name} />
                <div>
                  <strong>{place.name}</strong>
                  <span>
                    {place.status} | {place.address}
                  </span>
                  {place.moderationReason && <span>{place.moderationReason}</span>}
                  <div className="toolbar">
                    <button className="ghost-button slim" onClick={() => startEdit(place)} type="button">
                      <Pencil size={15} />
                      Edit
                    </button>
                    <button className="ghost-button slim danger" onClick={() => deletePlace(place)} type="button">
                      <Trash2 size={15} />
                      Delete
                    </button>
                    {place.status === 'published' && (
                      <span className="metric">
                        <Check size={15} />
                        Public
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function parseOpeningHours(value: string) {
  const entries = splitCsv(value)
    .map((item) => item.split('='))
    .filter((parts) => parts.length === 2)
    .map(([key, hours]) => [key.trim(), hours.trim()])

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}
