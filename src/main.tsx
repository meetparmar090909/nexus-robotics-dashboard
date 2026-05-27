import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TelemetryProvider } from './context/TelemetryContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TelemetryProvider>
      <App />
    </TelemetryProvider>
  </StrictMode>,
)
