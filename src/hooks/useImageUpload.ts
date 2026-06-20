import { supabase } from '@/services/supabase'
import imageCompression from 'browser-image-compression'

// Client-side image compression before upload
async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.85,
  }
  try {
    return await imageCompression(file, options)
  } catch {
    // If compression fails, return original
    return file
  }
}

export function useImageUpload() {
  const uploadImage = async (
    file: File,
    entryId: string
  ): Promise<string | null> => {
    try {
      const compressed = await compressImage(file)
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${entryId}.${ext}`

      const { error, data } = await supabase.storage
        .from('entry-images')
        .upload(path, compressed, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('entry-images')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (err) {
      console.error('Image upload failed:', err)
      return null
    }
  }

  const deleteImage = async (url: string) => {
    try {
      // Extract path from URL
      const urlParts = url.split('/entry-images/')
      if (urlParts.length < 2) return

      const path = urlParts[1].split('?')[0]
      await supabase.storage.from('entry-images').remove([path])
    } catch (err) {
      console.warn('Failed to delete image:', err)
    }
  }

  return { uploadImage, deleteImage }
}
