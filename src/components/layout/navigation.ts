import { Building2, CalendarDays, Compass, Map, MessageCircle, Package, Shield, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '../../types/api.type'

export type NavigationItem = {
  path: string
  label: string
  icon: LucideIcon
  section: 'discover' | 'planning' | 'account' | 'admin'
  badge?: string
  badgeTone?: 'amber' | 'green'
  auth?: boolean
  roles?: UserRole[]
}

export const navigation: NavigationItem[] = [
  { path: '/discover', label: 'Khám phá', icon: Compass, section: 'discover' },
  { path: '/map', label: 'Bản đồ', icon: Map, section: 'discover' },
  { path: '/community', label: 'Cộng đồng', icon: MessageCircle, section: 'discover' },
  { path: '/itineraries', label: 'Tạo lịch trình', icon: CalendarDays, section: 'planning', badge: 'AI', badgeTone: 'green' },
  { path: '/packages', label: 'Gói dịch vụ', icon: Package, section: 'planning', badge: '2' },
  { path: '/profile', label: 'Hồ sơ', icon: User, section: 'account', auth: true },
  { path: '/owner', label: 'Cổng Owner', icon: Building2, section: 'account', auth: true },
  { path: '/admin', label: 'Admin', icon: Shield, section: 'admin', auth: true, roles: ['admin'] },
]
