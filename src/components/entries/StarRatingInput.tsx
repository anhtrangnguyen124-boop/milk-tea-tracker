import { useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  value: number | null
  onChange: (rating: number | null) => void
}

export function StarRatingInput({ value, onChange }: Props) {
  const [hover, setHover] = useState<number | null>(null)

  const displayValue = hover ?? value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          className="transition-transform hover:scale-125 active:scale-95"
        >
          <Star
            size={28}
            className={
              displayValue && star <= displayValue
                ? 'fill-milk-accent text-milk-accent drop-shadow-sm'
                : 'fill-none text-milk-border'
            }
          />
        </button>
      ))}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-2 text-xs text-milk-text-muted hover:text-milk-text-secondary transition-colors"
        >
          清除
        </button>
      )}
    </div>
  )
}
