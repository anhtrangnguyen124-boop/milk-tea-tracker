import { useMemo } from 'react'
import { useEntries } from './useEntries'
import type { Entry, TimeRange } from '@/types'
import { startOfMonth, endOfMonth, isWithinInterval, differenceInWeeks, addDays } from 'date-fns'

interface Stats {
  cupCount: number
  weeklyAvg: number
  totalSpend: number
  isLoading: boolean
}

function getCurrentMonthEntries(entries: Entry[] | undefined): Entry[] {
  if (!entries) return []
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  return entries.filter((e) => {
    const d = new Date(e.date + 'T00:00:00')
    return isWithinInterval(d, { start: monthStart, end: monthEnd })
  })
}

export function useStats(timeRange: TimeRange = '1month'): Stats {
  const { data: entries, isLoading } = useEntries(timeRange)

  return useMemo(() => {
    const monthEntries = getCurrentMonthEntries(entries)
    const cupCount = monthEntries.length

    // Total spend (filter entries with price)
    const totalSpend = monthEntries.reduce((sum, e) => sum + (e.price ?? 0), 0)

    // Weekly average: total / number of weeks in month so far
    const now = new Date()
    const weeksInMonth = Math.max(1, differenceInWeeks(endOfMonth(now), startOfMonth(now)) + 1)
    const weeklyAvg = Math.round(totalSpend / weeksInMonth)

    return { cupCount, weeklyAvg, totalSpend, isLoading }
  }, [entries, isLoading])
}
