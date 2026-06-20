import { Star } from 'lucide-react'

interface Props {
  rating: number | null
  size?: number
}

export function StarRating({ rating, size = 16 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            rating && star <= rating
              ? 'fill-milk-accent text-milk-accent star-glow'
              : 'fill-none text-milk-border'
          }
        />
      ))}
      {rating === null && (
        <span className="text-xs text-milk-text-muted ml-1">未评分</span>
      )}
    </div>
  )
}
