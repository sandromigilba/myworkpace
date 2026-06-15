import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiTrash2, FiSearch, FiEdit3, FiEye, FiClock } from 'react-icons/fi'
import { useNotesStore } from '../../store/useNotesStore'
import { EmptyNotesIllustration } from '../../components/Illustrations'

// Simple zero-dependency Markdown parser for modern rich-text support
function renderMarkdown(text: string) {
  if (!text) return <p className="italic text-slate-400">Tidak ada konten...</p>;
  
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line;
    
    // Headers
    if (cleanLine.startsWith('# ')) {
      return <h1 key={idx} className="text-2xl font-extrabold text-slate-800 mt-4 mb-2">{cleanLine.substring(2)}</h1>;
    }
    if (cleanLine.startsWith('## ')) {
      return <h2 key={idx} className="text-xl font-bold text-slate-800 mt-3 mb-2">{cleanLine.substring(3)}</h2>;
    }
    if (cleanLine.startsWith('### ')) {
      return <h3 key={idx} className="text-lg font-bold text-slate-800 mt-2 mb-1">{cleanLine.substring(4)}</h3>;
    }
    
    // Unordered List
    if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
      return (
        <ul key={idx} className="list-disc list-inside ml-4 my-1 text-sm font-semibold">
          <li>{parseInlineFormatting(cleanLine.substring(2))}</li>
        </ul>
      );
    }
    
    // Checked list
    if (cleanLine.startsWith('[x] ')) {
      return (
        <div key={idx} className="flex items-center gap-2 my-1 text-sm font-semibold text-blue-600">
          <input type="checkbox" checked readOnly className="rounded border-slate-800" />
          <span className="line-through">{parseInlineFormatting(cleanLine.substring(4))}</span>
        </div>
      );
    }
    if (line.startsWith('[ ] ')) {
      return (
        <div key={idx} className="flex items-center gap-2 my-1 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={false} readOnly className="rounded border-slate-800" />
          <span>{parseInlineFormatting(cleanLine.substring(4))}</span>
        </div>
      );
    }

    // Default Paragraph
    return (
      <p key={idx} className="my-2 text-sm leading-relaxed font-semibold text-slate-700">
        {parseInlineFormatting(cleanLine)}
      </p>
    );
  });
}

function parseInlineFormatting(text: string): React.ReactNode[] {
  // Simple bold and code blocks inline parser
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const matches = text.split(regex);
  
  return matches.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-slate-850">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-blue-600 font-mono text-xs">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function Notes() {
  const { notes, activeNoteId, searchQuery, createNote, updateNote, deleteNote, setActiveNoteId, setSearchQuery } = useNotesStore()
  
  // Tab state: edit vs preview
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit')

  const activeNote = notes.find((n) => n.id === activeNoteId)

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateNote = () => {
    const newNote = createNote()
    setActiveNoteId(newNote.id)
    setEditorTab('edit')
  }

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-180px)] min-h-[500px] lg:overflow-hidden p-2">
      {/* Sidebar Catatan */}
      <div className="w-full lg:w-80 flex flex-col gap-4 bg-white border-4 border-slate-800 rounded-[30px] p-5 shadow-cartoon shrink-0 overflow-hidden m-1.5">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-slate-800">Daftar Catatan</h3>
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-dark text-slate-800 font-bold border-3 border-slate-800 rounded-xl text-xs shadow-cartoon-sm hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <FiPlus /> Baru
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Cari catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border-3 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-sm">
              Tidak ada catatan ditemukan.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`text-left p-4 border-3 rounded-2xl transition-all flex flex-col gap-1.5 ${
                  activeNoteId === note.id
                    ? 'bg-blue-50 border-blue-400 shadow-cartoon-sm'
                    : 'border-slate-100 hover:border-slate-800 bg-white'
                }`}
              >
                <h4 className="font-bold text-slate-800 text-sm truncate">
                  {note.title.trim() || 'Catatan Tanpa Judul'}
                </h4>
                <p className="text-xs text-slate-550 font-semibold line-clamp-2">
                  {note.content.trim() || 'Kosong'}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1">
                  <FiClock />
                  <span>{formatDate(note.dateModified)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon overflow-hidden m-1.5">
        <AnimatePresence mode="wait">
          {activeNote ? (
            <motion.div
              key={activeNote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col gap-4 overflow-hidden"
            >
              {/* Note Header (Controls & Tabs) */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b-2 border-slate-100 pb-4 shrink-0">
                {/* Title Input */}
                <input
                  type="text"
                  value={activeNote.title}
                  placeholder="Judul Catatan..."
                  onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                  className="w-full sm:flex-1 text-lg font-extrabold text-slate-800 bg-transparent border-b-3 border-transparent focus:border-brand-primary focus:outline-none pb-1"
                />

                {/* Tabs & Controls */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="flex border-3 border-slate-800 rounded-xl p-0.5 bg-slate-50">
                    <button
                      onClick={() => setEditorTab('edit')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        editorTab === 'edit'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      <FiEdit3 /> Edit
                    </button>
                    <button
                      onClick={() => setEditorTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        editorTab === 'preview'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      <FiEye /> Pratinjau
                    </button>
                  </div>

                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    title="Hapus Catatan"
                    className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-slate-800 rounded-xl transition-colors hover:scale-105 active:scale-95"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Metadata info */}
              <div className="text-[10px] font-bold text-slate-400 flex flex-wrap gap-x-4 shrink-0">
                <span>Dibuat: {formatDate(activeNote.dateCreated)}</span>
                <span>Diperbarui: {formatDate(activeNote.dateModified)}</span>
              </div>

              {/* Active Tab Area */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {editorTab === 'edit' ? (
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                    placeholder="Tulis ide hebat Anda di sini... (Mendukung Markdown sederhana: # Header, - Bullet list, **Tebal**, `Kode`)"
                    className="flex-1 w-full bg-blue-50/50 p-4 border-3 border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:border-brand-primary placeholder-slate-400 resize-none overflow-y-auto"
                  />
                ) : (
                  <div className="flex-1 w-full bg-blue-50/50 p-5 border-3 border-slate-800 rounded-2xl overflow-y-auto prose max-w-none text-left">
                    {renderMarkdown(activeNote.content)}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-6 text-center"
            >
              <EmptyNotesIllustration className="w-40 h-40 mb-4 animate-bounce" />
              <h3 className="text-xl font-extrabold text-slate-800">Tidak Ada Catatan Aktif</h3>
              <p className="text-sm font-semibold text-slate-500 mt-2 max-w-sm">
                Pilih salah satu catatan dari daftar di sebelah kiri atau buat catatan baru untuk mulai mendokumentasikan pemikiran Anda.
              </p>
              <button
                onClick={handleCreateNote}
                className="mt-6 px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-slate-800 font-bold border-4 border-slate-800 rounded-2xl shadow-cartoon-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Buat Catatan Pertama
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
