import { Building2, CalendarDays, Compass, MessageCircle, Shield, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '../../types/api.type'

export type NavigationItem = {
  path: string
  label: string
  icon: LucideIcon
  auth?: boolean
  roles?: UserRole[]
}

export const navigation: NavigationItem[] = [
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/itineraries', label: 'Itinerary', icon: CalendarDays },
  { path: '/community', label: 'Community', icon: MessageCircle },
  { path: '/profile', label: 'Profile', icon: User, auth: true },
  { path: '/owner', label: 'Owner', icon: Building2, auth: true },
  { path: '/admin', label: 'Admin', icon: Shield, auth: true, roles: ['admin'] },
]
