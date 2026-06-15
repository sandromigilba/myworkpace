import React, { useState, useEffect } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { FiGrid, FiFileText, FiCheckSquare, FiMusic, FiClock, FiSearch, FiX } from 'react-icons/fi'
import { useThemeStore } from '../store/useThemeStore'
import { useNotesStore } from '../store/useNotesStore'
import SEO from '../components/SEO'

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Theme & Profile stores
  const { userName, userAvatar, updateProfile } = useThemeStore()
  
  // Search state & Notes search interaction
  const { searchQuery, setSearchQuery } = useNotesStore()
  
  // Profile edit modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [tempName, setTempName] = useState(userName)
  const [tempAvatar, setTempAvatar] = useState(userAvatar)

  // Force document theme to light mode only
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FiGrid },
    { path: '/notes', label: 'Notes', icon: FiFileText },
    { path: '/todo', label: 'Todo List', icon: FiCheckSquare },
    { path: '/music', label: 'Music', icon: FiMusic },
    { path: '/clock', label: 'Clock Center', icon: FiClock },
  ]

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (tempName.trim()) {
      updateProfile(tempName.trim(), tempAvatar)
      setIsProfileModalOpen(false)
    }
  }

  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Auto-navigate to Notes if searching from other pages except Todo which has its own filtering.
    if (location.pathname !== '/notes' && location.pathname !== '/todo') {
      navigate('/notes')
    }
  }

  const avatarOptions = ['🧑‍💻', '🐱', '🦊', '🐼', '🐰', '🐼', '🤖', '👻', '👾', '🦄', '🧙‍♂️', '🌸', '🍕', '🌟', '🚀']

  return (
    <div className="min-h-screen bg-brand-bg-light text-brand-text-light flex flex-col font-sans transition-colors duration-300 pb-20 md:pb-0">
      <SEO />

      {/* Main Row layout (Height grows automatically with content) */}
      <div className="flex-1 flex flex-col md:flex-row p-4 md:p-6 pb-2">
        
        {/* Sidebar - Always visible, shrunk to icon-only vertical bar on desktop */}
        <aside className="w-20 hidden md:flex flex-col justify-between items-center py-6 bg-white border-4 border-slate-800 rounded-[30px] shadow-cartoon shrink-0 mr-6 m-1.5">
          <div className="flex flex-col items-center gap-8">
            {/* Logo */}
            <Link to="/" className="w-12 h-12 bg-brand-primary border-3 border-slate-800 rounded-2xl flex items-center justify-center text-xl font-bold shadow-cartoon-sm hover:rotate-6 transition-transform">
              ⚡
            </Link>
            
            {/* Menu Icons */}
            <nav className="flex flex-col gap-4">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={`w-12 h-12 flex items-center justify-center border-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-brand-primary border-slate-800 shadow-cartoon-hover scale-[1.05]'
                        : 'bg-white border-transparent hover:border-slate-800 hover:scale-[1.02]'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-slate-700" />
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Profile trigger at bottom */}
          <button
            onClick={() => {
              setTempName(userName)
              setTempAvatar(userAvatar)
              setIsProfileModalOpen(true)
            }}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 border-3 border-slate-800 rounded-xl shadow-cartoon-sm hover:scale-[1.05] transition-transform text-2xl"
            title={userName}
          >
            {userAvatar}
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border-4 border-slate-800 rounded-[24px] p-4 shadow-cartoon-sm transition-colors duration-300 shrink-0 m-1.5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary border-3 border-slate-800 rounded-xl flex items-center justify-center text-xl font-bold shadow-cartoon-sm">
                ⚡
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 capitalize">
                {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
              </h2>
            </div>

            {/* Global Search Bar */}
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari sesuatu di sini..."
                value={searchQuery}
                onChange={handleGlobalSearch}
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border-3 border-slate-800 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            {/* Profile trigger on desktop (just in case they click it in header) */}
            <div className="flex gap-3 items-center">
              <button
                onClick={() => {
                  setTempName(userName)
                  setTempAvatar(userAvatar)
                  setIsProfileModalOpen(true)
                }}
                className="w-10 h-10 flex items-center justify-center bg-brand-primary border-3 border-slate-800 rounded-xl text-xl shadow-cartoon-sm"
              >
                {userAvatar}
              </button>
            </div>
          </header>

          {/* Dynamic Page Outlet (Height grows automatically) */}
          <div className="flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer at the bottom */}
      <footer className="h-12 bg-white border-t-4 border-slate-800 flex items-center justify-center text-xs font-semibold text-brand-muted-light shrink-0 z-20 hidden sm:flex">
        &copy; {new Date().getFullYear()} MyWorkspace. Made with 💙. Versi 1.0.0 (PWA Ready)
      </footer>

      {/* Mobile Navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-slate-800 flex justify-around p-3 z-40 transition-colors duration-300">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? 'text-brand-primary scale-110 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-6 h-6 mb-0.5" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-slate-800 rounded-[30px] p-6 w-full max-w-sm shadow-cartoon-lg animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Edit Profil Workspace</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 rounded-xl"
              >
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                  Pilih Avatar
                </label>
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 border-2 border-slate-200 rounded-xl bg-slate-50">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setTempAvatar(emoji)}
                      className={`text-2xl p-1.5 rounded-lg border-2 transition-all ${
                        tempAvatar === emoji
                          ? 'border-brand-primary bg-brand-primary/20 scale-110'
                          : 'border-transparent hover:bg-slate-250'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                  Nama Anda
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-3 border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-slate-800 font-bold border-4 border-slate-800 rounded-2xl shadow-cartoon-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Simpan Profil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
