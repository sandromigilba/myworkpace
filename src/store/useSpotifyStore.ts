import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map((x) => possible[x % possible.length]).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export interface Track {
  id: string
  name: string
  artist: string
  albumName: string
  albumImageUrl: string
  durationMs: number
  audioUrl?: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  trackCount: number
  imageUrl: string
  externalUrl: string
}

const MOCK_TRACKS: Track[] = [
  {
    id: 'mock-1',
    name: 'Morning Coffee ☕',
    artist: 'Lofi Chill Cat',
    albumName: 'Pixel Cafe Dreams',
    albumImageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&auto=format&fit=crop&q=80',
    durationMs: 372000, // 6:12
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'mock-2',
    name: 'Dreamy Clouds ☁️',
    artist: 'Pastel Breeze',
    albumName: 'Sky Garden Melodies',
    albumImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
    durationMs: 425000, // 7:05
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'mock-3',
    name: 'Coding Adventure 💻',
    artist: 'Synth Keyboardist',
    albumName: 'Retro Cyberspace',
    albumImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&auto=format&fit=crop&q=80',
    durationMs: 302000, // 5:02
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'mock-4',
    name: 'Sunset Cruise 🌅',
    artist: 'Vaporwave Sailor',
    albumName: 'Neon Horizon',
    albumImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    durationMs: 302000, // 5:02
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  }
];

const MOCK_PLAYLISTS: SpotifyPlaylist[] = [
  {
    id: 'pl-1',
    name: 'Chill Lofi Workspace 🍵',
    trackCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=150&auto=format&fit=crop&q=80',
    externalUrl: 'https://spotify.com'
  },
  {
    id: 'pl-2',
    name: 'Synthwave Focus Drive ⚡',
    trackCount: 38,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150&auto=format&fit=crop&q=80',
    externalUrl: 'https://spotify.com'
  }
];

interface SpotifyState {
  isConnected: boolean
  accessToken: string | null
  tokenExpiresAt: number | null
  clientId: string
  
  // Player State (Unified)
  isPlaying: boolean
  currentTrack: Track
  progressMs: number
  volume: number // 0 to 100
  
  // Extra metadata
  recentlyPlayed: Track[]
  playlists: SpotifyPlaylist[]
  
  // Actions
  setClientId: (clientId: string) => void
  connectSpotify: (token: string, expiresIn: number) => void
  disconnectSpotify: () => void
  checkTokenValidity: () => void
  getAuthUrl: (redirectUri: string) => Promise<string>
  exchangeCode: (code: string, redirectUri: string) => Promise<boolean>
  
  // Control actions
  play: () => void
  pause: () => void
  next: () => void
  prev: () => void
  setVolume: (vol: number) => void
  setProgress: (ms: number) => void
  tickProgress: () => void
  fetchSpotifyData: () => Promise<void>
}

let mockAudioElement: HTMLAudioElement | null = null;

