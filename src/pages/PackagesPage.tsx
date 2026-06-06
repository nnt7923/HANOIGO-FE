import { Check, Crown, Map, Route, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import type { SubscriptionPlan } from '../types/api.type'

const packages: Array<{
  id: SubscriptionPlan
  badge: string
  name: string
  price: string
  description: string
  icon: typeof Map
  features: string[]
}> = [
  {
    id: 'free',
    badge: 'Free',
    name: 'Free Explorer',
    price: '0 VND',
    description: 'For casual discovery, saved places, and simple route planning around Hanoi.',
    icon: Map,
    features: ['Basic place discovery', 'Community browsing and reviews', 'Limited itinerary generations'],
  },
  {
    id: 'pro',
    badge: 'Popular',
    name: 'Pro Traveler',
    price: 'Premium',
    description: 'For frequent planners, creators, and owners managing more places and trips.',
    icon: Crown,
    features: ['Higher itinerary limits', 'More managed places', 'Priority planning tools'],
  },
]

export function PackagesPage() {
  const { user } = useAuth()

  return (
    <section className="page-grid packages-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Travel packages</span>
          <h1>Gói dịch vụ</h1>
          <p>Choose the HanoiGo capacity that fits how often you plan routes, save places, and manage listings.</p>
        </div>
      </header>

      <div className="plan-grid">
        {packages.map((item) => {
          const Icon = item.icon
          const current = user?.subscriptionPlan === item.id

          return (
            <article className={current ? 'plan-card current' : 'plan-card'} key={item.id}>
              <div className="plan-card-head">
                <span className="plan-icon">
                  <Icon size={18} />
                </span>
                <span className={current ? 'pill compact' : 'metric'}>{current ? 'Current plan' : item.badge}</span>
              </div>
              <div>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
              </div>
              <strong className="plan-price">{item.price}</strong>
              <ul className="plan-features">
                {item.features.map((feature) => (
                  <li key={feature}>
                    <Check size={14} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link className={current ? 'ghost-button' : 'primary-button'} to={user ? '/profile' : '/login'}>
                {current ? (
                  <>
                    <Route size={16} />
                    Manage
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {user ? 'Select package' : 'Login to choose'}
                  </>
                )}
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
