import { useStats } from '@/hooks/useStats'
import { NumberScroll } from '@/components/effects/NumberScroll'
import { useUIStore } from '@/store/uiStore'

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/30 backdrop-blur-lg rounded-3xl border border-white/40
                     shadow-[0_8px_32px_rgba(51,34,27,0.04)] ${className}`}>
      {children}
    </div>
  )
}

export function StatsDashboard() {
  const timeRange = useUIStore((s) => s.timeRange)
  const { cupCount, weeklyAvg, totalSpend, isLoading } = useStats(timeRange)

  const statItems = [
    { label: '本月杯数', value: cupCount, suffix: ' 杯' },
    { label: '周均消费', value: weeklyAvg, prefix: '¥' },
    { label: '月总消费', value: totalSpend, prefix: '¥' },
  ]

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-bold text-milk-text-secondary tracking-wide mb-3">本月统计</h3>
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-[11px] text-milk-text-muted mb-1 font-medium">{item.label}</p>
            {isLoading ? (
              <div className="h-6 w-16 mx-auto bg-milk-border/50 rounded animate-pulse" />
            ) : (
              <NumberScroll
                value={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
                className="text-lg font-bold text-milk-text"
              />
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
