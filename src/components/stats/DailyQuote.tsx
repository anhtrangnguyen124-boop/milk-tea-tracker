import { useState, useMemo } from 'react'

const QUOTES = [
  { text: '奶茶一杯，快乐起飞', emoji: '🧋' },
  { text: '没有奶茶解决不了的烦恼', emoji: '✨' },
  { text: '如果有，那就两杯', emoji: '💕' },
  { text: '生活太苦，奶茶来补', emoji: '🍬' },
  { text: '今天也是奶茶续命的一天', emoji: '⚡' },
  { text: '奶茶是成年人合法的快乐', emoji: '🎉' },
  { text: '一杯奶茶，一份心情', emoji: '🌸' },
  { text: '喝奶茶的人运气不会太差', emoji: '🍀' },
  { text: '人生苦短，先喝奶茶', emoji: '☕' },
  { text: '奶茶在手，天下我有', emoji: '👑' },
  { text: '今日份甜度已达标', emoji: '🍯' },
  { text: '奶茶是写给生活的情书', emoji: '💌' },
  { text: '没有什么是一杯奶茶解决不了的', emoji: '🦋' },
  { text: '喝完这杯就开始努力', emoji: '💪' },
  { text: '奶茶治愈一切不开心', emoji: '🌈' },
]

function getDailyIndex(): number {
  return Math.floor(Date.now() / 86400000) % QUOTES.length
}

export function DailyQuote() {
  const [index, setIndex] = useState(getDailyIndex())
  const quote = useMemo(() => QUOTES[index % QUOTES.length], [index])

  return (
    <button
      onClick={() => setIndex((i) => i + 1)}
      className="w-full text-left p-4 rounded-2xl bg-white/30 backdrop-blur-md
                 border border-white/40 hover:bg-white/50 transition-colors
                 shadow-[0_4px_16px_rgba(51,34,27,0.03)] group"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl group-hover:scale-110 transition-transform">{quote.emoji}</span>
        <p className="text-sm text-milk-text-secondary font-medium tracking-wide leading-relaxed">
          {quote.text}
        </p>
      </div>
      <p className="text-[10px] text-milk-text-muted mt-1.5 ml-7">点击换一句</p>
    </button>
  )
}
