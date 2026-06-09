import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Search, 
  Library, 
  MoreVertical, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  ChevronDown, 
  Shuffle, 
  Repeat, 
  Share2, 
  Smartphone,
  Bell,
  Plus,
  Upload,
  UserPlus,
  LogOut,
  Music,
  Tv,
  Radio,
  Sliders,
  Sparkles,
  ListMusic,
  Compass,
  CheckCircle2,
  Lock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
import { Screen, Track, Playlist, UserProfile } from './types';

// --- Data & Helpers ---
import { TRACKS, INITIAL_PLAYLISTS } from './data/tracks';
import { audio } from './utils/audioEngine';

// --- Sub-Components ---
import AudioVisualizer from './components/AudioVisualizer';
import SoundscapeMixer from './components/SoundscapeMixer';
import EqualizerPanel from './components/EqualizerPanel';
import PlaylistDetail from './components/PlaylistDetail';
import PartyMode from './components/PartyMode';

// Haptic feedback simulator helper
const triggerHaptic = (ms = 15) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch (e) {
      // Ignored if blocked by interactive gesture
    }
  }
};

const DEFAULT_USER: UserProfile = {
  name: "Freddy Choudja",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBugXB-cgfSE-tzUJ2iep-8Xnaou0t6iA0Knqroi849myMwFqYaOFLHo65zsZ1anNO_Y_g8_7RfThsmjCpryl7i1FACkwMVfXxjGj158AXyXJiNwhGYDR9DH1U97Tp6loVlOQkRMEIHXDeag1tj4CCgZyto9avDd_OTqpjk4LLsnm4Wggf7KAlwE1HOaplFGUDyfT4iU86S26-kCGbf_JXWQUlu0-TlFPqKUzhno4jbtSBawHioDsf8MV1sdJrrTMACahVQasqAMy29",
  followers: 124,
  following: 89
};

