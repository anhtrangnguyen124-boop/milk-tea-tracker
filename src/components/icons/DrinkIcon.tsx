import type { ReactElement } from 'react'

export type DrinkType =
  | 'juice'
  | 'lime_tea'
  | 'coffee_cup'
  | 'milktea'
  | 'americano'
  | 'beer'
  | 'matcha'
  | 'sundae'
  | 'martini'

interface Props {
  type: DrinkType
  size?: number
}

const strokeProps = {
  stroke: '#2C2C2C',
  strokeWidth: '3.5',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
}

function Juice() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glass body */}
      <rect x="28" y="40" width="44" height="45" rx="6" fill="#FF8C42" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Glass shine */}
      <line x1="36" y1="48" x2="36" y2="72" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
      {/* Bent straw */}
      <path d="M54 30 L54 18 Q54 8 46 8 L42 8" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Straw end in glass */}
      <line x1="54" y1="30" x2="54" y2="55" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Liquid surface */}
      <line x1="30" y1="52" x2="70" y2="52" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      {/* Ice cubes */}
      <rect x="38" y="56" width="10" height="10" rx="2" fill="white" stroke="#2C2C2C" strokeWidth="2" opacity="0.8"/>
      <rect x="54" y="62" width="10" height="10" rx="2" fill="white" stroke="#2C2C2C" strokeWidth="2" opacity="0.8"/>
      {/* Glass base */}
      <line x1="32" y1="85" x2="68" y2="85" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

function LimeTea() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tall glass */}
      <rect x="30" y="30" width="40" height="55" rx="5" fill="#B8E6A0" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Glass shine */}
      <line x1="38" y1="38" x2="38" y2="72" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
      {/* Lime wheel on rim */}
      <circle cx="72" cy="35" r="10" fill="#D4F5C0" stroke="#2C2C2C" strokeWidth="3"/>
      {/* Lime segments */}
      <line x1="72" y1="25" x2="72" y2="45" stroke="#2C2C2C" strokeWidth="1.5"/>
      <line x1="62" y1="35" x2="82" y2="35" stroke="#2C2C2C" strokeWidth="1.5"/>
      <line x1="65" y1="28" x2="79" y2="42" stroke="#2C2C2C" strokeWidth="1.2"/>
      <line x1="65" y1="42" x2="79" y2="28" stroke="#2C2C2C" strokeWidth="1.2"/>
      {/* Lime center dot */}
      <circle cx="72" cy="35" r="2" fill="#2C2C2C"/>
      {/* Liquid surface */}
      <line x1="32" y1="45" x2="70" y2="45" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      {/* Ice */}
      <rect x="42" y="50" width="10" height="10" rx="2" fill="white" stroke="#2C2C2C" strokeWidth="2" opacity="0.7"/>
      <rect x="56" y="55" width="11" height="11" rx="2" fill="white" stroke="#2C2C2C" strokeWidth="2" opacity="0.7"/>
      {/* Base */}
      <line x1="33" y1="85" x2="67" y2="85" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

function CoffeeCup() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body - trapezoid */}
      <path d="M28 30 L34 70 L66 70 L72 30 Z" fill="#2C2C2C" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Cup lid - wider top */}
      <rect x="24" y="22" width="52" height="12" rx="6" fill="#3A3A3A" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Lid top line */}
      <line x1="28" y1="22" x2="72" y2="22" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Lid sip hole */}
      <ellipse cx="50" cy="28" rx="5" ry="2.5" fill="#1A1A1A" stroke="#2C2C2C" strokeWidth="1.5"/>
      {/* Cup sleeve/wrapper */}
      <rect x="32" y="48" width="36" height="16" rx="4" fill="#5A4030" stroke="#2C2C2C" strokeWidth="2.5" strokeLinejoin="round"/>
      {/* Sleeve detail */}
      <line x1="36" y1="56" x2="64" y2="56" stroke="#2C2C2C" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  )
}

