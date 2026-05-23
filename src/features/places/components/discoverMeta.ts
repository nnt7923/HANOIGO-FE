import {
  Bed,
  Bus,
  Coffee,
  Compass,
  Landmark,
  Laptop,
  Map,
  Utensils,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PlaceCategory } from '../../../types/api.type'

export const discoverCategories: Array<PlaceCategory | ''> = [
  '',
  'food',
  'cafe',
  'stay',
  'attraction',
  'workspace',
  'transport',
  'other',
]

export const categoryMeta: Record<PlaceCategory | 'all', {
  label: string
  description: string
  icon: LucideIcon
}> = {
  all: { label: 'All', description: 'Everything nearby', icon: Compass },
  food: { label: 'Food', description: 'Local meals', icon: Utensils },
  cafe: { label: 'Cafe', description: 'Coffee stops', icon: Coffee },
  stay: { label: 'Stay', description: 'Hotels and homestays', icon: Bed },
  attraction: { label: 'Attractions', description: 'Landmarks and culture', icon: Landmark },
  workspace: { label: 'Workspaces', description: 'Laptop-friendly spots', icon: Laptop },
  transport: { label: 'Transport', description: 'Getting around', icon: Bus },
  other: { label: 'Other', description: 'More places', icon: Map },
}
