import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useCreateEntry, useUpdateEntry, useEntries } from '@/hooks/useEntries'
import { useToastStore } from '@/store/toastStore'
import { ImageDropZone } from './ImageDropZone'
import { StarRatingInput } from './StarRatingInput'
import type { NewEntry } from '@/types'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function EntryFormModal() {
  const { isEntryFormOpen, editingEntryId, closeEntryForm, selectedDate, timeRange } = useUIStore()
  const { data: entries } = useEntries(timeRange)
  const createEntry = useCreateEntry()
  const updateEntry = useUpdateEntry()
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [date, setDate] = useState(selectedDate)
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (editingEntryId && entries) {
      const entry = entries.find((e) => e.id === editingEntryId)
      if (entry) {
        setName(entry.name); setBrand(entry.brand ?? ''); setDate(entry.date)
        setRating(entry.rating); setComment(entry.comment ?? '')
        setExistingImageUrl(entry.imageDataUrl); setImageFile(null)
      }
    }
  }, [editingEntryId, entries])

  useEffect(() => {
    if (isEntryFormOpen && !editingEntryId) {
      setName(''); setBrand(''); setDate(selectedDate); setRating(null)
      setComment(''); setImageFile(null); setExistingImageUrl(null)
    }
  }, [isEntryFormOpen, editingEntryId, selectedDate])

  const handleClose = useCallback(() => { if (!saving) closeEntryForm() }, [saving, closeEntryForm])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      let imageDataUrl = existingImageUrl
      if (imageFile) imageDataUrl = await fileToBase64(imageFile)
      else if (imageFile === null && !existingImageUrl) imageDataUrl = null

      if (editingEntryId) {
        await updateEntry.mutateAsync({
          id: editingEntryId, name: name.trim(), brand: brand.trim() || null,
          imageDataUrl, date, rating, comment: comment.trim() || null,
        })
        useToastStore.getState().addToast('记录已更新')
      } else {
        await createEntry.mutateAsync({
          name: name.trim(), brand: brand.trim() || null,
          imageDataUrl, date, rating, comment: comment.trim() || null,
        })
        useToastStore.getState().addToast('新奶茶记录已添加！')
      }
      handleClose()
    } catch (err) { console.error('Save failed:', err) }
    finally { setSaving(false) }
  }, [name, brand, date, rating, comment, imageFile, existingImageUrl, editingEntryId, createEntry, updateEntry, handleClose])

  const inputClass = "w-full px-4 py-2.5 rounded-2xl border border-milk-border/60 bg-white/60 backdrop-blur-sm text-sm text-milk-text placeholder:text-milk-text-muted tracking-wide leading-relaxed focus:outline-none focus:ring-2 focus:ring-milk-primary/15 focus:border-milk-primary/40 focus:bg-white/90 transition-all"

  return (
    <AnimatePresence>
      {isEntryFormOpen && (
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
                {editingEntryId ? '编辑奶茶记录' : '添加奶茶记录'}
              </h2>
              <button onClick={handleClose} disabled={saving}
                className="p-1.5 rounded-xl text-milk-text-muted hover:text-milk-text hover:bg-milk-border/20 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">
                  奶茶名称 <span className="text-milk-danger">*</span>
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="例如：不焦绿" required className={inputClass} />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">
                  品牌
                </label>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                  placeholder="例如：一点点、喜茶、霸王茶姬" className={inputClass} />
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">图片</label>
                <ImageDropZone value={imageFile} preview={existingImageUrl}
                  onChange={(file) => { setImageFile(file); if (file === null) setExistingImageUrl(null) }} />
              </div>

              {/* Date + Rating row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">日期</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">评分</label>
                  <div className="pt-2"><StarRatingInput value={rating} onChange={setRating} /></div>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">评论</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="写写当时喝奶茶的心情..." rows={2}
                  className={`${inputClass} resize-none`} />
              </div>

              <button type="submit" disabled={saving || !name.trim()}
                className="w-full py-3 rounded-2xl bg-milk-primary text-white font-semibold text-sm tracking-wider
                           hover:bg-milk-primary-dark active:scale-[0.98] transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 shadow-md shadow-milk-primary/10">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />保存中...</>
                  : <><Save className="w-4 h-4" />{editingEntryId ? '保存修改' : '添加记录'}</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