function MilkTea() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body */}
      <path d="M26 38 L30 78 C30 82 31 84 34 84 L66 84 C69 84 70 82 70 78 L74 38 Z"
            fill="#F5E6D3" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Dome lid */}
      <path d="M24 38 Q50 20 76 38" fill="#E8D5C0" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Lid rim */}
      <ellipse cx="50" cy="38" rx="26" ry="4" fill="#EDDCC8" stroke="#2C2C2C" strokeWidth="3"/>
      {/* Straw */}
      <line x1="54" y1="10" x2="54" y2="68" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Straw top highlight */}
      <line x1="54" y1="10" x2="54" y2="18" stroke="#555" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Pearls at bottom */}
      <circle cx="36" cy="76" r="4" fill="#2C2C2C"/>
      <circle cx="44" cy="78" r="4.5" fill="#2C2C2C"/>
      <circle cx="52" cy="77" r="3.8" fill="#2C2C2C"/>
      <circle cx="60" cy="78" r="4.2" fill="#2C2C2C"/>
      <circle cx="66" cy="76" r="3.5" fill="#2C2C2C"/>
      <circle cx="40" cy="73" r="3" fill="#2C2C2C"/>
      {/* Cup body shine */}
      <line x1="38" y1="48" x2="38" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

function Americano() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body */}
      <path d="M32 30 L28 72 L72 72 L68 30 Z" fill="#FDF5E6" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Cup rim */}
      <ellipse cx="50" cy="30" rx="20" ry="4" fill="#FFFDF5" stroke="#2C2C2C" strokeWidth="3"/>
      {/* Striped lid */}
      <rect x="30" y="18" width="40" height="16" rx="4" fill="#3A3028" stroke="#2C2C2C" strokeWidth="3" strokeLinejoin="round"/>
      <line x1="32" y1="24" x2="68" y2="24" stroke="#2C2C2C" strokeWidth="2" />
      <line x1="31" y1="30" x2="69" y2="30" stroke="#2C2C2C" strokeWidth="2" />
      {/* Lid top */}
      <rect x="34" y="14" width="32" height="6" rx="3" fill="#4A4038" stroke="#2C2C2C" strokeWidth="2.5" strokeLinejoin="round"/>
      {/* Label area */}
      <ellipse cx="50" cy="50" rx="14" ry="10" fill="#C86A4B" stroke="#2C2C2C" strokeWidth="2.5"/>
      {/* Coffee bean icon on label */}
      <ellipse cx="48" cy="49" rx="4" ry="3" fill="#2C2C2C"/>
      <ellipse cx="53" cy="51" rx="4" ry="3" fill="#2C2C2C"/>
      {/* S-curve on bean */}
      <path d="M46 47 Q50 52 54 52" stroke="#C86A4B" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Cup bottom */}
      <line x1="30" y1="72" x2="70" y2="72" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

function Beer() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glass body */}
      <path d="M22 25 L26 80 L74 80 L78 25 Z" fill="#F5C842" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Handle */}
      <path d="M78 35 Q92 35 92 50 Q92 65 78 65" fill="none" stroke="#2C2C2C" strokeWidth="4" strokeLinecap="round"/>
      {/* Glass rim */}
      <ellipse cx="50" cy="25" rx="28" ry="5" fill="#FDE68A" stroke="#2C2C2C" strokeWidth="3"/>
      {/* Foam / head */}
      <path d="M26 35 Q30 28 40 30 Q50 25 60 30 Q70 28 74 35" fill="white" stroke="#2C2C2C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      {/* Bubbles */}
      <circle cx="38" cy="50" r="3" fill="white" stroke="#2C2C2C" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="50" cy="58" r="2.5" fill="white" stroke="#2C2C2C" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="62" cy="48" r="2" fill="white" stroke="#2C2C2C" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="44" cy="65" r="2.5" fill="white" stroke="#2C2C2C" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="58" cy="68" r="3" fill="white" stroke="#2C2C2C" strokeWidth="1.5" opacity="0.5"/>
      {/* Glass shine */}
      <line x1="34" y1="40" x2="34" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

