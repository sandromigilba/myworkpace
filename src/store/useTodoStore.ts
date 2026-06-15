import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
}

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
  addTodo: (text: string, priority: 'low' | 'medium' | 'high', dueDate?: string) => void
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  setFilter: (filter: 'all' | 'active' | 'completed') => void
  reorderTodos: (todos: Todo[]) => void
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [
        {
          id: '1',
          text: 'Pelajari fitur MyWorkspace 🚀',
          completed: false,
          priority: 'high',
          dueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          text: 'Hubungkan akun Spotify 🎵',
          completed: false,
          priority: 'medium',
          dueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          text: 'Membaca dokumen sitemap 📄',
          completed: true,
          priority: 'low',
          dueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ],
      filter: 'all',
      addTodo: (text, priority, dueDate) => set((state) => ({
        todos: [
          ...state.todos,
          {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            text,
            completed: false,
            priority,
            dueDate,
            createdAt: new Date().toISOString()
          }
        ]
      })),
      updateTodo: (id, updates) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, ...updates } : todo
        )
      })),
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id)
      })),
      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      })),
      setFilter: (filter) => set({ filter }),
      reorderTodos: (newTodos) => set({ todos: newTodos })
    }),
    {
      name: 'myworkspace-todos'
    }
  )
)
