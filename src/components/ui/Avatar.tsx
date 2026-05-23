import { useMemo } from 'react'

export function Avatar({ name, src, large }: { name: string; src?: string; large?: boolean }) {
  const initials = useMemo(
    () =>
      name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [name],
  )

  return src ? (
    <img className={large ? 'avatar large' : 'avatar'} src={src} alt={name} />
  ) : (
    <span className={large ? 'avatar large' : 'avatar'}>{initials || 'HG'}</span>
  )
}
