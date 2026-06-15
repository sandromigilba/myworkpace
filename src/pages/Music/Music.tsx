import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiRefreshCw, FiExternalLink, FiSettings, FiCheck } from 'react-icons/fi'
import { useSpotifyStore } from '../../store/useSpotifyStore'
import { EmptySpotifyIllustration } from '../../components/Illustrations'

export default function MusicPlayer() {
  const {
    isConnected,
    accessToken,
    clientId,
    isPlaying,
    currentTrack,
    progressMs,
    volume,
    recentlyPlayed,
    playlists,
    connectSpotify,
    disconnectSpotify,
    setClientId,
    play,
    pause,
    next,
    prev,
    setVolume,
    setProgress,
    tickProgress,
    fetchSpotifyData
  } = useSpotifyStore()

  const [showConfig, setShowConfig] = useState(false)
  const [inputClientId, setInputClientId] = useState(clientId)
  const [configSaved, setConfigSaved] = useState(false)

  // Handle Spotify Redirect Token on Mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tokenMatch = hash.match(/access_token=([^&]*)/);
      const expiryMatch = hash.match(/expires_in=([^&]*)/);
      
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        const expiresSec = expiryMatch && expiryMatch[1] ? Number(expiryMatch[1]) : 3600;
        
        connectSpotify(token, expiresSec);
        
        // Clean up Hash from URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [connectSpotify]);

  // Audio Equalizer Simulation bars count
  const eqBars = Array.from({ length: 18 }, (_, i) => i + 1);

  // Interval for ticking track progress (1s tick)
  useEffect(() => {
    const interval = setInterval(() => {
      tickProgress();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickProgress]);

  // Interval for fetching real-time Spotify Playback state (every 6 seconds if connected)
  useEffect(() => {
    if (isConnected && accessToken) {
      fetchSpotifyData();
      const interval = setInterval(() => {
        fetchSpotifyData();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isConnected, accessToken, fetchSpotifyData]);

  // Trigger OAuth Implicit Grant Flow
  const handleConnectSpotify = () => {
    const redirectUri = `${window.location.origin}/music`;
    const scopes = [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(scopes)}&show_dialog=true`;

    window.location.href = authUrl;
  }

  const saveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputClientId.trim()) {
      setClientId(inputClientId.trim());
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2000);
    }
  }

  // Format Milliseconds to MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Calculate percentage of track progress
  const progressPercent = currentTrack.durationMs > 0 ? (progressMs / currentTrack.durationMs) * 100 : 0;

  // Handle Progress Bar clicks to Seek song
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = Math.min(Math.max(clickX / width, 0), 1);
    const newProgressMs = Math.floor(clickPercent * currentTrack.durationMs);
    setProgress(newProgressMs);
  }

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Settings bar */}
      <div className="flex justify-between items-center bg-white border-4 border-slate-800 rounded-[24px] p-4 shadow-cartoon-sm">
        <div className="flex items-center gap-2">
          <span className={`w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${isConnected ? 'bg-blue-400' : 'bg-brand-primary animate-pulse'}`} />
          <span className="font-extrabold text-sm text-slate-700">
            Status: {isConnected ? 'Terhubung ke Spotify Premium' : 'Menggunakan Mode Demo/Simulasi'}
          </span>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border-3 border-slate-800 rounded-xl text-xs font-bold transition-all shadow-cartoon-sm active:translate-y-0.5"
        >
          <FiSettings /> {showConfig ? 'Tutup Pengaturan' : 'Client ID Spotify'}
        </button>
      </div>

      {/* Spotify Config Modal details if toggled */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-slate-800 rounded-[24px] p-5 shadow-cartoon-sm"
        >
          <h4 className="font-extrabold text-slate-800 text-sm mb-2">Konfigurasi Pengembang Spotify</h4>
          <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
            Untuk menggunakan akun Spotify Anda sendiri, daftarkan aplikasi di <strong>Spotify Developer Dashboard</strong>. 
            Atur Redirect URI ke: <code className="px-1.5 py-0.5 bg-slate-100 border rounded text-blue-600 font-bold">{window.location.origin}/music</code>, lalu masukkan Client ID Anda di bawah.
          </p>
          <form onSubmit={saveClientId} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Masukkan Spotify Client ID..."
              value={inputClientId}
              onChange={(e) => setInputClientId(e.target.value)}
              className="flex-1 px-4 py-2 bg-blue-50 border-3 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-dark text-slate-800 font-bold border-3 border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1 shadow-cartoon-sm"
            >
              {configSaved ? <><FiCheck /> Tersimpan</> : 'Simpan ID'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Main Music Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom 1 & 2: Music Player Card (Utama) */}
        <div className="md:col-span-2 flex flex-col bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon items-center justify-center min-h-[480px] m-1.5">
          
          {/* Cover Art Box with Cartoon Shadows */}
          <div className="relative w-56 h-56 md:w-64 md:h-64 border-4 border-slate-800 rounded-[30px] overflow-hidden shadow-cartoon bg-blue-50 shrink-0 mb-6 group">
            <img
              src={currentTrack.albumImageUrl || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&q=80'}
              alt={currentTrack.albumName}
              className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-[1.03]' : ''}`}
            />
            {/* Equalizer animation overlays in center when playing */}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-6 gap-0.5 md:gap-1 px-4">
                {eqBars.map((bar) => {
                  const randomDelay = (Math.random() * 0.5 + 0.1).toFixed(2);
                  return (
                    <div
                      key={bar}
                      className="eq-bar w-1.5 md:w-2 bg-brand-primary rounded-t"
                      style={{
                        animationDuration: `${randomDelay}s`,
                        height: '8px'
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Track Text Info */}
          <div className="text-center w-full max-w-sm mb-6">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 truncate">
              {currentTrack.name}
            </h3>
            <p className="text-sm font-bold text-brand-primary-dark mt-1 truncate">
              {currentTrack.artist}
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">
              Album: {currentTrack.albumName}
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
              <span>{formatTime(currentTrack.durationMs)}</span>
            </div>
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center gap-6 mb-6">
            <button
              onClick={prev}
              title="Previous Track"
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
              title="Next Track"
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

        {/* Kolom 3: Connect Spotify Account & Playlists/Recently Played */}
        <div className="flex flex-col gap-6">
          
          {/* Spotify Connection Panel / Connect Area */}
          <div className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon m-1.5">
            <h3 className="font-extrabold text-slate-800 text-base mb-3">Integrasi Spotify</h3>
            
            {!isConnected ? (
              <div className="flex flex-col items-center text-center p-3">
                <EmptySpotifyIllustration className="w-28 h-28 mb-3" />
                <p className="text-xs font-semibold text-slate-550 leading-relaxed mb-4">
                  Hubungkan dengan Spotify untuk memutar playlist, album favorit, dan mengontrol audio langsung dari workspace.
                </p>
                <button
                  onClick={handleConnectSpotify}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-slate-800 font-bold border-4 border-slate-800 rounded-2xl shadow-cartoon-sm transition-all hover:-translate-y-0.5 active:translate-y-0 text-xs flex items-center justify-center gap-2"
                >
                  <FiExternalLink /> Hubungkan Spotify
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-3 bg-blue-50 border-3 border-blue-300 rounded-2xl text-center">
                  <p className="text-xs font-bold text-blue-700">
                    Akun Spotify Terhubung 🎉
                  </p>
                </div>
                
                <button
                  onClick={fetchSpotifyData}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 border-3 border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FiRefreshCw className="animate-spin-slow" /> Sinkronkan Pemutar
                </button>
                
                <button
                  onClick={disconnectSpotify}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-3 border-slate-800 rounded-xl text-xs font-bold"
                >
                  Putuskan Koneksi
                </button>
              </div>
            )}
          </div>

          {/* Recently Played / Playlist list */}
          <div className="bg-white border-4 border-slate-800 rounded-[30px] p-6 shadow-cartoon flex-1 flex flex-col gap-4 overflow-hidden m-1.5">
            <h3 className="font-extrabold text-slate-800 text-base">
              {isConnected ? 'Playlist Anda' : 'Baru-baru Ini Diputar'}
            </h3>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[220px] md:max-h-[300px]">
              {isConnected ? (
                playlists.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold text-center py-6">Tidak ada playlist ditemukan</p>
                ) : (
                  playlists.map((playlist) => (
                    <a
                      key={playlist.id}
                      href={playlist.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 border-2 border-slate-100 hover:border-slate-800 rounded-2xl transition-all"
                    >
                      <img
                        src={playlist.imageUrl || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=100&q=80'}
                        alt={playlist.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-800 truncate">
                          {playlist.name}
                        </h4>
                        <p className="text-[10px] text-slate-450 font-semibold">
                          {playlist.trackCount} Lagu
                        </p>
                      </div>
                      <FiExternalLink className="text-slate-400 w-4 h-4 shrink-0 mr-1" />
                    </a>
                  ))
                )
              ) : (
                recentlyPlayed.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 border-2 border-slate-100 rounded-2xl"
                  >
                    <img
                      src={track.albumImageUrl || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=100&q=80'}
                      alt={track.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-800 truncate">
                        {track.name}
                      </h4>
                      <p className="text-[10px] text-brand-primary-dark font-bold truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