export const useSpotifyStore = create<SpotifyState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      accessToken: null,
      tokenExpiresAt: null,
      clientId: 'c1d9774d754b455b89ebc1c73662d556', // Placeholder default client ID
      
      isPlaying: false,
      currentTrack: MOCK_TRACKS[0],
      progressMs: 0,
      volume: 50,
      
      recentlyPlayed: MOCK_TRACKS.slice(1),
      playlists: MOCK_PLAYLISTS,
      
      setClientId: (clientId) => set({ clientId }),
      
      getAuthUrl: async (redirectUri) => {
        const verifier = generateRandomString(64);
        localStorage.setItem('spotify_code_verifier', verifier);
        const hashed = await sha256(verifier);
        const challenge = base64urlencode(hashed);
        const scopes = [
          'user-read-currently-playing',
          'user-read-playback-state',
          'user-modify-playback-state',
          'user-read-recently-played',
          'playlist-read-private',
          'playlist-read-collaborative'
        ].join(' ');
        
        return `https://accounts.spotify.com/authorize?client_id=${get().clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code&scope=${encodeURIComponent(scopes)}&code_challenge_method=S256&code_challenge=${challenge}&show_dialog=true`;
      },
      
      exchangeCode: async (code, redirectUri) => {
        const verifier = localStorage.getItem('spotify_code_verifier') || '';
        try {
          const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: get().clientId,
              grant_type: 'authorization_code',
              code,
              redirect_uri: redirectUri,
              code_verifier: verifier,
            }),
          });
          
          const data = await response.json();
          if (data.access_token) {
            get().connectSpotify(data.access_token, data.expires_in);
            localStorage.removeItem('spotify_code_verifier');
            return true;
          }
          return false;
        } catch (e) {
          console.error('Failed to exchange code', e);
          return false;
        }
      },
      
      connectSpotify: (token, expiresIn) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({
          accessToken: token,
          tokenExpiresAt: expiresAt,
          isConnected: true
        });
        get().fetchSpotifyData();
      },
      
      disconnectSpotify: () => {
        if (mockAudioElement) {
          mockAudioElement.pause();
        }
        set({
          accessToken: null,
          tokenExpiresAt: null,
          isConnected: false,
          isPlaying: false,
          currentTrack: MOCK_TRACKS[0],
          progressMs: 0,
          recentlyPlayed: MOCK_TRACKS.slice(1),
          playlists: MOCK_PLAYLISTS
        });
      },
      
      checkTokenValidity: () => {
        const { tokenExpiresAt, isConnected } = get();
        if (isConnected && tokenExpiresAt && Date.now() > tokenExpiresAt) {
          get().disconnectSpotify();
        }
      },
      
      play: async () => {
        const { isConnected, accessToken } = get();
        if (isConnected && accessToken) {
          try {
            await fetch('https://api.spotify.com/v1/me/player/play', {
              method: 'PUT',
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            set({ isPlaying: true });
          } catch (e) {
            console.error('Spotify Play error, toggling mock play', e);
            set({ isPlaying: true });
          }
        } else {
          const track = get().currentTrack;
          if (track.audioUrl) {
            if (!mockAudioElement) {
              mockAudioElement = new Audio(track.audioUrl);
            } else if (mockAudioElement.src !== track.audioUrl) {
              mockAudioElement.src = track.audioUrl;
            }
            mockAudioElement.volume = get().volume / 100;
            mockAudioElement.currentTime = get().progressMs / 1000;
            mockAudioElement.play().catch(console.error);
          }
          set({ isPlaying: true });
        }
      },
      
      pause: async () => {
        const { isConnected, accessToken } = get();
        if (isConnected && accessToken) {
          try {
            await fetch('https://api.spotify.com/v1/me/player/pause', {
              method: 'PUT',
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            set({ isPlaying: false });
          } catch (e) {
            console.error('Spotify Pause error, toggling mock pause', e);
            set({ isPlaying: false });
          }
        } else {
          if (mockAudioElement) {
            mockAudioElement.pause();
          }
          set({ isPlaying: false });
        }
      },
      
      next: () => {
        const { isConnected, accessToken, currentTrack } = get();
        if (isConnected && accessToken) {
          fetch('https://api.spotify.com/v1/me/player/next', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` }
          }).then(() => {
            setTimeout(() => get().fetchSpotifyData(), 500);
          }).catch(console.error);
        } else {
          // Mock Next
          const currentIndex = MOCK_TRACKS.findIndex((t) => t.id === currentTrack.id);
          const nextIndex = (currentIndex + 1) % MOCK_TRACKS.length;
          const nextTrack = MOCK_TRACKS[nextIndex];
          
          if (mockAudioElement && get().isPlaying) {
            mockAudioElement.src = nextTrack.audioUrl || '';
            mockAudioElement.currentTime = 0;
            mockAudioElement.play().catch(console.error);
          }
          
          set((state) => ({
            currentTrack: nextTrack,
            progressMs: 0,
            recentlyPlayed: [state.currentTrack, ...state.recentlyPlayed.filter((t) => t.id !== state.currentTrack.id)].slice(0, 5)
          }));
        }
      },
      
      prev: () => {
        const { isConnected, accessToken, currentTrack } = get();
        if (isConnected && accessToken) {
          fetch('https://api.spotify.com/v1/me/player/previous', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` }
          }).then(() => {
            setTimeout(() => get().fetchSpotifyData(), 500);
          }).catch(console.error);
        } else {
          // Mock Prev
          const currentIndex = MOCK_TRACKS.findIndex((t) => t.id === currentTrack.id);
          let prevIndex = currentIndex - 1;
          if (prevIndex < 0) prevIndex = MOCK_TRACKS.length - 1;
          const prevTrack = MOCK_TRACKS[prevIndex];
          
          if (mockAudioElement && get().isPlaying) {
            mockAudioElement.src = prevTrack.audioUrl || '';
            mockAudioElement.currentTime = 0;
            mockAudioElement.play().catch(console.error);
          }
          
          set((state) => ({
            currentTrack: prevTrack,
            progressMs: 0,
            recentlyPlayed: [state.currentTrack, ...state.recentlyPlayed.filter((t) => t.id !== state.currentTrack.id)].slice(0, 5)
          }));
        }
      },
      
      setVolume: (volume) => {
        const { isConnected, accessToken } = get();
        set({ volume });
        if (isConnected && accessToken) {
          fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}` }
          }).catch(console.error);
        } else {
          if (mockAudioElement) {
            mockAudioElement.volume = volume / 100;
          }
        }
      },
      
      setProgress: (progressMs) => {
        const { isConnected, accessToken } = get();
        set({ progressMs });
        if (isConnected && accessToken) {
          fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${progressMs}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}` }
          }).catch(console.error);
        } else {
          if (mockAudioElement) {
            mockAudioElement.currentTime = progressMs / 1000;
          }
        }
      },
      
      tickProgress: () => {
        const { isPlaying, isConnected, progressMs, currentTrack } = get();
        if (isPlaying) {
          if (!isConnected && mockAudioElement) {
            const currentMs = Math.floor(mockAudioElement.currentTime * 1000);
            if (mockAudioElement.ended || currentMs >= currentTrack.durationMs) {
              get().next();
            } else {
              set({ progressMs: currentMs });
            }
          } else {
            const nextProgress = progressMs + 1000;
            if (nextProgress >= currentTrack.durationMs) {
              get().next();
            } else {
              set({ progressMs: nextProgress });
            }
          }
        }
      },
      
      fetchSpotifyData: async () => {
        const { isConnected, accessToken } = get();
        if (!isConnected || !accessToken) return;
        
        try {
          // Fetch currently playing
          const playerRes = await fetch('https://api.spotify.com/v1/me/player', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (playerRes.status === 200) {
            const playerData = await playerRes.json();
            if (playerData && playerData.item) {
              set({
                isPlaying: playerData.is_playing,
                progressMs: playerData.progress_ms,
                volume: playerData.device?.volume_percent || 50,
                currentTrack: {
                  id: playerData.item.id,
                  name: playerData.item.name,
                  artist: playerData.item.artists.map((a: any) => a.name).join(', '),
                  albumName: playerData.item.album.name,
                  albumImageUrl: playerData.item.album.images[0]?.url || '',
                  durationMs: playerData.item.duration_ms
                }
              });
            }
          } else if (playerRes.status === 401) {
            // Expired
            get().disconnectSpotify();
            return;
          }
          
          // Fetch recently played
          const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (recentRes.status === 200) {
            const recentData = await recentRes.json();
            const tracks: Track[] = recentData.items.map((item: any) => ({
              id: item.track.id,
              name: item.track.name,
              artist: item.track.artists.map((a: any) => a.name).join(', '),
              albumName: item.track.album.name,
              albumImageUrl: item.track.album.images[0]?.url || '',
              durationMs: item.track.duration_ms
            }));
            set({ recentlyPlayed: tracks });
          }
          
          // Fetch user playlists
          const playlistsRes = await fetch('https://api.spotify.com/v1/me/playlists?limit=5', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (playlistsRes.status === 200) {
            const playlistsData = await playlistsRes.json();
            const playlists: SpotifyPlaylist[] = playlistsData.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              trackCount: item.tracks.total,
              imageUrl: item.images[0]?.url || '',
              externalUrl: item.external_urls.spotify
            }));
            set({ playlists });
          }
          
        } catch (e) {
          console.error('Failed to fetch data from Spotify API', e);
        }
      }
    }),
    {
      name: 'myworkspace-spotify',
      partialize: (state) => ({
        isConnected: state.isConnected,
        accessToken: state.accessToken,
        tokenExpiresAt: state.tokenExpiresAt,
        clientId: state.clientId,
        volume: state.volume
      })
    }
  )
)
