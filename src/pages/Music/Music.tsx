import React, { useEffect, useState } from 'react'
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiSearch, FiFolder, FiMusic, FiDisc } from 'react-icons/fi'
import { useMusicStore } from '../../store/useMusicStore'

export default function MusicPlayer() {
  const {
    searchQuery,
    localTracks,
    isScanning,
    isPlaying,
    currentTrack,
    progressMs,
    volume,
    setSearchQuery,
    openFolder,
    playTrack,
    play,
    pause,
    next,
    prev,
    setVolume,
    setProgress,
    tickProgress
  } = useMusicStore()

  const [localSearchInput, setLocalSearchInput] = useState(searchQuery)

  // Track progress ticker interval (1s)
  useEffect(() => {
    const interval = setInterval(() => {
      tickProgress()
    }, 1000)
    return () => clearInterval(interval)
  }, [tickProgress])

  // Update store search query when local input changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(localSearchInput)
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [localSearchInput, setSearchQuery])

  // Format Milliseconds to MM:SS
  const formatTime = (ms: number) => {
    if (!ms || isNaN(ms)) return '0:00'
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = currentTrack && currentTrack.durationMs > 0 
    ? (progressMs / currentTrack.durationMs) * 100 
    : 0

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack || currentTrack.durationMs === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const clickPercent = Math.min(Math.max(clickX / width, 0), 1)
    const newProgressMs = Math.floor(clickPercent * currentTrack.durationMs)
    setProgress(newProgressMs)
  }

  // Filter tracks locally based on search
  const filteredTracks = localTracks.filter((track) => 
    track.name.toLowerCase().includes(localSearchInput.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-5xl mx-auto w-full p-2">
      
      {/* Folder Control & Search Bar Row */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border-4 border-slate-800 rounded-[24px] p-3 shadow-cartoon-sm m-1">
        <button
          onClick={openFolder}
          disabled={isScanning}
          className="px-5 py-3 bg-brand-primary hover:bg-brand-primary-dark text-slate-800 font-extrabold border-3 border-slate-800 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-cartoon-sm active:translate-y-0.5 shrink-0"
        >
          <FiFolder className="w-4.5 h-4.5" />
          {isScanning ? 'Membaca Folder...' : 'Buka Folder Musik'}
        </button>

        <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-blue-50/50 border-3 border-slate-800 rounded-xl">
          <FiSearch className="text-slate-500 w-5 h-5 shrink-0" />
          <input
            type="text"
            placeholder="Cari lagu di folder Anda..."
            value={localSearchInput}
            onChange={(e) => setLocalSearchInput(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom 1 & 2: Music Player Card (Utama) */}
        <div className="md:col-span-2 flex flex-col bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon items-center justify-center min-h-[460px] m-1.5">
          
          {/* Spinning Vinyl Record Visualizer */}
          <div className="relative w-52 h-52 md:w-60 md:h-60 mb-6 shrink-0 flex items-center justify-center">
            
            {/* Vinyl Record Plate */}
            <div 
              className="w-full h-full rounded-full bg-slate-900 border-8 border-slate-800 flex items-center justify-center relative shadow-cartoon select-none overflow-hidden"
              style={{
                animation: isPlaying ? 'spin 8s linear infinite' : 'none'
              }}
            >
              {/* Vinyl Grooves (Concentric Circles) */}
              <div className="absolute inset-4 rounded-full border border-slate-800/40" />
              <div className="absolute inset-8 rounded-full border border-slate-800/40" />
              <div className="absolute inset-12 rounded-full border border-slate-800/40" />
              <div className="absolute inset-16 rounded-full border border-slate-800/40" />
              <div className="absolute inset-20 rounded-full border border-slate-800/40" />
              <div className="absolute inset-24 rounded-full border border-slate-800/40" />
              <div className="absolute inset-28 rounded-full border border-slate-800/40" />

              {/* Center Record Label */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-primary border-4 border-slate-800 flex flex-col items-center justify-center text-center p-1.5 relative z-10">
                <FiDisc className={`w-8 h-8 text-slate-800 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                <span className="text-[8px] font-extrabold text-slate-800 truncate w-full mt-1">
                  {currentTrack ? currentTrack.name : 'No Song'}
                </span>
              </div>
            </div>

            {/* Tonearm Arm (Jarum Vinyl) */}
            <div 
              className="absolute top-[-10px] right-2 w-14 h-24 origin-top-right transition-transform duration-700 pointer-events-none z-20"
              style={{
                transform: isPlaying ? 'rotate(15deg)' : 'rotate(-10deg)',
              }}
            >
              {/* Simplified Cartoon Jarum/Tonearm SVG */}
              <svg className="w-full h-full" viewBox="0 0 60 100" fill="none">
                {/* Pivot base */}
                <circle cx="50" cy="10" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                <circle cx="50" cy="10" r="3" fill="#cbd5e1" />
                {/* Main metallic arm line */}
                <path d="M50 10 L25 80 L20 85" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M50 10 L25 80 L20 85" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                {/* Cartridge head */}
                <rect x="12" y="80" width="12" height="15" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" transform="rotate(25 18 85)" />
                {/* Needle stylus head pointer */}
                <circle cx="16" cy="92" r="1.5" fill="#facc15" />
              </svg>
            </div>
          </div>

          {/* Track Text Info */}
          <div className="text-center w-full max-w-sm mb-6">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-800 truncate">
              {currentTrack ? currentTrack.name : 'Tidak ada lagu dimuat'}
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-center gap-1.5">
              <span>{currentTrack ? currentTrack.sizeStr : '0.0 MB'}</span>
              {currentTrack && currentTrack.id !== 'default-1' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-350 rounded text-slate-600 font-extrabold text-[9px] uppercase">
                    File Lokal
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Progress Timeline Slider */}
          <div className="w-full max-w-md flex flex-col gap-2 mb-6">
            <div
              onClick={handleProgressBarClick}
              className="w-full bg-slate-100 h-3 border-2 border-slate-800 rounded-full cursor-pointer relative overflow-hidden group"
            >
              <div
                className="bg-brand-primary h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>{formatTime(progressMs)}</span>
              <span>{formatTime(currentTrack ? currentTrack.durationMs : 0)}</span>
            </div>
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center gap-6 mb-6">
            <button
              onClick={prev}
              title="Sebelumnya"
              className="w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 border-3 border-slate-800 flex items-center justify-center text-slate-800 transition-all hover:scale-105 active:scale-95 shadow-cartoon-sm"
            >
              <FiSkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={isPlaying ? pause : play}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-16 h-16 rounded-full bg-brand-primary hover:bg-brand-primary-dark text-slate-800 border-4 border-slate-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-cartoon"
            >
              {isPlaying ? <FiPause className="w-7 h-7" /> : <FiPlay className="w-7 h-7 ml-1" />}
            </button>

            <button
              onClick={next}
              title="Selanjutnya"
              className="w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 border-3 border-slate-800 flex items-center justify-center text-slate-800 transition-all hover:scale-105 active:scale-95 shadow-cartoon-sm"
            >
              <FiSkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Controller */}
          <div className="w-full max-w-xs flex items-center gap-3.5">
            <FiVolume2 className="text-slate-500 w-5 h-5 shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer border-2 border-slate-800 accent-brand-primary"
            />
            <span className="text-xs font-bold text-slate-500 w-6 text-right shrink-0">
              {volume}%
            </span>
          </div>

        </div>

        {/* Kolom 3: Local Folder Track List */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon m-1.5 flex flex-col gap-4 min-h-[460px] md:h-full overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 text-base">
                Daftar Lagu ({filteredTracks.length}) 📂
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[360px] md:max-h-[500px]">
              {filteredTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                  <FiMusic className="w-10 h-10 text-slate-300" />
                  <p className="text-xs text-slate-400 font-bold leading-normal">
                    {localTracks.length === 1 && localTracks[0].id === 'default-1'
                      ? 'Silakan buka folder local Anda untuk memuat lagu.'
                      : 'Lagu tidak ditemukan.'}
                  </p>
                </div>
              ) : (
                filteredTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex items-center gap-3.5 p-2.5 border-2 rounded-2xl text-left w-full transition-all ${
                      currentTrack && currentTrack.id === track.id
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-800 text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                      currentTrack && currentTrack.id === track.id 
                        ? 'bg-blue-100 border-blue-400 text-blue-800' 
                        : 'bg-slate-50 border-slate-800 text-slate-600'
                    }`}>
                      <FiMusic className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs truncate">
                        {track.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] opacity-75 font-semibold mt-0.5">
                        <span>{track.sizeStr}</span>
                        {track.durationMs > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-current" />
                            <span>{formatTime(track.durationMs)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="pt-3 border-t-2 border-slate-100 text-[10px] text-slate-400 font-semibold leading-relaxed">
              * Browser FileSystem Access memuat file musik Anda secara lokal langsung dari komputer. File Anda aman dan tidak diunggah ke internet.
            </div>
          </div>
        </div>

      </div>
      
      {/* CSS keyframes animation definition for vinyl spin */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </div>
  )
}
