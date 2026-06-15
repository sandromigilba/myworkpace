import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Note {
  id: string
  title: string
  content: string
  dateCreated: string
  dateModified: string
}

interface NotesState {
  notes: Note[]
  activeNoteId: string | null
  searchQuery: string
  createNote: () => Note
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void
  deleteNote: (id: string) => void
  setActiveNoteId: (id: string | null) => void
  setSearchQuery: (query: string) => void
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [
        {
          id: '1',
          title: 'Selamat Datang di Workspace Anda! 👋',
          content: 'Ini adalah catatan pertama Anda. Anda dapat mengedit catatan ini atau membuat catatan baru dengan mengklik tombol "Catatan Baru" di sebelah kiri.\n\nMyWorkspace mendukung format teks biasa dan penyimpanan otomatis secara real-time ke dalam browser Anda.',
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString()
        }
      ],
      activeNoteId: '1',
      searchQuery: '',
      createNote: () => {
        const newNote: Note = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          title: 'Catatan Baru',
          content: '',
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString()
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: newNote.id
        }));
        return newNote;
      },
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id
            ? {
                ...note,
                ...updates,
                dateModified: new Date().toISOString()
              }
            : note
        )
      })),
      deleteNote: (id) => set((state) => {
        const remainingNotes = state.notes.filter((note) => note.id !== id);
        let nextActiveId = state.activeNoteId;
        if (state.activeNoteId === id) {
          nextActiveId = remainingNotes.length > 0 ? remainingNotes[0].id : null;
        }
        return {
          notes: remainingNotes,
          activeNoteId: nextActiveId
        };
      }),
      setActiveNoteId: (id) => set({ activeNoteId: id }),
      setSearchQuery: (query) => set({ searchQuery: query })
    }),
    {
      name: 'myworkspace-notes',
    }
  )
)
