import { useCallback, useEffect, useRef, useState } from 'react'

export interface UploadedPhoto {
  id: string
  url: string
  name: string
  size: number
}

export const MAX_PHOTOS = 6
export const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type RejectionReason = 'type' | 'size' | 'limit'

interface Messages {
  type: string
  size: string
  limit: string
}

/**
 * Client-side photo handling for the post-ad form. Files never leave the
 * browser — each one becomes an object URL for preview, revoked when it is
 * removed or the form unmounts so blobs don't leak.
 */
export function usePhotoUploads(messages: Messages) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [error, setError] = useState<string | null>(null)
  const urls = useRef(new Set<string>())

  useEffect(
    () => () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url))
      urls.current.clear()
    },
    [],
  )

  const add = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files)
      let rejected: RejectionReason | null = null

      setPhotos((current) => {
        const next = [...current]
        for (const file of incoming) {
          if (next.length >= MAX_PHOTOS) {
            rejected = 'limit'
            break
          }
          if (!ACCEPTED.includes(file.type)) {
            rejected = 'type'
            continue
          }
          if (file.size > MAX_BYTES) {
            rejected = 'size'
            continue
          }
          const url = URL.createObjectURL(file)
          urls.current.add(url)
          next.push({
            id: `${file.name}-${file.size}-${file.lastModified}-${next.length}`,
            url,
            name: file.name,
            size: file.size,
          })
        }
        return next
      })

      setError(rejected ? messages[rejected] : null)
    },
    [messages],
  )

  const remove = useCallback((id: string) => {
    setPhotos((current) => {
      const target = current.find((p) => p.id === id)
      if (target) {
        URL.revokeObjectURL(target.url)
        urls.current.delete(target.url)
      }
      return current.filter((p) => p.id !== id)
    })
    setError(null)
  }, [])

  /** Promotes a photo to first position — the first photo is the cover. */
  const makeCover = useCallback((id: string) => {
    setPhotos((current) => {
      const target = current.find((p) => p.id === id)
      if (!target) return current
      return [target, ...current.filter((p) => p.id !== id)]
    })
  }, [])

  const reset = useCallback(() => {
    setPhotos((current) => {
      current.forEach((p) => {
        URL.revokeObjectURL(p.url)
        urls.current.delete(p.url)
      })
      return []
    })
    setError(null)
  }, [])

  return { photos, error, add, remove, makeCover, reset }
}
