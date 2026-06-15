import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Track {
  id: string
  name: string
  sizeStr: string
  durationMs: number
  file: File
  artist?: string
  albumName?: string
  albumImageUrl?: string
}

interface MusicState {
  searchQuery: string
  localTracks: Track[]
  isScanning: boolean
  isPlaying: boolean
  currentTrack: Track
  progressMs: number
  volume: number
  
  setSearchQuery: (query: string) => void
  openFolder: () => Promise<void>
  playTrack: (track: Track) => void
  play: () => void
  pause: () => void
  next: () => void
  prev: () => void
  setVolume: (vol: number) => void
  setProgress: (ms: number) => void
  tickProgress: () => void
}

let audioInstance: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;

const DEFAULT_TRACK: Track = {
  id: 'default-1',
  name: 'Lofi Focus Beat (Demo)',
  sizeStr: '4.5 MB',
  durationMs: 372000,
  file: new File([""], "lofi-focus.mp3", { type: "audio/mp3" }),
  artist: 'File Lokal',
  albumName: 'Folder Lokal',
  albumImageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&q=80'
};

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      localTracks: [DEFAULT_TRACK],
      isScanning: false,
      isPlaying: false,
      currentTrack: DEFAULT_TRACK,
      progressMs: 0,
      volume: 50,

      setSearchQuery: (query) => set({ searchQuery: query }),

      openFolder: async () => {
        if (!('showDirectoryPicker' in window)) {
          alert('Browser Anda tidak mendukung Folder Access API. Silakan gunakan Chrome, Edge, atau Opera.');
          return;
        }

        set({ isScanning: true });
        try {
          const handle = await (window as any).showDirectoryPicker();
          const tracks: Track[] = [];
          
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              const ext = file.name.split('.').pop()?.toLowerCase();
              const isAudio = 
                file.type.startsWith('audio/') || 
                ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(ext || '');
                
              if (isAudio) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                tracks.push({
                  id: file.name + '-' + file.lastModified,
                  name: file.name.replace(/\.[^/.]+$/, ""),
                  sizeStr: `${sizeMB} MB`,
                  durationMs: 0,
                  file: file,
                  artist: 'File Lokal',
                  albumName: 'Folder Lokal',
                  albumImageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&q=80'
                });
              }
            }
          }

          if (tracks.length > 0) {
            set({ localTracks: tracks, currentTrack: tracks[0] });
            if (audioInstance) {
              audioInstance.pause();
            }
            set({ isPlaying: false, progressMs: 0 });
            get().playTrack(tracks[0]);
          } else {
            alert('Tidak ada file audio (.mp3, .wav, .m4a, dll.) ditemukan di folder tersebut.');
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            console.error('Failed to read directory', e);
          }
        } finally {
          set({ isScanning: false });
        }
      },

      playTrack: (track) => {
        if (audioInstance) {
          audioInstance.pause();
        }
        
        if (currentBlobUrl) {
          URL.revokeObjectURL(currentBlobUrl);
          currentBlobUrl = null;
        }

        if (track.id === 'default-1') {
          audioInstance = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        } else {
          currentBlobUrl = URL.createObjectURL(track.file);
          audioInstance = new Audio(currentBlobUrl);
        }

        audioInstance.volume = get().volume / 100;
        audioInstance.currentTime = 0;
        
        audioInstance.addEventListener('loadedmetadata', () => {
          if (audioInstance) {
            const durationMs = Math.floor(audioInstance.duration * 1000);
            set((state) => ({
              currentTrack: { ...state.currentTrack, durationMs }
            }));
            
            set((state) => ({
              localTracks: state.localTracks.map((t) => 
                t.id === track.id ? { ...t, durationMs } : t
              )
            }));
          }
        });

        audioInstance.play().catch((err) => {
          console.error('Audio playback failed', err);
        });

        set({
          currentTrack: track,
          isPlaying: true,
          progressMs: 0
        });
      },

      play: () => {
        const { currentTrack, volume, progressMs } = get();
        
        if (!audioInstance) {
          if (currentTrack.id === 'default-1') {
            audioInstance = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
          } else {
            currentBlobUrl = URL.createObjectURL(currentTrack.file);
            audioInstance = new Audio(currentBlobUrl);
          }
        }

        audioInstance.volume = volume / 100;
        audioInstance.currentTime = progressMs / 1000;
        audioInstance.play().catch((err) => {
          console.error('Audio playback resume failed', err);
        });

        set({ isPlaying: true });
      },

      pause: () => {
        if (audioInstance) {
          audioInstance.pause();
        }
        set({ isPlaying: false });
      },

      next: () => {
        const { currentTrack, localTracks, searchQuery } = get();
        const filtered = localTracks.filter((t) => 
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length === 0) return;

        const currentIndex = filtered.findIndex((t) => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % filtered.length;
        get().playTrack(filtered[nextIndex]);
      },

      prev: () => {
        const { currentTrack, localTracks, searchQuery } = get();
        const filtered = localTracks.filter((t) => 
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length === 0) return;

        const currentIndex = filtered.findIndex((t) => t.id === currentTrack.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = filtered.length - 1;
        get().playTrack(filtered[prevIndex]);
      },

      setVolume: (vol) => {
        set({ volume: vol });
        if (audioInstance) {
          audioInstance.volume = vol / 100;
        }
      },

      setProgress: (ms) => {
        set({ progressMs: ms });
        if (audioInstance) {
          audioInstance.currentTime = ms / 1000;
        }
      },

      tickProgress: () => {
        const { isPlaying, currentTrack } = get();
        if (isPlaying && audioInstance) {
          const currentMs = Math.floor(audioInstance.currentTime * 1000);
          if (audioInstance.ended || (currentTrack.durationMs > 0 && currentMs >= currentTrack.durationMs)) {
            get().next();
          } else {
            set({ progressMs: currentMs });
          }
        }
      }
    }),
    {
      name: 'myworkspace-music',
      partialize: (state) => ({
        volume: state.volume
      })
    }
  )
)
