import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useUIStore } from '@/store/uiStore'
import { useCreateEntry, useUpdateEntry, useEntries } from '@/hooks/useEntries'
import { useToastStore } from '@/store/toastStore'
import { ImageDropZone } from './ImageDropZone'
import { StarRatingInput } from './StarRatingInput'
import { compressImagesToBlobs, dataUrlToBlob } from '@/utils/imageCompression'
import type { NewEntry, ColorTheme, DrinkCategory, Sweetness, IceLevel, Topping, Repurchase } from '@/types'
import { DRINK_CATEGORY_OPTIONS, SWEETNESS_OPTIONS, ICE_OPTIONS, TOPPING_OPTIONS } from '@/constants/drinks'
import { saveEntryImages, deleteEntryImages } from '@/services/entryImages'
import { useEntryImageUrls } from '@/hooks/useEntryImageUrls'

const COLOR_THEMES: { key: ColorTheme; label: string; gradient: string }[] = [
  { key: 'orange', label: '橘色', gradient: 'linear-gradient(135deg, #FF9800, #FFB74D)' },
  { key: 'peach', label: '蜜桃', gradient: 'linear-gradient(135deg, #F8BBD0, #F48FB1)' },
  { key: 'matcha', label: '抹茶', gradient: 'linear-gradient(135deg, #A5D6A7, #81C784)' },
  { key: 'taro', label: '芋泥', gradient: 'linear-gradient(135deg, #CE93D8, #BA68C8)' },
  { key: 'sea', label: '海盐', gradient: 'linear-gradient(135deg, #81D4FA, #4FC3F7)' },
]

