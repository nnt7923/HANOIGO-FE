import { Coffee, MapPin, Route, Star } from 'lucide-react'

export function AuthHero({ mode }: { mode: 'login' | 'register' }) {
  return (
    <aside className="auth-hero" aria-label="HanoiGo travel preview">
      <div>
        <span className="eyebrow">HanoiGo travel map</span>
        <h1>{mode === 'login' ? 'Return to your Hanoi routes.' : 'Start mapping your Hanoi story.'}</h1>
        <p>
          Save places, plan cafe runs, follow local tips, and keep your favorite Hanoi stops in one travel workspace.
        </p>
      </div>

      <div className="auth-map-scene">
        <span className="route-line route-line-a" />
        <span className="route-line route-line-b" />
        <div className="map-pin-preview pin-one">
          <MapPin size={16} />
          Old Quarter
        </div>
        <div className="map-pin-preview pin-two">
          <Coffee size={16} />
          Cafe stop
        </div>
        <div className="map-pin-preview pin-three">
          <Star size={16} />
          Local pick
        </div>
      </div>

      <div className="auth-preview-card">
        <div>
          <span className="plan-icon">
            <Route size={18} />
          </span>
          <div>
            <strong>Weekend route</strong>
            <span>4 stops | food, coffee, culture</span>
          </div>
        </div>
        <div className="auth-preview-metrics">
          <span>4.8 avg rating</span>
          <span>2 day plan</span>
        </div>
      </div>
    </aside>
  )
}
