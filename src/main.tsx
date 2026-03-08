import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nContext, useI18nProvider } from './hooks/useI18n.ts'

function Root() {
  const i18n = useI18nProvider()
  return (
    <I18nContext value={i18n}>
      <App />
    </I18nContext>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
