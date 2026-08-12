// Canvas-based image compression utility
// Mirror the HTML version's algorithm: max 1200px longest edge, JPEG quality 0.7

const MAX_EDGE = 1200
const DEFAULT_QUALITY = 0.7
const MAX_FILE_SIZE_MB = 20

export interface CompressionOptions {
  maxEdge?: number
  quality?: number
}

export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  return validTypes.includes(file.type)
}

export function isValidImageSize(file: File, maxMB: number = MAX_FILE_SIZE_MB): boolean {
  return file.size <= maxMB * 1024 * 1024
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxEdge = MAX_EDGE, quality = DEFAULT_QUALITY } = options

  try {
    const dataUrl = await fileToBase64(file)
    return await compressDataUrl(dataUrl, { maxEdge, quality })
  } catch {
    // Fallback: return original as data URL if compression fails
    return fileToBase64(file)
  }
}

export function compressDataUrl(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxEdge = MAX_EDGE, quality = DEFAULT_QUALITY } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img

      // Scale down if needed
      if (width > maxEdge || height > maxEdge) {
        if (width > height) {
          height = Math.round((height / width) * maxEdge)
          width = maxEdge
        } else {
          width = Math.round((width / height) * maxEdge)
          height = maxEdge
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      try {
        const compressed = canvas.toDataURL('image/jpeg', quality)
        resolve(compressed)
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl) // Fallback on load failure
    img.src = dataUrl
  })
}

// Batch compress multiple files
export async function compressImages(files: File[]): Promise<string[]> {
  const results: string[] = []
  for (const file of files) {
    const compressed = await compressImage(file)
    results.push(compressed)
  }
  return results
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

export async function compressImagesToBlobs(files: File[]): Promise<Blob[]> {
  const dataUrls = await compressImages(files)
  return Promise.all(dataUrls.map(dataUrlToBlob))
}
