import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useCreateJournalEntry, useUpdateJournalEntry } from '@/hooks/useJournal'
import { useToastStore } from '@/store/toastStore'
import { MOODS, PAPER_OPTIONS, getRandomPaper } from '@/constants/journal'
import type { JournalMood, PaperTexture } from '@/types'
import { db } from '@/services/db'

export function JournalFormModal() {
  const { isJournalFormOpen, journalEditId, closeJournalForm } = useUIStore()
  const createEntry = useCreateJournalEntry()
  const updateEntry = useUpdateJournalEntry()
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState<JournalMood>('happy')
  const [customMood, setCustomMood] = useState('')
  const [paper, setPaper] = useState<PaperTexture>('grid')

  // Reset form on open (new entry) or load existing data (edit mode)
  useEffect(() => {
    if (!isJournalFormOpen) return

    if (journalEditId) {
      // Edit mode: load existing entry data
      db.journal.get(journalEditId).then((entry) => {
        if (entry) {
          setTitle(entry.title ?? '')
          setContent(entry.content)
          setDate(entry.date)
          setMood(entry.mood)
          setCustomMood(entry.customMood ?? '')
          setPaper(entry.paper)
        }
      })
    } else {
      // New entry: reset to defaults
      setTitle('')
      setContent('')
      setDate(new Date().toISOString().split('T')[0])
      setMood('happy')
      setCustomMood('')
      setPaper(getRandomPaper())
    }
  }, [isJournalFormOpen, journalEditId])

  const handleClose = useCallback(() => {
    if (!saving) closeJournalForm()
  }, [saving, closeJournalForm])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    try {
      if (journalEditId) {
        await updateEntry.mutateAsync({
          id: journalEditId,
          title: title.trim() || null,
          content: content.trim(),
          date,
          mood,
          customMood: mood === 'custom' ? customMood.trim() || null : null,
          paper,
        })
        useToastStore.getState().addToast('想法已更新')
      } else {
        await createEntry.mutateAsync({
          title: title.trim() || null,
          content: content.trim(),
          date,
          mood,
          customMood: mood === 'custom' ? customMood.trim() || null : null,
          paper,
        })
        useToastStore.getState().addToast('想法已记录 ✨')
      }
      handleClose()
    } catch (err) {
      console.error('Journal save failed:', err)
      useToastStore.getState().addToast('保存失败')
    } finally {
      setSaving(false)
    }
  }, [title, content, date, mood, customMood, paper, journalEditId, createEntry, updateEntry, handleClose])

  const inputClass = "w-full px-4 py-2.5 rounded-2xl border border-milk-border/60 bg-white/60 backdrop-blur-sm text-sm text-milk-text placeholder:text-milk-text-muted tracking-wide leading-relaxed focus:outline-none focus:ring-2 focus:ring-milk-primary/15 focus:border-milk-primary/40 focus:bg-white/90 transition-all"

  return (
    <AnimatePresence>
      {isJournalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl
                       shadow-xl shadow-milk-primary/5 border border-white/50 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-milk-border/30 bg-white/40">
              <h2 className="text-base font-bold text-milk-text tracking-wide">
                {journalEditId ? '编辑想法' : '写想法'}
              </h2>
              <button onClick={handleClose} disabled={saving}
                className="p-1.5 rounded-xl text-milk-text-muted hover:text-milk-text hover:bg-milk-border/20 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">标题</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="给想法取个名字..." className={inputClass} />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">
                  内容 <span className="text-milk-danger">*</span>
                </label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="记录灵感、想法或摘抄..." rows={5}
                  className={`${inputClass} resize-none text-base leading-relaxed`} required />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">日期</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
              </div>

              {/* Mood selector */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">心情</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOODS.map((m) => (
                    <button key={m.key} type="button"
                      onClick={() => setMood(m.key)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs
                        ${mood === m.key
                          ? 'border-milk-primary bg-milk-primary/5 text-milk-primary font-semibold'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                  <button type="button"
                    onClick={() => setMood('custom')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs
                      ${mood === 'custom'
                        ? 'border-milk-primary bg-milk-primary/5 text-milk-primary font-semibold'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                  >
                    <span className="text-lg">✨</span>
                    自定义
                  </button>
                </div>
                {mood === 'custom' && (
                  <input type="text" value={customMood} onChange={(e) => setCustomMood(e.target.value)}
                    placeholder="输入你的心情..." className={`${inputClass} mt-2`} />
                )}
              </div>

              {/* Paper texture selector */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">
                  纸张纹理
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PAPER_OPTIONS.map((p) => (
                    <button key={p.key} type="button"
                      onClick={() => setPaper(p.key)}
                      className={`flex-1 h-14 rounded-xl border-2 transition-all text-xs
                        ${paper === p.key
                          ? 'border-milk-primary bg-milk-primary/5 text-milk-primary font-semibold'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving || !content.trim()}
                className="w-full py-3 rounded-2xl bg-milk-primary text-white font-semibold text-sm tracking-wider
                           hover:bg-milk-primary-dark active:scale-[0.98] transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 shadow-md shadow-milk-primary/10">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />保存中...</>
                  : <><Save className="w-4 h-4" />{journalEditId ? '保存修改' : '记录想法'}</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
