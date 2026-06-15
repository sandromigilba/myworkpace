import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiEdit2, FiCheck, FiX, FiCalendar } from 'react-icons/fi'
import confetti from 'canvas-confetti'
import { useTodoStore, type Todo } from '../../store/useTodoStore'
import { EmptyTodoIllustration } from '../../components/Illustrations'

export default function TodoList() {
  const { todos, filter, addTodo, updateTodo, deleteTodo, toggleTodo, setFilter } = useTodoStore()

  // New todo form state
  const [newText, setNewText] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')

  // Edit task state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  // Calculations
  const completedCount = todos.filter((t) => t.completed).length
  const pendingCount = todos.filter((t) => !t.completed).length
  const totalCount = todos.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Filtered list
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  // Sort by priority (high -> medium -> low) and completion (active -> completed)
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    const priorityWeight = { high: 3, medium: 2, low: 1 }
    return priorityWeight[b.priority] - priorityWeight[a.priority]
  })

  const handleAddTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newText.trim()) {
      addTodo(newText.trim(), priority, dueDate || undefined)
      setNewText('')
      setDueDate('')
      setPriority('medium')
    }
  }

  const handleToggle = (id: string) => {
    const todo = todos.find(t => t.id === id)
    toggleTodo(id)

    // Trigger celebration confetti
    if (todo && !todo.completed) {
      const remainingPending = todos.filter(t => !t.completed && t.id !== id).length
      if (remainingPending === 0) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#60A5FA', '#3B82F6', '#FBBF24', '#F87171', '#34D399']
        });
      } else {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 }
        });
      }
    }
  }

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const saveEdit = (id: string) => {
    if (editingText.trim()) {
      updateTodo(id, { text: editingText.trim() })
      setEditingId(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  return (
    <div className="flex-1 flex flex-col gap-6 md:flex-row max-w-6xl mx-auto w-full lg:h-[calc(100vh-180px)] min-h-[500px] lg:overflow-hidden p-2">
      {/* Kiri: Tambah Task Baru */}
      <div className="w-full md:w-80 flex flex-col bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon shrink-0 h-fit m-1.5">
        <h3 className="text-lg font-extrabold text-slate-800 mb-4">Buat Tugas Baru</h3>
        
        <form onSubmit={handleAddTodoSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
              Judul Tugas
            </label>
            <input
              type="text"
              placeholder="Apa yang ingin dikerjakan?"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full px-4 py-2.5 bg-blue-50 border-3 border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:border-brand-primary placeholder-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-550 mb-2 uppercase">
              Prioritas
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl border-2 font-bold capitalize text-xs transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-blue-300 text-slate-855 border-slate-800'
                        : p === 'medium'
                        ? 'bg-blue-200 text-slate-850 border-slate-800'
                        : 'bg-blue-100 text-slate-855 border-slate-800'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1.5">
              <FiCalendar /> Jatuh Tempo (Opsional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 bg-blue-50 border-3 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-slate-800 font-bold border-4 border-slate-800 rounded-2xl shadow-cartoon-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Tambah Tugas
          </button>
        </form>
      </div>

      {/* Kanan: Daftar Todos & Progress */}
      <div className="flex-1 flex flex-col gap-4 lg:h-full lg:overflow-hidden">
        {/* Progress & Filters header */}
        <div className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon flex flex-col gap-4 m-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Workspace Checklist</h2>
              <p className="text-xs text-slate-550 font-semibold mt-0.5">
                {pendingCount} tugas pending, {completedCount} selesai
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex border-3 border-slate-800 rounded-xl p-0.5 bg-slate-50 shrink-0 h-fit">
              {(['all', 'active', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                    filter === tab
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  {tab === 'all' ? 'Semua' : tab === 'active' ? 'Aktif' : 'Selesai'}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-full h-4 border-2 border-slate-800 overflow-hidden">
              <div
                className="bg-brand-primary h-full rounded-full transition-all duration-550"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-extrabold text-slate-700 w-10 text-right shrink-0">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Tasks Cards List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 pb-8">
          <AnimatePresence mode="popLayout">
            {sortedTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border-4 border-slate-800 rounded-[30px] p-10 shadow-cartoon flex flex-col items-center justify-center text-center m-1.5"
              >
                <EmptyTodoIllustration className="w-36 h-36 mb-2 animate-pulse" />
                <h4 className="font-extrabold text-slate-800">Daftar Tugas Kosong</h4>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs font-semibold">
                  {filter === 'all'
                    ? 'Buat tugas baru di form sebelah kiri untuk menyusun agenda workspace Anda!'
                    : filter === 'active'
                    ? 'Hebat! Semua tugas Anda saat ini sudah selesai dikerjakan.'
                    : 'Belum ada tugas yang Anda selesaikan. Ayo selesaikan satu!'}
                </p>
              </motion.div>
            ) : (
              sortedTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  className={`bg-white border-4 border-slate-800 rounded-[22px] p-4 flex items-center justify-between gap-4 transition-all shadow-cartoon-sm hover:shadow-cartoon-hover m-1 ${
                    todo.completed ? 'opacity-70 bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className={`w-7 h-7 rounded-xl border-3 border-slate-800 flex items-center justify-center transition-all shrink-0 hover:scale-105 active:scale-95 ${
                        todo.completed ? 'bg-brand-primary' : 'bg-slate-50'
                      }`}
                    >
                      {todo.completed && <FiCheck className="w-4.5 h-4.5 text-slate-850 stroke-[3]" />}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                            className="w-full px-3 py-1 border-2 border-slate-800 rounded-lg text-sm font-semibold focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="p-1 bg-blue-100 text-blue-700 rounded-lg border-2 border-slate-800"
                          >
                            <FiCheck className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 bg-blue-50 text-blue-600 rounded-lg border-2 border-slate-800"
                          >
                            <FiX className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`font-extrabold text-sm truncate block ${
                            todo.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {todo.text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges and actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border-2 border-slate-800 capitalize select-none ${
                        todo.priority === 'high'
                          ? 'bg-blue-300 text-blue-900'
                          : todo.priority === 'medium'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {todo.priority}
                    </span>

                    {/* Due Date */}
                    {todo.dueDate && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-300 flex items-center gap-1">
                        <FiCalendar /> {todo.dueDate}
                      </span>
                    )}

                    {/* Edit button */}
                    {!todo.completed && editingId !== todo.id && (
                      <button
                        onClick={() => startEdit(todo)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border-2 border-slate-800 rounded-xl"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-slate-800 rounded-xl"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
