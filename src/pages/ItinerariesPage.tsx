import { BookOpen, CalendarDays, Eye, RefreshCw, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Field } from '../components/ui/Field'
import { useAuth } from '../features/auth/hooks/useAuth'
import { api, getErrorMessage } from '../services/hanoigo.api'
import type { Itinerary, ItineraryVisibility } from '../types/api.type'

export function ItinerariesPage() {
  const { user } = useAuth()
  const [area, setArea] = useState('Hoa Lac, Hanoi')
  const [days, setDays] = useState(2)
  const [budgetVnd, setBudgetVnd] = useState(1000000)
  const [preferences, setPreferences] = useState('cafe, local food, study')
  const [longitude, setLongitude] = useState('')
  const [latitude, setLatitude] = useState('')
  const [radiusMeters, setRadiusMeters] = useState('10000')
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [myItems, setMyItems] = useState<Itinerary[]>([])
  const [publicItems, setPublicItems] = useState<Itinerary[]>([])
  const [view, setView] = useState<'current' | 'mine' | 'public'>('current')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadLists() {
    try {
      const [publicList, mine] = await Promise.all([
        api.itineraries.publicList({ limit: 12 }),
        user ? api.itineraries.mine({ limit: 20 }) : Promise.resolve([]),
      ])
      setPublicItems(publicList)
      setMyItems(mine)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    loadLists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function generate(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.itineraries.generate({
        area,
        days,
        budgetVnd,
        preferences: preferences.split(',').map((item) => item.trim()).filter(Boolean),
        longitude: longitude ? Number(longitude) : undefined,
        latitude: latitude ? Number(latitude) : undefined,
        radiusMeters: radiusMeters ? Number(radiusMeters) : undefined,
      })
      setItinerary(data)
      setMyItems((items) => [data, ...items])
      setView('current')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function clone(id: string) {
    try {
      const next = await api.itineraries.clone(id)
      setItinerary(next)
      setMyItems((items) => [next, ...items])
      setView('current')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function updateVisibility(id: string, visibility: ItineraryVisibility) {
    try {
      const next = await api.itineraries.updateVisibility(id, visibility)
      setItinerary((current) => (current?._id === id ? next : current))
      setMyItems((items) => items.map((item) => (item._id === id ? next : item)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <section className="page-grid">
      <header className="page-header">
        <div>
          <span className="eyebrow">Personal routes</span>
          <h1>Plan a Hanoi route</h1>
        </div>
        <div className="segmented compact-tabs">
          <button className={view === 'current' ? 'selected' : ''} onClick={() => setView('current')} type="button">
            Current
          </button>
          <button className={view === 'mine' ? 'selected' : ''} disabled={!user} onClick={() => setView('mine')} type="button">
            Mine
          </button>
          <button className={view === 'public' ? 'selected' : ''} onClick={() => setView('public')} type="button">
            Public
          </button>
        </div>
      </header>

      {error && <p className="surface-error">{error}</p>}

      <div className="split-layout planner">
        <form className="panel-form" onSubmit={generate}>
          <Field label="Area" value={area} onChange={setArea} required />
          <div className="two-col">
            <Field label="Days" min={1} type="number" value={String(days)} onChange={(value) => setDays(Number(value))} />
            <Field label="Budget VND" min={0} type="number" value={String(budgetVnd)} onChange={(value) => setBudgetVnd(Number(value))} />
          </div>
          <Field label="Preferences" value={preferences} onChange={setPreferences} />
          <div className="two-col">
            <Field label="Longitude" value={longitude} onChange={setLongitude} />
            <Field label="Latitude" value={latitude} onChange={setLatitude} />
          </div>
          <Field label="Radius meters" type="number" value={radiusMeters} onChange={setRadiusMeters} />
          <button className="primary-button" disabled={!user || loading} type="submit">
            <Sparkles size={16} />
            {loading ? 'Generating' : 'Generate'}
          </button>
          <button className="ghost-button" onClick={loadLists} type="button">
            <RefreshCw size={16} />
            Refresh
          </button>
        </form>

        <div className="detail-column">
          {view === 'current' && itinerary && (
            <ItineraryView itinerary={itinerary} onVisibilityChange={updateVisibility} />
          )}
          {view === 'current' && !itinerary && (
            <div className="item-list">
              {publicItems.map((item) => (
                <ItineraryListItem item={item} key={item._id} onClone={user ? clone : undefined} />
              ))}
            </div>
          )}
          {view === 'mine' && (
            <div className="item-list">
              {myItems.map((item) => (
                <ItineraryListItem
                  item={item}
                  key={item._id}
                  onSelect={(selected) => {
                    setItinerary(selected)
                    setView('current')
                  }}
                  onVisibilityChange={updateVisibility}
                />
              ))}
            </div>
          )}
          {view === 'public' && (
            <div className="item-list">
              {publicItems.map((item) => (
                <ItineraryListItem item={item} key={item._id} onClone={user ? clone : undefined} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ItineraryListItem({
  item,
  onClone,
  onSelect,
  onVisibilityChange,
}: {
  item: Itinerary
  onClone?: (id: string) => void
  onSelect?: (item: Itinerary) => void
  onVisibilityChange?: (id: string, visibility: ItineraryVisibility) => void
}) {
  return (
    <article className="compact-item">
      <strong>{item.title}</strong>
      <span>
        {item.area} | {item.days} days | {item.cloneCount} clones | {item.visibility}
      </span>
      <div className="toolbar">
        {onSelect && (
          <button className="ghost-button slim" onClick={() => onSelect(item)} type="button">
            <Eye size={15} />
            Open
          </button>
        )}
        {onClone && (
          <button className="ghost-button slim" onClick={() => onClone(item._id)} type="button">
            <BookOpen size={15} />
            Clone
          </button>
        )}
        {onVisibilityChange && (
          <select
            aria-label="Visibility"
            onChange={(event) => onVisibilityChange(item._id, event.target.value as ItineraryVisibility)}
            value={item.visibility}
          >
            <option value="private">private</option>
            <option value="public">public</option>
            <option value="unlisted">unlisted</option>
          </select>
        )}
      </div>
    </article>
  )
}

function ItineraryView({
  itinerary,
  onVisibilityChange,
}: {
  itinerary: Itinerary
  onVisibilityChange: (id: string, visibility: ItineraryVisibility) => void
}) {
  return (
    <div className="itinerary-view">
      <div>
        <span className="pill">{itinerary.source}</span>
        <h2>{itinerary.title}</h2>
        <p>{itinerary.plan.summary}</p>
        <div className="toolbar">
          <select
            aria-label="Visibility"
            onChange={(event) => onVisibilityChange(itinerary._id, event.target.value as ItineraryVisibility)}
            value={itinerary.visibility}
          >
            <option value="private">private</option>
            <option value="public">public</option>
            <option value="unlisted">unlisted</option>
          </select>
        </div>
      </div>
      {itinerary.plan.days?.map((day) => (
        <article className="day-block" key={day.day}>
          <strong>
            <CalendarDays size={15} />
            Day {day.day}: {day.theme}
          </strong>
          {day.items.map((item) => (
            <div className="timeline-item" key={`${day.day}-${item.time}-${item.placeName}`}>
              <span>{item.time}</span>
              <div>
                <strong>{item.placeName}</strong>
                <p>{item.activity}</p>
              </div>
            </div>
          ))}
        </article>
      ))}
    </div>
  )
}
