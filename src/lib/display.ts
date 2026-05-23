import type { Review, SocialPost } from '../types/api.type'

export function displayAuthor(value: SocialPost['author'] | Review['user']) {
  return typeof value === 'string' ? value : value.name
}

export function displayPlace(value: SocialPost['place']) {
  return typeof value === 'string' ? value : value.name
}

export function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
