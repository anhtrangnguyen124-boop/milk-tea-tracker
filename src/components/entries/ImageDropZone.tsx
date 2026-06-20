import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, X } from 'lucide-react'

interface Props {
  value: File | null
  preview: string | null // existing image URL for edit mode
  onChange: (file: File | null) => void
}

export function ImageDropZone({ value, preview, onChange }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview ?? null)

  // Generate preview URL when file changes
  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    if (preview) {
      setPreviewUrl(preview)
    }
  }, [value, preview])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0])
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  // Global paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) onChange(file)
          break
        }
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [onChange])

  const clearImage = () => {
    onChange(null)
    setPreviewUrl(null)
  }

  return (
    <div>
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="预览"
            className="w-32 h-32 object-cover rounded-xl border border-milk-border"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-milk-danger text-white
                       flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
            ${isDragActive
              ? 'border-milk-primary bg-milk-primary/5 scale-[1.02]'
              : 'border-milk-border hover:border-milk-primary/30 hover:bg-milk-bg'
            }`}
        >
          <input {...getInputProps()} />
          <ImagePlus className="w-8 h-8 mx-auto mb-2 text-milk-text-muted" />
          <p className="text-sm text-milk-text-secondary">
            {isDragActive ? '释放以添加图片' : '拖拽图片到这里'}
          </p>
          <p className="text-xs text-milk-text-muted mt-1">
            或 Ctrl+V 粘贴剪贴板中的图片
          </p>
        </div>
      )}
    </div>
  )
}
