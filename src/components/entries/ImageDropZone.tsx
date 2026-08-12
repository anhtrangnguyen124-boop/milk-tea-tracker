import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, X } from 'lucide-react'

const MAX_IMAGES = 9
const MAX_SIZE_MB = 20

interface Props {
  files: File[]
  previews: string[] // existing image dataURLs for edit mode
  onFilesChange: (files: File[]) => void
  onRemovePreview: (index: number) => void
}

export function ImageDropZone({ files, previews, onFilesChange, onRemovePreview }: Props) {
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([])

  // Generate preview URLs for new files
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setFilePreviewUrls(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  const totalCount = files.length + previews.length

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const available = MAX_IMAGES - totalCount
      if (available <= 0) return
      const newFiles = acceptedFiles.slice(0, available)
      onFilesChange([...files, ...newFiles])
    },
    [files, totalCount, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic', '.heif'] },
    maxFiles: MAX_IMAGES - totalCount,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    disabled: totalCount >= MAX_IMAGES,
  })

  // Global paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const imageFiles: File[] = []
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }
      if (imageFiles.length > 0) {
        const available = MAX_IMAGES - totalCount
        if (available <= 0) return
        onFilesChange([...files, ...imageFiles.slice(0, available)])
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [files, totalCount, onFilesChange])

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {/* Thumbnail grid */}
      {totalCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {/* Existing previews (from edit mode) */}
          {previews.map((url, i) => (
            <div key={`existing-${i}`} className="relative inline-block">
              <img
                src={url}
                alt={`已有图片 ${i + 1}`}
                className="w-20 h-20 object-cover rounded-xl border border-milk-border"
              />
              <button
                type="button"
                onClick={() => onRemovePreview(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-milk-danger text-white
                           flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {/* New file previews */}
          {filePreviewUrls.map((url, i) => (
            <div key={`new-${i}`} className="relative inline-block">
              <img
                src={url}
                alt={`新图片 ${i + 1}`}
                className="w-20 h-20 object-cover rounded-xl border border-milk-border"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-milk-danger text-white
                           flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {totalCount < MAX_IMAGES && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all
            ${isDragActive
              ? 'border-milk-primary bg-milk-primary/5 scale-[1.02]'
              : 'border-milk-border hover:border-milk-primary/30 hover:bg-milk-bg'
            }`}
        >
          <input {...getInputProps()} />
          <ImagePlus className="w-6 h-6 mx-auto mb-1 text-milk-text-muted" />
          <p className="text-xs text-milk-text-secondary">
            {isDragActive ? '释放以添加图片' : '拖拽或点击上传'}
          </p>
          <p className="text-[10px] text-milk-text-muted mt-0.5">
            支持粘贴 · 最多 {MAX_IMAGES} 张 · 单张 ≤{MAX_SIZE_MB}MB
          </p>
        </div>
      )}
    </div>
  )
}
