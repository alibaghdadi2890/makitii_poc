import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { CatalogProvider } from './api/CatalogContext'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './components/Toast'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Category } from './pages/Category'
import { AdDetail } from './pages/AdDetail'
import { PostAd } from './pages/PostAd'
import { Auth } from './pages/Auth'
import { Favorites } from './pages/Favorites'
import { MyAds } from './pages/MyAds'
import { Credits } from './pages/Credits'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CatalogProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/c/:slug" element={<Category />} />
                  <Route path="/search" element={<Category mode="search" />} />
                  <Route path="/ad/:slug" element={<AdDetail />} />
                  <Route path="/post" element={<PostAd />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/my-ads" element={<MyAds />} />
                  <Route path="/credits" element={<Credits />} />
                  <Route path="/login" element={<Auth mode="login" />} />
                  <Route path="/register" element={<Auth mode="register" />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </CatalogProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
