import { categoryMeta, discoverCategories } from './discoverMeta'
import type { PlaceCategory } from '../../../types/api.type'

export function CategoryRail({
  activeCategory,
  onSelect,
}: {
  activeCategory: PlaceCategory | ''
  onSelect: (category: PlaceCategory | '') => void
}) {
  return (
    <div className="category-rail" aria-label="Place categories">
      {discoverCategories.map((item) => {
        const key = item || 'all'
        const meta = categoryMeta[key]
        const Icon = meta.icon

        return (
          <button
            className={activeCategory === item ? 'category-chip active' : 'category-chip'}
            key={key}
            onClick={() => onSelect(item)}
            type="button"
          >
            <Icon size={17} />
            <span>{meta.label}</span>
            <small>{meta.description}</small>
          </button>
        )
      })}
    </div>
  )
}