function Matcha() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mug body - short and wide */}
      <path d="M25 35 L28 75 C28 78 30 80 33 80 L67 80 C70 80 72 78 72 75 L75 35 Z"
            fill="#8B9E6B" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Mug handle */}
      <path d="M75 42 Q90 42 90 55 Q90 68 75 65" fill="none" stroke="#2C2C2C" strokeWidth="4" strokeLinecap="round"/>
      {/* Mug rim */}
      <ellipse cx="50" cy="35" rx="25" ry="5" fill="#9DB87A" stroke="#2C2C2C" strokeWidth="3"/>
      {/* Liquid surface */}
      <ellipse cx="50" cy="40" rx="23" ry="4" fill="#7A8E5A" stroke="#2C2C2C" strokeWidth="2"/>
      {/* Steam lines */}
      <path d="M40 28 Q38 16 42 8" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M50 24 Q48 12 52 4" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M60 28 Q58 16 62 8" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Cup shine */}
      <line x1="36" y1="48" x2="36" y2="66" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    </svg>
  )
}

function Sundae() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tall glass */}
      <path d="M28 50 L30 86 L70 86 L72 50 Z" fill="#F4A3A8" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Glass rim */}
      <ellipse cx="50" cy="50" rx="22" ry="5" fill="#F7BCC0" stroke="#2C2C2C" strokeWidth="3"/>
      {/* Ice cream scoop 1 (bottom) */}
      <circle cx="50" cy="42" r="14" fill="#FFF8E7" stroke="#2C2C2C" strokeWidth="3.5"/>
      {/* Ice cream scoop 2 (top) */}
      <circle cx="50" cy="28" r="11" fill="#FDE0C8" stroke="#2C2C2C" strokeWidth="3.5"/>
      {/* Cherry on top */}
      <circle cx="54" cy="20" r="5" fill="#E84545" stroke="#2C2C2C" strokeWidth="2.5"/>
      <line x1="54" y1="15" x2="56" y2="10" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round"/>
      {/* Straw */}
      <line x1="62" y1="16" x2="72" y2="55" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round"/>
      {/* Spoon */}
      <line x1="32" y1="22" x2="28" y2="48" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="33" cy="20" rx="5" ry="3" fill="#E8D5C0" stroke="#2C2C2C" strokeWidth="2"/>
      {/* Glass shine */}
      <line x1="38" y1="58" x2="38" y2="76" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

function Martini() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glass - inverted triangle */}
      <path d="M25 25 L50 58 L75 25" fill="#B8E0F0" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Glass rim */}
      <line x1="25" y1="25" x2="75" y2="25" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Stem */}
      <line x1="50" y1="58" x2="50" y2="78" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Base */}
      <ellipse cx="50" cy="82" rx="16" ry="4" fill="none" stroke="#2C2C2C" strokeWidth="3.5"/>
      {/* Straw */}
      <line x1="48" y1="18" x2="38" y2="46" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round"/>
      {/* Straw top bend */}
      <path d="M48 18 Q54 10 44 10" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Ice ball */}
      <circle cx="52" cy="38" r="7" fill="white" stroke="#2C2C2C" strokeWidth="2.5" opacity="0.85"/>
      {/* Ice shine */}
      <circle cx="50" cy="36" r="2" fill="#2C2C2C" opacity="0.3"/>
      {/* Liquid highlight */}
      <line x1="38" y1="30" x2="38" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

const icons: Record<DrinkType, () => ReactElement> = {
  juice: Juice,
  lime_tea: LimeTea,
  coffee_cup: CoffeeCup,
  milktea: MilkTea,
  americano: Americano,
  beer: Beer,
  matcha: Matcha,
  sundae: Sundae,
  martini: Martini,
}

export function DrinkIcon({ type, size = 80 }: Props) {
  const Icon = icons[type]
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <Icon />
    </div>
  )
}

// Default icon set for quick random selection
export const drinkTypes: DrinkType[] = [
  'milktea', 'juice', 'lime_tea', 'coffee_cup',
  'americano', 'beer', 'matcha', 'sundae', 'martini',
]

// Pick a random icon based on drink name
export function pickDrinkType(name: string): DrinkType {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash |= 0
  }
  return drinkTypes[Math.abs(hash) % drinkTypes.length]
}
