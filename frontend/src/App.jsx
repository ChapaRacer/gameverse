import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import GameDetail from './pages/GameDetail'
import AdminPage from './pages/Admin'
import { SearchPage, CatalogPage, FavoritesPage } from './pages/OtherPages'
import { ToastProvider } from './context/ToastContext'
import './index.css'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