export default function App() {
  // Navigation Screens
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Tracks & Playback States
  const [tracksList, setTracksList] = useState<Track[]>(TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100 %
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [volume, setVolume] = useState(0.6);

  // Playback Modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false); // loop current song
  const [queue, setQueue] = useState<Track[]>(TRACKS.slice(1));
  const [likedSongIds, setLikedSongIds] = useState<string[]>(['ethereal']);

  // Playlists (Curated + Custom Customizations)
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  // Search State Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string | null>(null);

  // Auth & Profile
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);

  // Android Installation PWA prompts
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidInstallAlert, setShowAndroidInstallAlert] = useState(false);

  // Lyrics Options (Premium Translating Mode)
  const [showTranslateLyrics, setShowTranslateLyrics] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Jam Mode (Social shared Listening) - Added Value Feature
  const [jamModeActive, setJamModeActive] = useState(false);
  const [jamListeners, setJamListeners] = useState<string[]>([]);
  const [jamAlert, setJamAlert] = useState<string | null>(null);

  // Offline Audio Cache Status Mode
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // AI-DJs prompt commentary (Simulated voice/narrative generation) - Added Value Feature
  const [aiDjActive, setAiDjActive] = useState(false);
  const [aiDjCommentary, setAiDjCommentary] = useState<string>('');
  const [isGeneratingAiCommentary, setIsGeneratingAiCommentary] = useState(false);

  // Sync Audio Engine on Track switch
  useEffect(() => {
    if (isPlaying) {
      audio.playTrack(currentTrack);
    } else {
      audio.stopTrack();
    }
  }, [currentTrack.id, isPlaying]);

  // Sync Volume
  useEffect(() => {
    audio.setVolume(volume);
  }, [volume]);

  // Sync Track time ticking
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const nextVal = prev + (100 / currentTrack.duration);
          if (nextVal >= 100) {
            handleTrackFinished();
            return 0;
          }
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  // Derive active elapsed seconds
  useEffect(() => {
    const elapsed = Math.min(
      Math.floor((progress * currentTrack.duration) / 100),
      currentTrack.duration
    );
    setCurrentTimeSec(elapsed);
  }, [progress, currentTrack.duration]);

  // Auto-scroller for active synced lyrics
  useEffect(() => {
    if (!lyricsContainerRef.current) return;
    const activeLineElement = lyricsContainerRef.current.querySelector('.lyric-active');
    if (activeLineElement) {
      activeLineElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTimeSec]);

  // Watch for Android PWA Prompt
  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  // Handle music track ending: Repeat vs Queue vs Loop
  const handleTrackFinished = () => {
    if (isRepeat) {
      setProgress(0);
      setCurrentTimeSec(0);
      triggerHaptic(20);
    } else {
      playNextSong();
    }
  };

  const playNextSong = () => {
    triggerHaptic(15);
    if (queue.length > 0) {
      const next = queue[0];
      const newQueue = queue.slice(1);
      // Recycle current Track to the back of history
      setQueue([...newQueue, currentTrack]);
      setCurrentTrack(next);
      setProgress(0);
      setCurrentTimeSec(0);
    } else {
      // Repeat current song if queue is empty
      setProgress(0);
      setCurrentTimeSec(0);
    }
  };

  const playPrevSong = () => {
    triggerHaptic(15);
    // Move last item in queue back to current, push current to top of queue
    if (queue.length > 0) {
      const prev = queue[queue.length - 1];
      const newQueue = [currentTrack, ...queue.slice(0, queue.length - 1)];
      setQueue(newQueue);
      setCurrentTrack(prev);
      setProgress(0);
      setCurrentTimeSec(0);
    } else {
      setProgress(0);
      setCurrentTimeSec(0);
    }
  };

  const handleSelectSongDirect = (track: Track) => {
    triggerHaptic(15);
    // Put other tracks to Queue
    const remaining = tracksList.filter(t => t.id !== track.id);
    setQueue(remaining);
    setCurrentTrack(track);
    setProgress(0);
    setCurrentTimeSec(0);
    setIsPlaying(true);
    triggerAiDjIntroduction(track);
  };

  // Play full Playlist
  const handlePlayPlaylist = (playlistTracks: Track[], shuffle: boolean) => {
    triggerHaptic(25);
    if (playlistTracks.length === 0) return;
    
    let listToPlay = [...playlistTracks];
    if (shuffle) {
      listToPlay.sort(() => Math.random() - 0.5);
    }

    const first = listToPlay[0];
    const rest = listToPlay.slice(1);

    setCurrentTrack(first);
    setQueue(rest);
    setProgress(0);
    setCurrentTimeSec(0);
    setIsPlaying(true);
    setCurrentScreen('player');
    triggerAiDjIntroduction(first);
  };

  // Toggle Song Like
  const handleToggleLike = (id: string) => {
    triggerHaptic(12);
    let updatedLikes = [...likedSongIds];
    if (likedSongIds.includes(id)) {
      updatedLikes = likedSongIds.filter(x => x !== id);
    } else {
      updatedLikes.push(id);
    }
    setLikedSongIds(updatedLikes);

    // Dynamic updating in playlists Liked Tracks
    const likedSongsObjects = tracksList.filter(t => updatedLikes.includes(t.id));
    setPlaylists(prev => prev.map(p => {
      if (p.id === 'liked') {
        return { ...p, tracks: likedSongsObjects };
      }
      return p;
    }));
  };

  // Create User Custom Playlist
  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    triggerHaptic(20);
    const newP: Playlist = {
      id: `custom_${Date.now()}`,
      name: newPlaylistName,
      description: newPlaylistDesc || "Votre sélection musicale raffinée.",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCrOaIXvGf14UOLwCm4IShUyA-5E2IAUM8AdPe_CzLgB21kQud9yCaGrNcabA9my8DbkwcYAykB7YJcNFkT3K7M_8uCEvljzVCmsLfzOvkAma9YhFHXUyLlRSJOVlg0vYXLe2emP-mUPU88pKMR6rBZ7Ka43VJUU5gxO9xV3lfSyDrtEBsh_d5aWVrjcHSFh-FTbDBcvET0cKjPL9_YAyXv2erqwvjg0GJdbvF5DvDNs7pZq8JOxETHjtIo7elNZjzqLZ1zbWjQkJy",
      tracks: [],
      isCustom: true
    };

    setPlaylists([...playlists, newP]);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylistModal(false);
  };

  // Add song to playlist
  const handleAddSongToPlaylist = (playlistId: string, track: Track) => {
    triggerHaptic(15);
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        // Prevent duplicate
        if (p.tracks.some(t => t.id === track.id)) return p;
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    }));

    // Trigger instant notification banner
    setJamAlert(`Ajouté à "${playlists.find(p => p.id === playlistId)?.name}" !`);
    setTimeout(() => setJamAlert(null), 2500);
  };

  // AI DJ Introduction Commentary Generator
  const triggerAiDjIntroduction = (track: Track) => {
    if (!aiDjActive) return;

    setIsGeneratingAiCommentary(true);
    setAiDjCommentary('');

    // Pre-made extremely futuristic visual DJ Commentary phrases
    const phrases = [
      `🎧 "Yoo ! C'est votre AI DJ Kliv en cabine. On s'écoute '${track.title}' par ${track.artist}. Ce morceau vibre à ${track.bpm} BPM... Montez le volume de vos écouteurs, ressentez le kick !"`,
      `✨ "Wassup Kliv Squad ! DJ Alpha par ici. On plonge directement dans '${track.title}', un de vos favoris. Une ambiance parfaite pour se focus. Let's drift !"`,
      `🌴 "Kliv Horizon AI DJ en ligne. Laissez-vous porter par la mélodie de '${track.title}'. N'oubliez pas d'activer le bruit de Pluie en arrière-plan !"`,
      `⚡ "Flash Info Groove ! '${track.title}' vient de démarrer. Un classique du genre ${track.genre}. C'est parti pour l'immersion totale !"`,
    ];

    setTimeout(() => {
      setAiDjCommentary(phrases[Math.floor(Math.random() * phrases.length)]);
      setIsGeneratingAiCommentary(false);
    }, 1200);
  };

  // Toggle Jam Session (Shared group list)
  const toggleJamSession = () => {
    triggerHaptic(20);
    if (!jamModeActive) {
      setJamModeActive(true);
      setJamListeners(['Alex', 'Lina', 'Sarah']);
      setJamAlert("⚡ Sessions Kliv Jam démarrée avec 3 co-auditeurs !");
      setTimeout(() => setJamAlert(null), 3000);
    } else {
      setJamModeActive(false);
      setJamListeners([]);
      setJamAlert("Session Jam clôturée.");
      setTimeout(() => setJamAlert(null), 2000);
    }
  };

  // Offline Mode Toggle
  const toggleOfflineMode = () => {
    triggerHaptic(15);
    setIsOfflineMode(!isOfflineMode);
    setJamAlert(!isOfflineMode ? "⚠️ Mode hors-ligne activé. Cache local Kliv actif." : "Connexion réseau rétablie.");
    setTimeout(() => setJamAlert(null), 2500);
  };

  // Format Elapsed Time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter Tracks on Search & Genre
  const filteredTracks = tracksList.filter(track => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = track.title.toLowerCase().includes(query) || 
                         track.artist.toLowerCase().includes(query) || 
                         track.genre.toLowerCase().includes(query);
    const matchesGenre = selectedGenreFilter ? track.genre === selectedGenreFilter : true;
    return matchesQuery && matchesGenre;
  });

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30 pb-20">
      
      {/* Dynamic Notification Toast Banner */}
      <AnimatePresence>
        {jamAlert && (
          <motion.div 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-2 left-4 right-4 z-50 bg-[#1e3f28]/95 backdrop-blur border border-primary/30 text-primary text-xs font-black uppercase tracking-wider p-3 px-4 rounded-xl flex items-center justify-between shadow-lg"
          >
            <span className="truncate">{jamAlert}</span>
            <CheckCircle2 size={16} className="shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Top Header bar --- */}
      <header className={`fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 transition-all ${currentScreen === 'player' ? 'opacity-0 pointer-events-none' : 'bg-background/80 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-2">
          {isOfflineMode && (
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
              <WifiOff size={10} /> Hors-ligne
            </div>
          )}
          {currentScreen === 'home' && (
            <h1 className="text-2xl font-black text-primary tracking-tighter">Écouter</h1>
          )}
          {currentScreen === 'search' && (
             <h1 className="text-2xl font-black text-primary tracking-tighter">Parcourir</h1>
          )}
          {currentScreen === 'library' && (
             <h1 className="text-2xl font-black text-primary tracking-tighter">Ma Musique</h1>
          )}
          {currentScreen === 'playlist' && (
             <h1 className="text-2xl font-black text-primary tracking-tighter">Playlist</h1>
          )}
          {currentScreen === 'profile' && (
             <h1 className="text-2xl font-black text-primary tracking-tighter">Profil</h1>
          )}
          {currentScreen === 'equalizer' && (
             <h1 className="text-2xl font-black text-primary tracking-tighter">Égaliseur</h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Equalizer Button */}
          <button 
            onClick={() => { triggerHaptic(10); setCurrentScreen('equalizer'); }}
            className={`p-2 rounded-full transition-colors ${currentScreen === 'equalizer' ? 'bg-primary text-background' : 'bg-white/5 text-on-surface-variant'}`}
            title="Égaliseur"
          >
            <Sliders size={18} />
          </button>

          {/* Offline switch */}
          <button 
            onClick={toggleOfflineMode}
            className={`p-2 rounded-full transition-colors ${isOfflineMode ? 'bg-[#3b3a1a] text-yellow-400' : 'bg-white/5 text-on-surface-variant'}`}
            title="Mode Hors-ligne"
          >
            <Wifi size={18} />
          </button>

          {/* Profile launcher */}
          <button 
            onClick={() => setCurrentScreen('profile')}
            className="w-8 h-8 rounded-full bg-surface-high overflow-hidden border border-white/10 active:scale-90 transition-all"
          >
            <img 
              src={userProfile.avatar} 
              alt="User" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* --- Main Contents Container --- */}
      <main className="pb-36 pt-20 px-4 max-w-lg mx-auto overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME SCREEN */}
          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Recently played horizontal grid */}
              <section className="grid grid-cols-2 gap-2.5">
                {tracksList.slice(0, 4).map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => handleSelectSongDirect(item)}
                    className="flex items-center bg-surface/50 hover:bg-surface border border-white/5 transition-all rounded-xl overflow-hidden h-14 group text-left relative"
                  >
                    <img src={item.cover} alt={item.alt} referrerPolicy="no-referrer" className="w-14 h-14 object-cover" />
                    <span className="px-3 font-bold text-xs truncate flex-1">{item.title}</span>
                    {currentTrack.id === item.id && isPlaying && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary absolute right-3 animate-ping" />
                    )}
                  </button>
                ))}
              </section>

              {/* Android native app launcher banner */}
              <section className="bg-gradient-to-br from-[#12281a] to-surface rounded-2xl p-4 border border-primary/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-5 translate-x-5" />
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                    <Smartphone size={24} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[9px] uppercase tracking-widest font-black text-primary">Kliv Android Mobile</span>
                    </div>
                    <h3 className="font-bold text-sm text-white">Installer sur votre Android</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Ajoutez Kliv à votre écran d'un simple clic pour profiter de l'expérience plein écran immersive avec vibrations haptiques et support hors-ligne optimal.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 pt-1">
                  <button 
                    onClick={() => {
                      triggerHaptic(20);
                      if (deferredPrompt) {
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult: any) => {
                          if (choiceResult.outcome === 'accepted') {
                            setDeferredPrompt(null);
                          }
                        });
                      } else {
                        setShowAndroidInstallAlert(true);
                      }
                    }}
                    className="w-full py-2.5 bg-primary text-background font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-md"
                  >
                    Installer Kliv (.PWA)
                  </button>
                </div>
              </section>

              {/* Added Value Slider: Prompt Jam Listening */}
              <section className="bg-surface/40 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                       <Radio size={16} className="text-primary animate-pulse" />
                       Écoute Communes (Jam Mode)
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant">L'avantage Kliv communautaire</p>
                  </div>
                  <button 
                    onClick={toggleJamSession}
                    className={`px-3 py-1.5 rounded-full text-[9px] uppercase font-black tracking-widest transition-colors ${jamModeActive ? 'bg-primary text-background' : 'bg-white/5 text-white'}`}
                  >
                    {jamModeActive ? 'Quitter Jam' : 'Rejoindre Jam'}
                  </button>
                </div>
                {jamModeActive && (
                  <div className="bg-black/20 p-2.5 rounded-xl text-xs space-y-2">
                    <p className="text-[10px] font-bold text-primary animate-pulse">👥 ÉCOUTE COMMUNE ACTIVE</p>
                    <p className="text-on-surface-variant">Vous écoutez de concert avec : <span className="font-bold text-white font-mono">{jamListeners.join(', ')}</span></p>
                    <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-2/3 rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
              </section>

              {/* Curated Recommendations Carousel */}
              <section className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <h2 className="text-xl font-bold">Sélectionné pour vous</h2>
                  <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Kliv Algorithme</span>
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
                  {tracksList.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => handleSelectSongDirect(item)}
                      className="flex-shrink-0 w-40 group text-left transition-transform duration-300 hover:scale-[1.02]"
                    >
                      <div className="relative aspect-square mb-2 rounded-xl overflow-hidden shadow-lg border border-white/5">
                        <img 
                          src={item.cover} 
                          alt={item.alt} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90">
                             <Play fill="black" size={24} className="ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest text-[#22c55e]">
                          {item.bpm} BPM
                        </div>
                      </div>
                      <p className="font-bold text-sm truncate">{item.title}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{item.artist}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Interactive Quick Playlists Cards */}
              <section className="space-y-4">
                <h2 className="text-xl font-bold">Vos Playlists de Rêve</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => { setSelectedPlaylist(pl); setCurrentScreen('playlist'); }}
                      className="flex gap-3 bg-surface/30 hover:bg-surface/60 border border-white/5 p-3 rounded-2xl text-left items-center transition-all group active:scale-[0.98]"
                    >
                      <img src={pl.cover} alt={pl.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">{pl.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold truncate">{pl.tracks.length} morceaux</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Upload Song section if User has creators account */}
              <section className="bg-[#22c55e]/5 border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Diffusez vos compositions</h3>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">Rejoindre le Creator-Lab Kliv</p>
                </div>
                <button 
                  onClick={() => { triggerHaptic(15); setCurrentScreen('upload'); }}
                  className="w-11 h-11 bg-primary text-background rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <Upload size={20} />
                </button>
              </section>
            </motion.div>
          )}

          {/* 2. SEARCH SCREEN */}
          {currentScreen === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Active Search Box */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Artiste, titre, genre, BPM..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface border border-white/5 text-white font-semibold placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:bg-background transition-colors"
                />
              </div>

              {/* Genre quick filters tag list */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-2 px-2 py-1">
                <button
                  onClick={() => setSelectedGenreFilter(null)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${
                    selectedGenreFilter === null
                      ? 'bg-primary text-background border-primary'
                      : 'bg-surface/40 text-on-surface-variant border-white/5'
                  }`}
                >
                  Tout voir
                </button>
                {Array.from(new Set(tracksList.map(t => t.genre))).map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenreFilter(genre)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${
                      selectedGenreFilter === genre
                        ? 'bg-primary text-background border-primary'
                        : 'bg-surface/40 text-on-surface-variant border-white/5'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {/* Search Results Display */}
              <section className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <h2 className="text-xl font-bold">
                    {searchQuery ? 'Résultats de recherche' : 'Morceaux recommandés'}
                  </h2>
                  <span className="text-[10px] font-mono text-on-surface-variant font-bold">
                    {filteredTracks.length} trouvé{filteredTracks.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredTracks.slice(0, 10).map((track) => (
                    <div 
                      key={track.id} 
                      className="flex items-center gap-3 bg-surface/30 p-2 rounded-xl hover:bg-surface/60 border border-white/5 transition-all group"
                    >
                      <button 
                        onClick={() => handleSelectSongDirect(track)}
                        className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative"
                      >
                        <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={16} className="text-primary" />
                        </div>
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{track.title}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black truncate">{track.artist} • {track.genre}</p>
                      </div>

                      {/* Add to custom playlist options dropdown */}
                      <button 
                        onClick={() => {
                          const playlistOptions = playlists.filter(p => p.id !== 'liked');
                          if (playlistOptions.length === 0) {
                            alert("Veuillez d'abord créer une playlist personnalisée dans Ma Musique !");
                            return;
                          }
                          const name = prompt(
                            `Ajouter à quelle playlist ?\nSaisissez l'un des noms suivants :\n${playlistOptions.map(p => p.name).join('\n')}`
                          );
                          const targetP = playlistOptions.find(p => p.name.toLowerCase() === name?.toLowerCase());
                          if (targetP) {
                            handleAddSongToPlaylist(targetP.id, track);
                          } else if (name) {
                            alert("Playlist introuvable.");
                          }
                        }}
                        className="p-2 text-on-surface-variant hover:text-white transition-colors"
                        title="Ajouter à une playlist"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Decorative category tiles if no query is entered */}
              {!searchQuery && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold">Explorer l'Inconnu</h2>
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { name: 'Kliv Sessions 2026', desc: 'Sons exclusifs', bg: 'from-purple-900 to-indigo-900' },
                      { name: 'Français Pop & Rap', desc: 'Top hits hexagonaux', bg: 'from-[#0d3b1e] to-surface' },
                      { name: 'Deep Focus Work', desc: 'Fréquences relaxantes', bg: 'from-neutral-800 to-stone-900' },
                      { name: 'Ambiance Haptique', desc: 'Basses intenses', bg: 'from-[#12281a] to-emerald-950' },
                    ].map((tile, i) => (
                      <div 
                        key={i} 
                        className={`bg-gradient-to-br ${tile.bg} p-4 rounded-2xl h-24 flex flex-col justify-end border border-white/5 relative group cursor-pointer overflow-hidden`}
                        onClick={() => {
                          // Quick select a genre or mood based on index
                          const moods = ['Ambient Electronic', 'Techno', 'Lofi', 'Jazz'];
                          setSelectedGenreFilter(moods[i % moods.length]);
                        }}
                      >
                        <div className="absolute top-2 right-2 text-primary opacity-20 group-hover:scale-110 group-hover:opacity-60 transition-all">
                          <Compass size={32} />
                        </div>
                        <h3 className="font-bold text-sm text-white">{tile.name}</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">{tile.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {/* 3. LIBRARY SCREEN */}
          {currentScreen === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Library Actions Toolbar */}
              <div className="flex justify-between items-center bg-surface/30 border border-white/5 p-4 rounded-2xl">
                <div>
                  <h2 className="font-bold text-sm">Playlists Personnalisées</h2>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">Organisez votre club musical</p>
                </div>
                <button 
                  onClick={() => { triggerHaptic(15); setShowCreatePlaylistModal(true); }}
                  className="px-4 py-2 bg-primary text-background font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                >
                  <Plus size={14} /> Créer
                </button>
              </div>

              {/* Dynamic list of custom + standard playlists */}
              <div className="space-y-3">
                {playlists.map((pl) => (
                  <div 
                    key={pl.id}
                    className="flex items-center gap-3.5 pl-2 p-2.5 bg-surface/30 rounded-2xl border border-white/5 hover:bg-surface/50 group transition-all"
                  >
                    <button 
                      onClick={() => { setSelectedPlaylist(pl); setCurrentScreen('playlist'); }}
                      className="w-14 h-14 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/5"
                    >
                      <img src={pl.cover} alt={pl.name} className="w-full h-full object-cover" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-white truncate">{pl.name}</h3>
                      <p className="text-xs text-on-surface-variant font-medium line-clamp-1">{pl.description}</p>
                      <p className="text-[9px] uppercase tracking-widest text-[#22c55e] font-black mt-1">
                        {pl.tracks.length} morceaux • {pl.isCustom ? 'Mienne' : 'Curatée par Kliv'}
                      </p>
                    </div>

                    <button 
                      onClick={() => { setSelectedPlaylist(pl); setCurrentScreen('playlist'); }}
                      className="p-2.5 text-on-surface-variant hover:text-white transition-colors"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Liked list status */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex gap-3.5 items-center">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                   <Heart size={20} fill="currentColor" />
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-sm">Titres Favoris</p>
                   <p className="text-xs text-on-surface-variant">Vous avez accumulé {likedSongIds.length} morceaux coups de cœur.</p>
                 </div>
                 <button 
                   onClick={() => {
                     const likedPl = playlists.find(p => p.id === 'liked');
                     if (likedPl) {
                       setSelectedPlaylist(likedPl);
                       setCurrentScreen('playlist');
                     }
                   }}
                   className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-wider"
                 >
                   Voir
                 </button>
              </div>
            </motion.div>
          )}

          {/* 4. PLAYLIST DETAIL SCREEN */}
          {currentScreen === 'playlist' && selectedPlaylist && (
            <motion.div
              key="playlist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PlaylistDetail 
                playlist={selectedPlaylist}
                onBack={() => { triggerHaptic(10); setCurrentScreen('library'); }}
                onPlaySong={handleSelectSongDirect}
                onPlayPlaylist={handlePlayPlaylist}
                currentTrackId={currentTrack.id}
              />
            </motion.div>
          )}

          {/* 5. EQUALIZER SETTINGS */}
          {currentScreen === 'equalizer' && (
            <motion.div
              key="equalizer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <button 
                onClick={() => { triggerHaptic(10); setCurrentScreen('home'); }}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold text-white mb-2"
              >
                ← Retour au Club
              </button>
              <EqualizerPanel />
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl text-xs flex gap-3 items-center">
                <Sparkles className="text-primary animate-pulse shrink-0" size={20} />
                <p className="text-on-surface-variant font-medium leading-relaxed">
                  L'égaliseur matériel interagit activement avec l'oscillateur Web Audio pour sculpter les graves et aiguës à chaud.
                </p>
              </div>
            </motion.div>
          )}

          {/* 6. PROFILE SCREEN */}
          {currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center text-center gap-4 bg-surface/30 p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl relative group">
                  <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-white">{userProfile.name}</h1>
                  <span className="text-[10px] uppercase font-mono bg-primary/15 text-primary border border-primary/20 p-1 px-3 rounded-full font-bold">
                    Membre Kliv Premium
                  </span>
                </div>
              </div>

              {/* Profile stats breakdown */}
              <div className="grid grid-cols-3 gap-3 bg-surface/30 rounded-2xl p-4 border border-white/5 text-center shadow-lg">
                <div>
                  <p className="text-xl font-black text-primary font-mono">{playlists.length}</p>
                  <p className="text-[9px] uppercase font-black text-on-surface-variant tracking-wider">Playlists</p>
                </div>
                <div className="border-x border-white/10">
                  <p className="text-xl font-black text-white font-mono">{userProfile.followers}</p>
                  <p className="text-[9px] uppercase font-black text-on-surface-variant tracking-wider">Abonnés</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white font-mono">{userProfile.following}</p>
                  <p className="text-[9px] uppercase font-black text-on-surface-variant tracking-wider">Suivis</p>
                </div>
              </div>

              <section className="bg-surface/30 border border-white/5 p-4 rounded-2xl space-y-3">
                 <h3 className="font-bold text-sm text-white">Créations Personnelles</h3>
                 <p className="text-xs text-on-surface-variant leading-relaxed">
                   Vous n'avez pas encore téléversé de titres pour cette session. Les morceaux mis en ligne apparaîtront ici.
                 </p>
                 <button 
                   onClick={() => setCurrentScreen('upload')}
                   className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-full font-bold text-xs hover:text-primary transition-all uppercase tracking-widest"
                 >
                   Déposer un son maintenant
                 </button>
              </section>

              <button 
                onClick={() => {
                  triggerHaptic(20);
                  setIsLoggedIn(false);
                  setUserProfile({ ...userProfile, name: "Invité" });
                  setJamAlert("Compte déconnecté. Mode invité.");
                  setTimeout(() => setJamAlert(null), 2000);
                }}
                className="w-full py-3.5 text-red-500 font-black uppercase tracking-widest text-xs border border-red-500/10 rounded-2xl bg-red-500/5 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Se déconnecter de Google
              </button>
            </motion.div>
          )}

          {/* 7. UPLOAD SONG SCREEN */}
          {currentScreen === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <button 
                  onClick={() => setCurrentScreen('home')}
                  className="text-xs font-bold text-on-surface-variant hover:text-white transition-colors"
                >
                  ← Annuler le dépôt
                </button>
                <h1 className="text-2xl font-black tracking-tight mt-1">Dépôt Creator Room</h1>
                <p className="text-xs text-on-surface-variant">Intégrez votre chef-d’œuvre audio au catalogue local.</p>
              </div>

              {/* Big upload file drag/drop mock */}
              <div 
                className="w-full aspect-video border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-3xl flex flex-col items-center justify-center gap-3.5 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer p-4 group"
                onClick={() => {
                  const title = prompt("Titre de la chanson ?") || "Ma composition exclusive";
                  const artist = prompt("Nom de l'artiste ?", userProfile.name) || userProfile.name;
                  const genre = prompt("Genre de la musique ?", "Lofi") || "Lofi";
                  const bpmVal = parseInt(prompt("Indiquez le BPM de la chanson (ex: 90) ?", "90") || "90");

                  triggerHaptic(25);
                  const newTrack: Track = {
                    id: `uploaded_${Date.now()}`,
                    title: title,
                    artist: artist,
                    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCrOaIXvGf14UOLwCm4IShUyA-5E2IAUM8AdPe_CzLgB21kQud9yCaGrNcabA9my8DbkwcYAykB7YJcNFkT3K7M_8uCEvljzVCmsLfzOvkAma9YhFHXUyLlRSJOVlg0vYXLe2emP-mUPU88pKMR6rBZ7Ka43VJUU5gxO9xV3lfSyDrtEBsh_d5aWVrjcHSFh-FTbDBcvET0cKjPL9_YAyXv2erqwvjg0GJdbvF5DvDNs7pZq8JOxETHjtIo7elNZjzqLZ1zbWjQkJy",
                    alt: "Abstract neon art",
                    isUserUploaded: true,
                    duration: 180,
                    genre: genre,
                    bpm: bpmVal,
                    lyrics: [
                      { time: 0, text: "[Section instrumentale de début]", translation: "[Chanson personnalisée sans paroles]" }
                    ]
                  };

                  setTracksList([newTrack, ...tracksList]);
                  setJamAlert("🎉 Track chargée avec succès !");
                  setTimeout(() => setJamAlert(null), 3000);
                  setCurrentScreen('home');
                }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-inner">
                  <Upload size={28} />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="font-bold text-sm text-white">Appuyez pour sélectionner un fichier audio</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">MP3, WAV, AIFF, FLAC • Max 100 Mo</p>
                </div>
              </div>

              <div className="bg-surface/30 p-4 rounded-2xl border border-white/5 space-y-3 text-xs leading-relaxed text-on-surface-variant">
                <p className="font-bold text-white uppercase text-[9px] tracking-widest text-primary">Contrat de Diffusion Créative</p>
                <p>En soumettant votre chanson au Creator-Room, vous certifiez en posséder tous les droits d’édition originaux.</p>
              </div>
            </motion.div>
          )}

          {/* 8. ACTIVE PARTY ROOM SYNC SCREEN */}
          {currentScreen === 'party' && (
            <motion.div
              key="party"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <PartyMode 
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onSelectTrack={(track, customUrl) => {
                  setCurrentTrack(track);
                  setIsPlaying(true);
                  if (customUrl) {
                    audio.playTrack(track, customUrl);
                  } else {
                    audio.playTrack(track);
                  }
                }}
                onPlayPauseToggle={() => {
                  if (isPlaying) {
                    audio.pauseTrack();
                  } else {
                    audio.resumeTrack(currentTrack);
                  }
                  setIsPlaying(!isPlaying);
                }}
                userProfileName={userProfile.name}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- Tab Selector Navigation (Bottom) --- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass h-16 flex justify-around items-center px-4 pb-safe">
        {[
          { id: 'home' as Screen, icon: Home, label: 'Accueil' },
          { id: 'search' as Screen, icon: Search, label: 'Parcourir' },
          { id: 'party' as Screen, icon: Radio, label: 'Fête ⚡' },
          { id: 'library' as Screen, icon: Library, label: 'Musique' },
        ].map(({ id, icon: Icon, label }) => (
          <button 
            key={id}
            onClick={() => { triggerHaptic(10); setSelectedPlaylist(null); setCurrentScreen(id); }}
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${currentScreen === id ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <Icon size={22} fill={currentScreen === id ? 'currentColor' : 'none'} />
            <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
          </button>
        ))}
      </nav>

      {/* --- Bottom Drawer Mini Player bar --- */}
      <AnimatePresence>
        {currentScreen !== 'player' && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-[72px] left-3 right-3 z-40"
          >
            <button 
              onClick={() => { triggerHaptic(15); setCurrentScreen('player'); }}
              className="w-full bg-surface-highest/95 backdrop-blur-xl h-14 rounded-xl flex items-center px-3 shadow-2xl overflow-hidden border border-white/10 active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 mr-3 shadow-inner border border-white/5">
                <img src={currentTrack.cover} alt={currentTrack.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 mr-4 text-left">
                <p className="font-black text-sm text-white truncate">{currentTrack.title}</p>
                <p className="text-[9px] text-on-surface-variant truncate uppercase tracking-widest font-black leading-none mt-0.5">{currentTrack.artist}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerHaptic(15); setIsPlaying(!isPlaying); }}
                  className="p-1 px-2.5 bg-primary/15 text-primary rounded-full hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
              </div>

              {/* Seamless Dynamic Playback progress bar */}
              <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full">
                <motion.div 
                  className="h-full bg-primary" 
                  initial={false}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Immersive Fullscreen PLAYER OVERLAY --- */}
      <AnimatePresence>
        {currentScreen === 'player' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col px-5 py-4 overflow-y-auto"
          >
            {/* Immersive Background matching active artwork accent */}
            <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none opacity-60 blur-3xl" />

            {/* Player Navigation Header */}
            <header className="flex justify-between items-center h-16 shrink-0 relative z-10">
              <button 
                onClick={() => { triggerHaptic(10); setCurrentScreen('home'); }}
                className="p-2.5 active:scale-90 bg-white/5 rounded-full border border-white/5 text-white"
              >
                <ChevronDown size={24} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-[#22c55e]/90">ÉCOUTE EN COURS</span>
                <span className="text-xs font-bold truncate max-w-[140px] mt-0.5">{currentTrack.genre}</span>
              </div>
              {/* Reset current track trigger commentary */}
              <button 
                onClick={() => { triggerHaptic(15); triggerAiDjIntroduction(currentTrack); }}
                className="p-2.5 active:scale-95 bg-white/5 rounded-full border border-white/5 text-[#22c55e]"
                title="Générer commentaire DJ"
              >
                <Sparkles size={18} />
              </button>
            </header>

            {/* AI DJ COMMENTARY STREAMING DISPLAY */}
            {aiDjActive && aiDjCommentary && (
              <div className="mx-2 mt-1 p-3 bg-primary/10 border border-primary/20 rounded-2xl text-xs space-y-1 relative shrink-0">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Kliv Gen-AI DJ Commentary
                </span>
                <p className="text-white italic leading-relaxed text-[11px] font-light">
                  {aiDjCommentary}
                </p>
              </div>
            )}

            {/* Cover Art and Canvas visualizer Container */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 min-h-[160px] relative z-10">
              <motion.div 
                className="w-48 h-48 sm:w-56 sm:h-56 relative shadow-[0_25px_50px_-15px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/5"
              >
                <img 
                  src={currentTrack.cover} 
                  alt={currentTrack.alt} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </motion.div>
            </div>

            {/* Active Canvas Audio Waves Visualizer (Spotify premium feel) */}
            <div className="w-full mb-4 shrink-0 relative z-10">
              <AudioVisualizer isPlaying={isPlaying} />
            </div>

            {/* Primary Track Metadata block */}
            <div className="flex justify-between items-end mb-4 shrink-0 relative z-10">
              <div className="space-y-0.5 min-w-0 flex-1 mr-4">
                <h2 className="text-2xl font-black tracking-tight text-white truncate leading-none mb-1">{currentTrack.title}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-base text-primary font-bold">{currentTrack.artist}</p>
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-on-surface-variant">
                    {currentTrack.bpm} BPM
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleToggleLike(currentTrack.id)}
                className={`p-2.5 active:scale-125 rounded-full bg-white/5 border border-white/5 transition-all ${
                  likedSongIds.includes(currentTrack.id) ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <Heart size={24} fill={likedSongIds.includes(currentTrack.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Seek playback slider bar */}
            <div className="space-y-1 mb-5 shrink-0 relative z-10">
              <div className="relative w-full h-2 bg-surface rounded-full overflow-hidden cursor-pointer">
                {/* Drag-touch slider action */}
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-primary" 
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono font-bold text-on-surface-variant">
                <span>{formatTime(currentTimeSec)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Main playback control actions */}
            <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
              <button 
                onClick={() => { triggerHaptic(10); setIsShuffle(!isShuffle); }}
                className={`p-2 transition-colors ${isShuffle ? 'text-primary' : 'text-on-surface-variant'}`}
                title="Shuffle"
              >
                <Shuffle size={20} />
              </button>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={playPrevSong}
                  className="hover:text-primary active:scale-90 text-white transition-colors"
                >
                  <SkipBack size={32} fill="currentColor" />
                </button>
                
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-white text-background rounded-full flex items-center justify-center active:scale-90 hover:scale-[1.03] transition-transform shadow-xl"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>

                <button 
                  onClick={playNextSong}
                  className="hover:text-primary active:scale-90 text-white transition-colors"
                >
                  <SkipForward size={32} fill="currentColor" />
                </button>
              </div>

              <button 
                onClick={() => { triggerHaptic(10); setIsRepeat(!isRepeat); }}
                className={`p-2 transition-colors ${isRepeat ? 'text-primary' : 'text-on-surface-variant'}`}
                title="Repeat Current"
              >
                <Repeat size={20} />
              </button>
            </div>

            {/* premium soundscapes & EQ Tabs options (Added Value toggle options) */}
            <div className="border-t border-white/5 pt-5 space-y-4 shrink-0 relative z-10">
              <div className="flex gap-2">
                {/* AI DJ commentary switch */}
                <button
                  onClick={() => {
                    triggerHaptic(12);
                    const state = !aiDjActive;
                    setAiDjActive(state);
                    if (state) {
                      triggerAiDjIntroduction(currentTrack);
                    } else {
                      setAiDjCommentary('');
                    }
                  }}
                  className={`flex-1 py-2 text-[9px] uppercase tracking-widest font-black rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    aiDjActive 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-white/5 text-on-surface-variant border-white/5'
                  }`}
                >
                  <Sparkles size={11} />
                  AI Commentateur DJ
                </button>
                
                <button
                  onClick={() => { triggerHaptic(12); setShowTranslateLyrics(!showTranslateLyrics); }}
                  className={`flex-1 py-2 text-[9px] uppercase tracking-widest font-black rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    showTranslateLyrics 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-white/5 text-on-surface-variant border-white/5'
                  }`}
                >
                  <Tv size={11} />
                  Traduction Paroles
                </button>
              </div>

              {/* Dynamic Soundscape Mixing & EQ Drawer panels details */}
              <div className="space-y-4">
                <SoundscapeMixer />
              </div>
            </div>

            {/* SYNCED KARAOKE LYRICS PANEL (Immersive sliding panel) */}
            <div className="mt-6 border-t border-white/5 pt-5 pb-10 space-y-3 shrink-0 relative z-10">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-sm text-white">Paroles Synchronisées</h3>
                <span className="text-[10px] uppercase font-bold text-primary">Kliv Karaoke Sync</span>
              </div>
              <div 
                ref={lyricsContainerRef}
                className="h-44 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10"
              >
                {currentTrack.lyrics.map((line, idx) => {
                  const isActive = currentTimeSec >= line.time && 
                                   (idx === currentTrack.lyrics.length - 1 || currentTimeSec < currentTrack.lyrics[idx + 1].time);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        triggerHaptic(10);
                        setProgress((line.time / currentTrack.duration) * 100);
                        setCurrentTimeSec(line.time);
                      }}
                      className={`w-full text-left transition-all duration-300 py-1 flex flex-col focus:outline-none ${
                        isActive 
                          ? 'lyric-active scale-[1.02] text-primary font-black opacity-100' 
                          : 'opacity-40 text-white font-medium hover:opacity-60'
                      }`}
                    >
                      <span className="text-sm font-semibold leading-relaxed">
                        {showTranslateLyrics ? line.translation : line.text}
                      </span>
                      {isActive && !showTranslateLyrics && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">
                          {line.translation}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Playlist Creation modal backdrop --- */}
      <AnimatePresence>
        {showCreatePlaylistModal && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-white/10 space-y-5 shadow-2xl"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">Nouvelle Playlist</h2>
                <p className="text-xs text-on-surface-variant">Personnalisez votre sélection Kliv.</p>
              </div>

              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <input 
                  type="text" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Nom de la playlist (ex: Sunset beats)" 
                  className="w-full h-11 px-4 rounded-xl bg-black/40 border border-white/5 text-sm text-white focus:outline-none focus:border-primary/50"
                  required
                />
                <textarea 
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Petite description..." 
                  rows={3}
                  className="w-full p-4 rounded-xl bg-black/40 border border-white/5 text-sm text-white resize-none focus:outline-none focus:border-primary/50"
                />
                
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreatePlaylistModal(false)}
                    className="flex-1 py-3 border border-white/10 hover:border-white/20 rounded-full font-black text-xs uppercase tracking-widest"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-background rounded-full font-black text-xs uppercase tracking-widest shadow-lg"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Android PWA Quick Instructions modal alert --- */}
      <AnimatePresence>
        {showAndroidInstallAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowAndroidInstallAlert(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-[#131313] border-t border-white/10 rounded-t-3xl p-6 space-y-6 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary">Comment installer</span>
                <button 
                  onClick={() => setShowAndroidInstallAlert(false)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div className="space-y-1 mt-0.5">
                    <p className="font-bold text-sm text-white">Appuyez sur l'icône d'options</p>
                    <p className="text-xs text-on-surface-variant">Touchez les trois petits points <span className="font-bold text-white">⋮</span> ou l'icône de partage sur Android.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="space-y-1 mt-0.5">
                    <p className="font-bold text-sm text-white">Installez l'application</p>
                    <p className="text-xs text-on-surface-variant">Sélectionnez <span className="font-bold text-white">"Installer l'application"</span> ou <span className="font-bold text-white">"Ajouter à l'écran d'accueil"</span>.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div className="space-y-1 mt-0.5">
                    <p className="font-bold text-sm text-white">Bénéficiez du mode immersif</p>
                    <p className="text-xs text-on-surface-variant">Lancez Kliv directement depuis votre lanceur Android. L'app s'affiche en plein écran plein écran natif, se charge en mode offline, avec des vibrations haptiques fluides !</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-3 items-center">
                <Smartphone className="text-primary shrink-0 animate-bounce" size={24} />
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-relaxed">
                  Remarque : Cette application est optimisée sous forme de Progressive Web App (PWA) certifiée Android, allégée et hyper-fluide.
                </p>
              </div>

              <button 
                onClick={() => setShowAndroidInstallAlert(false)}
                className="w-full py-4 bg-primary text-background font-black text-xs uppercase tracking-widest rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Compris !
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
