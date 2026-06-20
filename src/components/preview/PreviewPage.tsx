import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button, Modal, Tabs, Tab, Chip } from '@heroui/react'
import { Plus, Search, Pin, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// Theme colors
const THEMES = [
  { name: 'orange', color: '#E6A878' },
  { name: 'peach', color: '#F2A8A0' },
  { name: 'matcha', color: '#8FC48F' },
  { name: 'taro', color: '#C9B8E8' },
  { name: 'sea', color: '#98C8E8' },
]

interface Entry {
  id: number
  name: string
  brand?: string
  date: string
  rating?: number
  comment?: string
  theme: string
  isPinned: boolean
  createdAt: number
}

const mockEntries: Entry[] = [
  { id: 1, name: '不焦绿', brand: '喜茶', date: format(new Date(), 'yyyy-MM-dd'), rating: 5, comment: '太好喝了！', theme: 'matcha', isPinned: false, createdAt: Date.now() },
  { id: 2, name: '芝芝莓莓', brand: '一点点', date: format(new Date(), 'yyyy-MM-dd'), rating: 4, theme: 'peach', isPinned: true, createdAt: Date.now() - 86400000 },
]

function DrinkIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M26 38 L30 78 C30 82 31 84 34 84 L66 84 C69 84 70 82 70 78 L74 38 Z" fill="#F5E6D3" stroke="#2C2C2C" strokeWidth="3.5" strokeLinejoin="round"/>
      <path d="M24 38 Q50 20 76 38" fill="#E8D5C0" stroke="#2C2C2C" strokeWidth="3.5"/>
      <ellipse cx="50" cy="38" rx="26" ry="4" fill="#EDDCC8" stroke="#2C2C2C" strokeWidth="3"/>
      <line x1="54" y1="10" x2="54" y2="68" stroke="#2C2C2C" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="36" cy="76" r="4" fill="#2C2C2C"/>
      <circle cx="52" cy="77" r="3.8" fill="#2C2C2C"/>
    </svg>
  )
}

function StarRating({ rating = 0, size = 16, onChange }: { rating?: number; size?: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onChange?.(star)} className="hover:scale-110 transition-transform">
          <svg width={size} height={size} viewBox="0 0 24 24" fill={star <= rating ? '#E6A878' : 'none'} stroke={star <= rating ? '#E6A878' : '#D6CFC7'} strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

function EntryCard({ entry, onEdit, onDelete, onPin }: { entry: Entry; onEdit: (e: Entry) => void; onDelete: (e: Entry) => void; onPin: (e: Entry) => void }) {
  const theme = THEMES.find(t => t.name === entry.theme) || THEMES[0]
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 shadow-[0_4px_16px_rgba(51,34,27,0.03)] hover:shadow-[0_10px_30px_rgba(51,34,27,0.06)] hover:-translate-y-0.5 transition-all duration-300 p-4 group">
      <div className="flex gap-3 items-start">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-milk-bg to-milk-sidebar flex items-center justify-center flex-shrink-0 ring-1 ring-milk-border/40">
          <DrinkIcon size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {entry.brand && <span className="text-sm font-semibold" style={{ color: theme.color }}>{entry.brand} · </span>}
            <span className="font-bold text-milk-text text-[15px]">{entry.name}</span>
            {entry.isPinned && <Pin className="w-3 h-3 text-milk-pin fill-milk-pin" />}
          </div>
          <div className="mt-1"><StarRating rating={entry.rating || 0} size={14} /></div>
          {entry.comment && <p className="mt-2 text-xs text-milk-text-secondary bg-milk-bg/70 rounded-lg px-2 py-1.5">💬 {entry.comment}</p>}
        </div>
        <Chip size="sm">{format(new Date(entry.date + 'T00:00:00'), 'M月d日')}</Chip>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-milk-border/30">
        <Button size="sm" variant="ghost" className={`text-xs ${entry.isPinned ? 'text-milk-pin' : 'text-milk-text-secondary'}`} onPress={() => onPin(entry)}>
          <Pin className={`w-3 h-3 ${entry.isPinned ? 'fill-current' : ''}`} />{entry.isPinned ? '已置顶' : '置顶'}
        </Button>
        <Button size="sm" variant="ghost" className="text-xs text-milk-text-secondary" onPress={() => onEdit(entry)}>
          <Edit3 className="w-3 h-3" />编辑
        </Button>
        <Button size="sm" variant="ghost" onPress={() => onDelete(entry)}>
          <Trash2 className="w-3 h-3" />删除
        </Button>
      </div>
    </motion.div>
  )
}

