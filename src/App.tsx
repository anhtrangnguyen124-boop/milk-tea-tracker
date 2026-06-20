import { MainLayout } from '@/components/layout/MainLayout'
import { PreviewPage } from '@/components/preview/PreviewPage'

// Enable preview via URL ?preview=true or env variable
const usePreview = new URLSearchParams(window.location.search).get('preview') === 'true'
  || import.meta.env.VITE_USE_PREVIEW === 'true'

// No auth needed - local storage app, open and use immediately
export default function App() {
  if (usePreview) {
    return <PreviewPage />
  }
  return <MainLayout />
}
