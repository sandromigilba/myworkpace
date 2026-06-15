import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

// Lazy loaded page components
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'))
const Notes = lazy(() => import('../pages/Notes/Notes'))
const Todo = lazy(() => import('../pages/Todo/Todo'))
const Music = lazy(() => import('../pages/Music/Music'))
const Clock = lazy(() => import('../pages/Clock/Clock'))

// Friendly cartoon loading spinner
const PageLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh]">
    <div className="relative">
      <div className="w-16 h-16 border-6 border-slate-800 dark:border-slate-700 rounded-full border-t-brand-primary animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
        ⚡
      </div>
    </div>
    <span className="mt-4 font-bold text-slate-700 dark:text-slate-300 animate-pulse">
      Memuat Halaman...
    </span>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: 'notes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Notes />
          </Suspense>
        )
      },
      {
        path: 'todo',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Todo />
          </Suspense>
        )
      },
      {
        path: 'music',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Music />
          </Suspense>
        )
      },
      {
        path: 'clock',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Clock />
          </Suspense>
        )
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
])
