import { MapPin } from 'lucide-react'

export function ImageStrip({
  images,
  name,
  large,
}: {
  images: string[]
  name: string
  large?: boolean
}) {
  const first = images?.[0]

  return first ? (
    <img className={large ? 'image-strip large' : 'image-strip'} src={first} alt={name} />
  ) : (
    <div className={large ? 'image-strip large placeholder' : 'image-strip placeholder'}>
      <MapPin size={large ? 28 : 18} />
    </div>
  )
}
