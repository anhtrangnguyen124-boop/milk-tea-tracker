import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function LiquidGlass({ children, className = '' }: Props) {
  return (
    <div className={`liquid-glass ${className}`}>
      {children}
    </div>
  )
}
