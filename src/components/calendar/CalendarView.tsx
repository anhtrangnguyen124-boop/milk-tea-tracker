import { useMemo } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useMonthEntries } from '@/hooks/useEntries'
import { DrinkIcon, pickDrinkType } from '@/components/icons/DrinkIcon'
import type { Entry } from '@/types'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export function CalendarView() {
  const { calendarMonth, setCalendarMonth, selectedDate, setSelectedDate } = useUIStore()
  const year = calendarMonth.getFullYear()
  const month = calendarMonth.getMonth()
  const { data: monthEntries } = useMonthEntries(year, month)

  const entriesByDate = useMemo(() => {
    const map: Record<string, Entry[]> = {}
    monthEntries?.forEach((entry) => {
      if (!map[entry.date]) map[entry.date] = []
      map[entry.date].push(entry)
    })
    return map
  }, [monthEntries])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth)
    const monthEnd = endOfMonth(calendarMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [calendarMonth])

  const prevMonth = () => setCalendarMonth(subMonths(calendarMonth, 1))
  const nextMonth = () => setCalendarMonth(addMonths(calendarMonth, 1))
  const goToday = () => {
    setCalendarMonth(new Date())
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/50
                    shadow-[0_4px_20px_rgba(51,34,27,0.03)] p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <h2 className="text-xl font-bold text-milk-text tracking-tight">
          {format(calendarMonth, 'yyyy年 M月', { locale: zhCN })}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={goToday}
            className="px-4 py-1.5 text-[12px] font-semibold rounded-full
                       text-milk-primary bg-milk-primary/8
                       hover:bg-milk-primary/12 transition-colors"
          >今天</button>
          <button onClick={prevMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center
                       text-milk-text-muted hover:bg-milk-bg hover:text-milk-text transition-all">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center
                       text-milk-text-muted hover:bg-milk-bg hover:text-milk-text transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-3 flex-shrink-0">
        {WEEKDAYS.map((day) => (
          <div key={day}
            className="text-center text-[11px] font-semibold text-milk-text-muted tracking-widest py-2.5">
            {day}
          </div>
        ))}
      </div>

      {/* Day grid - fills remaining height */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-1">
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayEntries = entriesByDate[dateStr]
          const isSelected = dateStr === selectedDate
          const isCurrentMonth = isSameMonth(day, calendarMonth)
          const isTodayDate = isToday(day)

          // Pick representative icon from highest-rated entry
          const repEntry = dayEntries?.[0]

          return (
            <button
              key={dateStr}
              onClick={() => {
                setSelectedDate(dateStr)
                if (!isCurrentMonth) setCalendarMonth(day)
              }}
              className={`
                relative flex flex-col items-center justify-center rounded-2xl
                transition-all duration-150 text-sm min-h-[50px]
                ${!isCurrentMonth ? 'opacity-15' : ''}
                ${isSelected
                  ? 'bg-milk-primary/8 text-milk-primary font-bold ring-2 ring-milk-primary/20'
                  : isTodayDate
                    ? 'bg-amber-50/50 text-amber-700 font-bold'
                    : 'text-milk-text font-medium hover:bg-milk-bg'
                }
              `}
            >
              {/* Date number - top right when icon present, center when empty */}
              <span className={`${repEntry ? 'absolute top-1.5 right-2 text-[11px] leading-none z-10' : ''}`}>
                {format(day, 'd')}
              </span>

              {/* Drink icon for days with entries - with sticker effect */}
              {repEntry && (
                <div className="mt-1 calendar-icon">
                  <DrinkIcon type={pickDrinkType(repEntry.name)} size={isSelected ? 38 : 34} />
                </div>
              )}

              {/* Entry count badge */}
              {dayEntries && dayEntries.length > 1 && (
                <span className={`absolute bottom-1 text-[10px] font-bold
                  ${isSelected ? 'text-milk-primary' : 'text-milk-text-muted'}`}>
                  +{dayEntries.length - 1}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