export function EntryFormModal() {
  const { isEntryFormOpen, editingEntryId, editingEntryData, closeEntryForm, selectedDate, timeRange } = useUIStore()
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
  const [price, setPrice] = useState('')
  const [colorTheme, setColorTheme] = useState<ColorTheme | null>(null)
  const [drinkCategory, setDrinkCategory] = useState<DrinkCategory | null>(null)
  const [sweetness, setSweetness] = useState<Sweetness | null>(null)
  const [ice, setIce] = useState<IceLevel | null>(null)
  const [toppings, setToppings] = useState<Topping[]>([])
  const [repurchase, setRepurchase] = useState<Repurchase | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [legacyImages, setLegacyImages] = useState<string[]>([])
  const [retainedImageIds, setRetainedImageIds] = useState<number[]>([])
  const originalImageIdsRef = useRef<number[]>([])
  const storedImageUrls = useEntryImageUrls(retainedImageIds)
  const existingImages = [...legacyImages, ...storedImageUrls]

  useEffect(() => {
    if (editingEntryId) {
      const entry = editingEntryData ?? (entries?.find((e) => e.id === editingEntryId) ?? null)
      if (entry) {
        setName(entry.name)
        setBrand(entry.brand ?? '')
        setDate(entry.date)
        setRating(entry.rating)
        setComment(entry.comment ?? '')
        setPrice(entry.price != null ? String(entry.price) : '')
        setColorTheme(entry.colorTheme ?? null)
        setDrinkCategory(entry.drinkCategory ?? null)
        setSweetness(entry.sweetness ?? null)
        setIce(entry.ice ?? null)
        setToppings(entry.toppings ?? [])
        setRepurchase(entry.repurchase ?? null)
        setLegacyImages(entry.images ?? (entry.imageDataUrl ? [entry.imageDataUrl] : []))
        setRetainedImageIds(entry.imageIds ?? [])
        originalImageIdsRef.current = entry.imageIds ?? []
        setImageFiles([])
      }
    }
  }, [editingEntryId, editingEntryData, entries])

  useEffect(() => {
    if (isEntryFormOpen && !editingEntryId) {
      setName(''); setBrand(''); setDate(selectedDate); setRating(null)
      setComment(''); setPrice(''); setImageFiles([]); setLegacyImages([]); setRetainedImageIds([])
      originalImageIdsRef.current = []
      setDrinkCategory(null)
      setSweetness(null); setIce(null); setToppings([]); setRepurchase(null)
      // Random default theme
      setColorTheme(COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)].key)
    }
  }, [isEntryFormOpen, editingEntryId, selectedDate])

  const handleClose = useCallback(() => { if (!saving) closeEntryForm() }, [saving, closeEntryForm])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const priceNum = price.trim() ? Number(price.trim()) : null
      const newBlobs = await compressImagesToBlobs(imageFiles)

      if (editingEntryId) {
        const legacyBlobs = await Promise.all(legacyImages.map(dataUrlToBlob))
        const savedImageIds = await saveEntryImages(editingEntryId, [...legacyBlobs, ...newBlobs])
        const removedImageIds = originalImageIdsRef.current.filter((id) => !retainedImageIds.includes(id))
        await updateEntry.mutateAsync({
          id: editingEntryId,
          name: name.trim(),
          brand: brand.trim() || null,
          imageDataUrl: null,
          images: [],
          imageIds: [...retainedImageIds, ...savedImageIds],
          date,
          rating,
          comment: comment.trim() || null,
          price: priceNum,
          colorTheme,
          drinkCategory,
          sweetness,
          ice,
          toppings,
          repurchase,
        })
        await deleteEntryImages(removedImageIds)
        useToastStore.getState().addToast('记录已更新')
      } else {
        const createdEntry = await createEntry.mutateAsync({
          name: name.trim(),
          brand: brand.trim() || null,
          imageDataUrl: null,
          images: [],
          imageIds: [],
          date,
          rating,
          comment: comment.trim() || null,
          price: priceNum,
          colorTheme,
          drinkCategory,
          sweetness,
          ice,
          toppings,
          repurchase,
        })
        const savedImageIds = await saveEntryImages(createdEntry.id, newBlobs)
        if (savedImageIds.length > 0) {
          await updateEntry.mutateAsync({ id: createdEntry.id, imageIds: savedImageIds })
        }
        useToastStore.getState().addToast('新奶茶记录已添加！')
        // Trigger confetti
        useUIStore.getState().setConfetti(true)
      }
      handleClose()
    } catch (err) {
      console.error('Save failed:', err)
      useToastStore.getState().addToast('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }, [name, brand, date, rating, comment, price, colorTheme, drinkCategory, sweetness, ice, toppings, repurchase, imageFiles, legacyImages, retainedImageIds, editingEntryId, editingEntryData, createEntry, updateEntry, handleClose])

  const toggleTopping = (topping: Topping) => {
    setToppings((current) => current.includes(topping)
      ? current.filter((item) => item !== topping)
      : [...current, topping])
  }

  const inputClass = "w-full px-4 py-2.5 rounded-2xl border border-milk-border/60 bg-white/60 backdrop-blur-sm text-sm text-milk-text placeholder:text-milk-text-muted tracking-wide leading-relaxed focus:outline-none focus:ring-2 focus:ring-milk-primary/15 focus:border-milk-primary/40 focus:bg-white/90 transition-all"
  const today = format(new Date(), 'yyyy-MM-dd')

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

              {/* Drink preferences */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">甜度</label>
                  <div className="flex flex-wrap gap-2">
                    {SWEETNESS_OPTIONS.map((value) => (
                      <button key={value} type="button" onClick={() => setSweetness((current) => current === value ? null : value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sweetness === value ? 'bg-milk-primary text-white shadow-sm shadow-milk-primary/20' : 'bg-white/60 text-milk-text-secondary border border-milk-border/50 hover:border-milk-primary/30'}`}>
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">冰量</label>
                  <div className="flex flex-wrap gap-2">
                    {ICE_OPTIONS.map((value) => (
                      <button key={value} type="button" onClick={() => setIce((current) => current === value ? null : value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${ice === value ? 'bg-milk-primary text-white shadow-sm shadow-milk-primary/20' : 'bg-white/60 text-milk-text-secondary border border-milk-border/50 hover:border-milk-primary/30'}`}>
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">加料</label>
                  <div className="flex flex-wrap gap-2">
                    {TOPPING_OPTIONS.map((value) => (
                      <button key={value} type="button" onClick={() => toggleTopping(value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${toppings.includes(value) ? 'bg-milk-primary text-white shadow-sm shadow-milk-primary/20' : 'bg-white/60 text-milk-text-secondary border border-milk-border/50 hover:border-milk-primary/30'}`}>
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">会再喝吗</label>
                  <div className="flex flex-wrap gap-2">
                    {(['是', '否'] as const).map((value) => (
                      <button key={value} type="button" onClick={() => setRepurchase((current) => current === value ? null : value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${repurchase === value ? 'bg-milk-primary text-white shadow-sm shadow-milk-primary/20' : 'bg-white/60 text-milk-text-secondary border border-milk-border/50 hover:border-milk-primary/30'}`}>
                        {value === '是' ? '👍 会再喝' : '👎 暂不回购'}
                      </button>
                    ))}
                  </div>
                </div>
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
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">
                  图片
                </label>
                <ImageDropZone
                  files={imageFiles}
                  previews={existingImages}
                  onFilesChange={setImageFiles}
                  onRemovePreview={(index) => {
                    if (index < legacyImages.length) {
                      setLegacyImages((current) => current.filter((_, i) => i !== index))
                    } else {
                      const imageIndex = index - legacyImages.length
                      setRetainedImageIds((current) => current.filter((_, i) => i !== imageIndex))
                    }
                  }}
                />
              </div>

              {/* Drink category */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">
                  饮品类型
                </label>
                <div className="flex flex-wrap gap-2">
                  {DRINK_CATEGORY_OPTIONS.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDrinkCategory((current) => current === value ? null : value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                        ${drinkCategory === value
                          ? 'bg-milk-primary text-white shadow-sm shadow-milk-primary/20'
                          : 'bg-white/60 text-milk-text-secondary border border-milk-border/50 hover:border-milk-primary/30 hover:bg-milk-primary/5'
                        }`}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Picker */}
              <div>
                <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">
                  颜色主题
                </label>
                <div className="flex gap-2">
                  {COLOR_THEMES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      title={t.label}
                      onClick={() => setColorTheme(t.key)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 active:scale-90
                        ${colorTheme === t.key ? 'ring-2 ring-offset-1 ring-milk-primary scale-110' : 'ring-1 ring-gray-200'}`}
                      style={{ background: t.gradient }}
                    />
                  ))}
                </div>
              </div>

              {/* Date + Rating row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">日期</label>
                  <input type="date" value={date} max={today}
                    onChange={(e) => setDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">评分</label>
                  <div className="pt-2"><StarRatingInput value={rating} onChange={setRating} /></div>
                </div>
              </div>

              {/* Price + Comment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">
                    价格 (¥)
                  </label>
                  <input type="number" min="0" max="999" value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="18" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-milk-text-secondary tracking-wider mb-1.5 ml-1">评论</label>
                  <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                    placeholder="写写喝奶茶的心情..." className={inputClass} />
                </div>
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
