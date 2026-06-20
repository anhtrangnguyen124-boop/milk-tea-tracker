import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useDeleteEntry, useEntries } from '@/hooks/useEntries'
import { useToastStore } from '@/store/toastStore'
import { useCallback, useState } from 'react'

export function DeleteConfirmDialog() {
  const deletingEntryId = useUIStore((s) => s.deletingEntryId)
  const setDeletingEntryId = useUIStore((s) => s.setDeletingEntryId)
  const { data: entries } = useEntries('1month')
  const deleteEntry = useDeleteEntry()
  const [deleting, setDeleting] = useState(false)

  const entryToDelete = entries?.find((e) => e.id === deletingEntryId)

  const handleDelete = useCallback(async () => {
    if (!deletingEntryId) return
    setDeleting(true)
    try {
      await deleteEntry.mutateAsync(deletingEntryId)
      useToastStore.getState().addToast('记录已删除', 'info')
      setDeletingEntryId(null)
    } catch (err) { console.error('Delete failed:', err) }
    finally { setDeleting(false) }
  }, [deletingEntryId, deleteEntry, setDeletingEntryId])

  return (
    <AnimatePresence>
      {deletingEntryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/15 backdrop-blur-sm"
            onClick={() => !deleting && setDeletingEntryId(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-xl border border-milk-border/50 p-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-milk-danger/8 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-milk-danger" />
              </div>
              <h3 className="text-lg font-bold text-milk-text">确认删除</h3>
              <p className="text-sm text-milk-text-secondary mt-2">
                确定要删除「{entryToDelete?.name ?? '这条记录'}」吗？此操作不可撤销。
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeletingEntryId(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-2xl border border-milk-border text-milk-text-secondary
                           font-medium hover:bg-milk-bg transition-colors">取消</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-2xl bg-milk-danger text-white font-medium
                           hover:bg-milk-danger/90 active:scale-[0.98] transition-all
                           disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />删除中...</> : '确认删除'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