function CalendarGrid({ selectedDate, onSelectDate, entries }: { selectedDate: Date; onSelectDate: (d: Date) => void; entries: Entry[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  })

  const entriesByDate = entries.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {} as Record<string, Entry[]>)

  const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <Card className="w-full bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 shadow-[0_4px_20px_rgba(51,34,27,0.03)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-milk-text">{format(currentMonth, 'yyyy年 M月', { locale: zhCN })}</h2>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="text-xs font-semibold" onPress={() => setCurrentMonth(new Date())}>今天</Button>
          <Button size="sm" variant="ghost" onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(day => <div key={day} className="text-center text-[11px] font-semibold text-milk-text-muted py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayEntries = entriesByDate[dateStr]
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = isSameDay(day, selectedDate)
          const isTodayDate = isToday(day)
          const theme = dayEntries?.[0] ? THEMES.find(t => t.name === dayEntries[0].theme) : null

          return (
            <button key={dateStr} onClick={() => onSelectDate(day)}
              className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-150 text-sm min-h-[50px] ${!isCurrentMonth ? 'opacity-15' : ''} ${isSelected ? 'bg-milk-primary/10 text-milk-primary font-bold ring-2 ring-milk-primary/20' : isTodayDate ? 'bg-amber-50/50 text-amber-700 font-bold' : 'text-milk-text font-medium hover:bg-milk-bg'}`}>
              <span className={`${theme ? 'absolute top-1.5 right-2 text-[11px] leading-none z-10' : ''}`}>{format(day, 'd')}</span>
              {dayEntries && <div className="mt-1"><DrinkIcon size={isSelected ? 32 : 28} /></div>}
              {dayEntries && dayEntries.length > 1 && <span className="absolute bottom-1 text-[10px] font-bold text-milk-text-muted">+{dayEntries.length - 1}</span>}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

export function PreviewPage() {
  const [activeTab, setActiveTab] = useState('calendar')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [entries, setEntries] = useState<Entry[]>(mockEntries)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [formData, setFormData] = useState({ name: '', brand: '', comment: '', rating: 0, theme: 'orange' })

  const filteredEntries = entries.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd'))
  const handleSelectDate = useCallback((d: Date) => setSelectedDate(d), [])

  const handleOpenModal = (entry?: Entry) => {
    if (entry) { setEditingEntry(entry); setFormData({ name: entry.name, brand: entry.brand || '', comment: entry.comment || '', rating: entry.rating || 0, theme: entry.theme }) }
    else { setEditingEntry(null); setFormData({ name: '', brand: '', comment: '', rating: 0, theme: 'orange' }) }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) return
    if (editingEntry) { setEntries(entries.map(e => e.id === editingEntry.id ? { ...e, ...formData } : e)) }
    else {
      const newEntry: Entry = { id: Date.now(), name: formData.name, brand: formData.brand || undefined, date: format(selectedDate, 'yyyy-MM-dd'), rating: formData.rating || undefined, comment: formData.comment || undefined, theme: formData.theme, isPinned: false, createdAt: Date.now() }
      setEntries([...entries, newEntry])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (entry: Entry) => { if (confirm('确定删除吗？')) setEntries(entries.filter(e => e.id !== entry.id)) }
  const handlePin = (entry: Entry) => { setEntries(entries.map(e => e.id === entry.id ? { ...e, isPinned: !e.isPinned } : e)) }

  return (
    <div className="h-screen flex flex-col bg-milk-bg">
      <header className="h-14 flex items-center justify-between px-10 drag-region border-b border-white/30 bg-white/20 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3 no-drag">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-milk-primary to-milk-primary-dark flex items-center justify-center"><span className="text-base">🧋</span></div>
          <h1 className="text-base font-bold text-milk-text tracking-wide">奶茶记录册</h1>
        </div>
        <Button size="sm" variant="ghost" className="text-xs text-milk-text-muted bg-white/40"><Search className="w-3 h-3" />主题</Button>
      </header>

      <div className="flex-1 px-10 py-6 overflow-hidden">
        <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)} className="justify-center">
          <Tab key="calendar">
            <div className="flex flex-col gap-5 h-full pt-4">
              <div className="flex-[9] min-h-0"><CalendarGrid selectedDate={selectedDate} onSelectDate={handleSelectDate} entries={entries} /></div>
              <div className="flex-[11] min-h-0 overflow-y-auto">
                <Card className="h-full bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-milk-text-secondary">{format(selectedDate, 'M月d日')} 的记录</h3>
                    <Chip size="sm" className="text-xs text-milk-text-muted">{filteredEntries.length} 杯</Chip>
                  </div>
                  <AnimatePresence>
                    {filteredEntries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-milk-bg flex items-center justify-center mb-4"><DrinkIcon size={48} /></div>
                        <p className="text-sm font-bold text-milk-text mb-1">还没有奶茶记录</p>
                        <p className="text-xs text-milk-text-muted mb-4">记录下今天喝的第一杯奶茶吧</p>
                        <Button onPress={() => handleOpenModal()}><Plus className="w-4 h-4" />添加记录</Button>
                      </div>
                    ) : (
                      <motion.div className="flex flex-col gap-3" layout>
                        {filteredEntries.map(entry => <EntryCard key={entry.id} entry={entry} onEdit={handleOpenModal} onDelete={handleDelete} onPin={handlePin} />)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>
            </div>
          </Tab>

          <Tab key="explore">
            <div className="flex flex-col gap-5 h-full pt-4 max-w-2xl mx-auto">
              <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 p-5">
                <h3 className="text-sm font-bold text-milk-text mb-4">搜索奶茶</h3>
                <input type="text" placeholder="输入奶茶名称或品牌..." className="w-full px-4 py-2.5 rounded-xl bg-milk-bg border border-milk-border/30 text-milk-text placeholder-milk-text-muted focus:outline-none focus:ring-2 focus:ring-milk-primary/20" />
              </Card>
              <Card className="flex-1 bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 p-5">
                <h3 className="text-sm font-bold text-milk-text mb-4">📌 置顶</h3>
                {entries.filter(e => e.isPinned).length === 0 ? <p className="text-xs text-milk-text-muted text-center py-8">暂无置顶</p> : (
                  <div className="flex flex-col gap-2">
                    {entries.filter(e => e.isPinned).map(entry => (
                      <Card key={entry.id} className="w-full bg-white/50 rounded-2xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-milk-bg flex items-center justify-center"><DrinkIcon size={24} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-milk-text truncate">{entry.brand && <span style={{ color: THEMES.find(t => t.name === entry.theme)?.color }}>{entry.brand} · </span>}{entry.name}</p>
                        </div>
                        <StarRating rating={entry.rating || 0} size={12} />
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>

      <Button isIconOnly className="fixed bottom-24 right-10 w-12 h-12 rounded-2xl bg-milk-primary" onPress={() => handleOpenModal()}>
        <Plus className="w-5 h-5" />
      </Button>

      <div className="fixed bottom-6 right-1/2 translate-x-1/2 z-50 bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg p-1.5 flex gap-1">
        <Button size="sm" variant={activeTab === 'calendar' ? 'primary' : 'ghost'} onPress={() => setActiveTab('calendar')}>打卡</Button>
        <Button size="sm" variant={activeTab === 'explore' ? 'primary' : 'ghost'} onPress={() => setActiveTab('explore')}>探索</Button>
      </div>

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Header>{editingEntry ? '编辑奶茶记录' : '添加奶茶记录'}</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4 py-2">
            <input type="text" placeholder="奶茶名称 *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-milk-bg border border-milk-border/30 text-milk-text placeholder-milk-text-muted focus:outline-none focus:ring-2 focus:ring-milk-primary/20" />
            <input type="text" placeholder="品牌" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-milk-bg border border-milk-border/30 text-milk-text placeholder-milk-text-muted focus:outline-none focus:ring-2 focus:ring-milk-primary/20" />
            <div><p className="text-sm text-milk-text-muted mb-2">主题色</p>
              <div className="flex gap-2 flex-wrap">
                {THEMES.map(theme => (
                  <button key={theme.name} onClick={() => setFormData({ ...formData, theme: theme.name })}
                    className={`w-8 h-8 rounded-full transition-transform ${formData.theme === theme.name ? 'ring-2 ring-offset-2 ring-milk-primary scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: theme.color }} />
                ))}
              </div>
            </div>
            <div><p className="text-sm text-milk-text-muted mb-2">评分</p><StarRating rating={formData.rating} size={24} onChange={(r) => setFormData({ ...formData, rating: r })} /></div>
            <textarea placeholder="评论" value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-milk-bg border border-milk-border/30 text-milk-text placeholder-milk-text-muted focus:outline-none focus:ring-2 focus:ring-milk-primary/20 resize-none" rows={3} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onPress={() => setIsModalOpen(false)}>取消</Button>
          <Button onPress={handleSave}>{editingEntry ? '保存' : '添加记录'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}