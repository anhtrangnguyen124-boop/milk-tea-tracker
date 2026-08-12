import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout/MainLayout'
import { PreviewPage } from '@/components/preview/PreviewPage'
import { Confetti } from '@/components/effects/Confetti'
import { applyTheme } from '@/utils/applyTheme'
import { useUIStore } from '@/store/uiStore'
import { migrateFromLocalStorage } from '@/utils/migration'

// Enable preview via URL ?preview=true or env variable
const usePreview = new URLSearchParams(window.location.search).get('preview') === 'true'
  || import.meta.env.VITE_USE_PREVIEW === 'true'

let legacyMigrationStarted = false

// No auth needed - local storage app, open and use immediately
export default function App() {
  const bgTheme = useUIStore((s) => s.bgTheme)
  const queryClient = useQueryClient()

  // Apply theme on mount and on theme change
  useEffect(() => {
    applyTheme(bgTheme)
  }, [bgTheme])

  // One-time import for data created with the standalone HTML prototype.
  useEffect(() => {
    if (legacyMigrationStarted) return
    legacyMigrationStarted = true
    void migrateFromLocalStorage().then(({ entries, journal, jobs, reviews, cooking }) => {
      if (entries > 0 || journal > 0 || jobs > 0 || reviews > 0 || cooking > 0) {
        queryClient.invalidateQueries({ queryKey: ['entries'] })
        queryClient.invalidateQueries({ queryKey: ['journal'] })
        queryClient.invalidateQueries({ queryKey: ['jobs'] })
        queryClient.invalidateQueries({ queryKey: ['jobReviews'] })
        queryClient.invalidateQueries({ queryKey: ['cooking'] })
      }
    })
  }, [queryClient])

  if (usePreview) {
    return <PreviewPage />
  }
  return (
    <>
      <MainLayout />
      <Confetti />
    </>
  )
}
