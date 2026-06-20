import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export function ImageViewer() {
  const viewingImageUrl = useUIStore((s) => s.viewingImageUrl)
  const setViewingImageUrl = useUIStore((s) => s.setViewingImageUrl)

  return (
    <AnimatePresence>
      {viewingImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={() => setViewingImageUrl(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative max-w-[80vw] max-h-[80vh]"
          >
            <img
              src={viewingImageUrl}
              alt="奶茶图片"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setViewingImageUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg
                         flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
