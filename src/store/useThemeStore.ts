import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  theme: 'light'
  userName: string
  userAvatar: string
  customCursor: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light') => void
  toggleCursor: () => void
  updateProfile: (name: string, avatar: string) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      userName: 'Workspace User',
      userAvatar: '🧑‍💻',
      customCursor: true,
      toggleTheme: () => {
        // App is locked to light theme only
        document.documentElement.classList.remove('dark');
      },
      setTheme: () => {
        document.documentElement.classList.remove('dark');
      },
      toggleCursor: () => set((state) => ({ customCursor: !state.customCursor })),
      updateProfile: (userName, userAvatar) => set({ userName, userAvatar }),
    }),
    {
      name: 'myworkspace-theme',
    }
  )
)
