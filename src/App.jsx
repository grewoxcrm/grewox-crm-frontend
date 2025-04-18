import React, { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import './styles/index.scss'
import SiteSettingsInitializer from './components/SiteSettingsInitializer'

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SiteSettingsInitializer />
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
        fallbackElement={<LoadingFallback />}
      />
    </Suspense>
  )
}

export default App
