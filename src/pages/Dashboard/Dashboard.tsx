import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { FiPlus, FiMusic, FiClock, FiFileText, FiCheckSquare, FiPlay, FiPause, FiArrowRight, FiX } from 'react-icons/fi'
import { useThemeStore } from '../../store/useThemeStore'
import { useNotesStore } from '../../store/useNotesStore'
import { useTodoStore } from '../../store/useTodoStore'
import { useMusicStore } from '../../store/useMusicStore'

export default function Dashboard() {
  const navigate = useNavigate()
  
  // Stores
  const { userName, userAvatar } = useThemeStore()
  const { notes, createNote } = useNotesStore()
  const { todos, addTodo } = useTodoStore()
  const { isPlaying, currentTrack, play, pause } = useMusicStore()

  // Local Clock state for mini clock widget
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Counts
  const notesCount = notes.length
  const pendingTodosCount = todos.filter((t) => !t.completed).length
  const completedTodosCount = todos.filter((t) => t.completed).length
  
  // Todo percentage calculation
  const totalTodos = todos.length
  const todoProgressPercent = totalTodos > 0 ? Math.round((completedTodosCount / totalTodos) * 100) : 0

  // Quick Action: Add new note and redirect
  const handleQuickNewNote = () => {
    createNote()
    navigate('/notes')
  }

  // Quick Action: Add new task modal state
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false)
  const [quickTaskText, setQuickTaskText] = useState('')
  const [quickTaskPriority, setQuickTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickTaskText.trim()) {
      addTodo(quickTaskText.trim(), quickTaskPriority)
      setQuickTaskText('')
      setIsQuickTaskOpen(false)
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, bounce: 0.3 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Greeting Banner - Light Blue */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-brand-primary/25 border-4 border-slate-800 rounded-[30px] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-cartoon m-1"
      >
        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 bg-blue-50 border-4 border-slate-800 rounded-3xl flex items-center justify-center text-5xl shadow-cartoon-sm select-none">
            {userAvatar}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 leading-tight">
              Halo, {userName}! 👋
            </h1>
            <p className="text-sm md:text-base font-semibold text-slate-700 mt-1">
              Selamat datang kembali. Mari selesaikan pekerjaan Anda hari ini!
            </p>
          </div>
        </div>
        
        {/* Progress Card */}
        <div className="bg-white border-4 border-slate-800 rounded-2xl p-4 flex flex-col justify-center gap-2 shadow-cartoon-sm shrink-0 z-10 w-full md:w-64">
          <div className="flex justify-between font-bold text-sm">
            <span className="text-slate-700">Progress Todo</span>
            <span className="text-brand-primary-dark">{todoProgressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 border-2 border-slate-800">
            <div
              className="bg-brand-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${todoProgressPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 font-bold">
            {completedTodosCount} dari {totalTodos} tugas selesai
          </p>
        </div>
        
        {/* Background decorative cartoon floating nodes */}
        <div className="absolute top-2 right-12 w-16 h-16 bg-blue-100/40 border-4 border-slate-800 rounded-full opacity-20 hidden md:block" />
        <div className="absolute -bottom-8 left-1/3 w-24 h-24 bg-blue-200/40 border-4 border-slate-800 rounded-full opacity-20 hidden md:block" />
      </motion.div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Notes Count Widget */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/notes')}
          className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon hover:shadow-cartoon-hover transition-all cursor-pointer m-1"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 bg-blue-50 border-3 border-slate-800 rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold">
              <FiFileText />
            </div>
            <span className="text-xs font-extrabold text-slate-400 uppercase">Catatan</span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-850">{notesCount}</h3>
          <p className="text-sm font-semibold text-brand-muted-light mt-1 flex items-center gap-1 group">
            Buka Catatan <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
          </p>
        </motion.div>

        {/* Pending Task Widget */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/todo')}
          className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon hover:shadow-cartoon-hover transition-all cursor-pointer m-1"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 border-3 border-slate-800 rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold">
              <FiCheckSquare className="stroke-[2.5]" />
            </div>
            <span className="text-xs font-extrabold text-slate-400 uppercase">Tugas Pending</span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-850">{pendingTodosCount}</h3>
          <p className="text-sm font-semibold text-brand-muted-light mt-1 flex items-center gap-1 group">
            Atur Todos <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
          </p>
        </motion.div>

        {/* Current Time Widget */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/clock')}
          className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon hover:shadow-cartoon-hover transition-all cursor-pointer m-1"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="w-12 h-12 bg-blue-100 border-3 border-slate-800 rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold">
              <FiClock />
            </div>
            <span className="text-xs font-extrabold text-slate-400 uppercase">Waktu</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-850 leading-none">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h3>
          <p className="text-xs font-bold text-brand-muted-light mt-2">
            {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </motion.div>

        {/* Spotify Control Widget */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon hover:shadow-cartoon-hover transition-all flex flex-col justify-between m-1"
        >
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 bg-blue-200/50 border-3 border-slate-800 rounded-xl flex items-center justify-center text-blue-650 text-xl font-bold">
              <FiMusic />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">
              iTunes Player
            </span>
          </div>
          
          <div className="my-2 truncate">
            <h4 className="font-bold text-sm text-slate-850 truncate">
              {currentTrack.name}
            </h4>
            <p className="text-xs text-brand-muted-light truncate">
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/music')}
              className="text-xs font-extrabold text-brand-muted-light hover:text-slate-800"
            >
              Detail
            </button>
            <button
              onClick={isPlaying ? pause : play}
              className="w-8 h-8 rounded-full bg-brand-primary border-2 border-slate-800 flex items-center justify-center text-slate-800 hover:scale-105 transition-transform"
            >
              {isPlaying ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Quick Actions & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon lg:col-span-1 m-1"
        >
          <h3 className="text-lg font-extrabold text-slate-855 mb-4">Aksi Cepat</h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleQuickNewNote}
              className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border-3 border-slate-800 rounded-2xl font-bold transition-all text-slate-800 shadow-cartoon-sm"
            >
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center text-blue-700">
                <FiPlus />
              </div>
              Catatan Baru
            </button>

            <button
              onClick={() => setIsQuickTaskOpen(true)}
              className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border-3 border-slate-800 rounded-2xl font-bold transition-all text-slate-800 shadow-cartoon-sm"
            >
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center text-blue-700">
                <FiPlus />
              </div>
              Tugas Baru
            </button>

            <button
              onClick={() => navigate('/music')}
              className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border-3 border-slate-800 rounded-2xl font-bold transition-all text-slate-800 shadow-cartoon-sm"
            >
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center text-blue-700">
                <FiMusic />
              </div>
              Buka Pemutar Musik
            </button>

            <button
              onClick={() => navigate('/clock')}
              className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border-3 border-slate-800 rounded-2xl font-bold transition-all text-slate-800 shadow-cartoon-sm"
            >
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center text-blue-700">
                <FiClock />
              </div>
              Buka Pusat Jam
            </button>
          </div>
        </motion.div>

        {/* Pending Tasks Panel */}
        <motion.div
          variants={itemVariants}
          className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon lg:col-span-2 m-1"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-extrabold text-slate-800">Tugas Aktif</h3>
            <button
              onClick={() => navigate('/todo')}
              className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-slate-800"
            >
              Lihat Semua
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {todos.filter((t) => !t.completed).length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-semibold">
                Tidak ada tugas yang tertunda. Kerja bagus! 🎉
              </div>
            ) : (
              todos
                .filter((t) => !t.completed)
                .slice(0, 3)
                .map((todo) => (
                  <div
                    key={todo.id}
                    className="flex justify-between items-center p-4 border-3 border-slate-800 rounded-2xl hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${
                          todo.priority === 'high'
                            ? 'bg-blue-500'
                            : todo.priority === 'medium'
                            ? 'bg-blue-300'
                            : 'bg-blue-100'
                        }`}
                      />
                      <span className="font-bold text-sm text-slate-700">
                        {todo.text}
                      </span>
                    </div>
                    {todo.dueDate && (
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                        Due: {todo.dueDate}
                      </span>
                    )}
                  </div>
                ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Add Task Modal */}
      {isQuickTaskOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-slate-800 rounded-[30px] p-6 w-full max-w-sm shadow-cartoon-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-slate-850">Tambah Tugas Baru</h3>
              <button
                onClick={() => setIsQuickTaskOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-205 rounded-xl border-2 border-slate-800"
              >
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleQuickTaskSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Nama Tugas</label>
                <input
                  type="text"
                  placeholder="Ketik tugas di sini..."
                  value={quickTaskText}
                  onChange={(e) => setQuickTaskText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-blue-50 border-3 border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-505 mb-2 uppercase">Prioritas</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setQuickTaskPriority(p)}
                      className={`flex-1 py-2 rounded-xl border-2 font-bold capitalize text-xs transition-all ${
                        quickTaskPriority === p
                          ? p === 'high'
                            ? 'bg-blue-300 text-slate-850 border-slate-800'
                            : p === 'medium'
                            ? 'bg-blue-200 text-slate-850 border-slate-800'
                            : 'bg-blue-100 text-slate-850 border-slate-800'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-slate-800 font-bold border-3 border-slate-800 rounded-xl shadow-cartoon-sm"
              >
                Tambah Tugas
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}
