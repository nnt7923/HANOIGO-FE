import type { LucideIcon } from 'lucide-react'

export function EmptyState({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="empty-state">
      <Icon size={28} />
      <span>{label}</span>
    </div>
  )
}
