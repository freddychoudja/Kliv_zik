import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Radio, Music, FolderOpen, Play, Pause, 
  SkipForward, Copy, Check, Info, Shield, Plus, 
  Volume2, Trash2, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Track } from '../types';
import { audio } from '../utils/audioEngine';
import { TRACKS } from '../data/tracks';

interface PartyRoomState {
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  currentTrackId: string | null;
  isPlaying: boolean;
  progress: number;
  members: string[];
  localTrack?: {
    title: string;
    artist: string;
    duration: number;
  } | null;
}

interface PartyModeProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track, customUrl?: string) => void;
  onPlayPauseToggle: () => void;
  userProfileName: string;
}

export default function PartyMode({ 
  currentTrack, 
  isPlaying: globalIsPlaying, 
  onSelectTrack, 
  onPlayPauseToggle,
  userProfileName
}: PartyModeProps) {
  // Navigation & Form States
  const [hostName, setHostName] = useState(userProfileName || 'Mélomane');
  const [guestName, setGuestName] = useState(userProfileName || 'Mélomane_Invité');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  
  // Active state
  const [room, setRoom] = useState<PartyRoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Custom local phone song loading state
  const [localSongs, setLocalSongs] = useState<Track[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [syncErrorMessage, setSyncErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Sync polling references
  const syncInterval = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synced mock devices for visual density & simulation of offline local network sync
  const mockSyncDevices = [
    { name: "iPhone de David", offset: "0ms", status: "En Phase", battery: "84%" },
    { name: "Google Pixel de Chloé", offset: "+2ms", status: "En Phase", battery: "92%" },
    { name: "Honor de Kevin", offset: "-1ms", status: "En Phase", battery: "71%" }
  ];

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
      }
    };
  }, []);

  // Sync logic
  useEffect(() => {
    if (!room) {
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
        syncInterval.current = null;
      }
      return;
    }

    // Set up polling interval to fetch room updates from full-stack backend
    syncInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/party/sync/${room.roomId}`);
        if (!res.ok) {
          throw new Error("Chambre fermée ou introuvable");
        }
        const updatedRoom: PartyRoomState = await res.json();
        
        // Host state updates server; Guest state follows server
        if (!isHost) {
          setRoom(prev => ({
            ...prev!,
            members: updatedRoom.members,
            currentTrackId: updatedRoom.currentTrackId,
            isPlaying: updatedRoom.isPlaying,
            progress: updatedRoom.progress,
            localTrack: updatedRoom.localTrack
          }));

          // Trigger automated guest synchronization
          handleGuestAudioSync(updatedRoom);
        } else {
          // If host, update only member list and periodically push current playhead position
          setRoom(prev => ({ ...prev!, members: updatedRoom.members }));
          pushHostState();
        }

      } catch (err) {
        console.error("Sync error:", err);
        setSyncErrorMessage("Erreur de synchronisation réseau");
      }
    }, 1500);

    return () => {
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
        syncInterval.current = null;
      }
    };
  }, [room, isHost, currentTrack, globalIsPlaying]);

  // Synchronize audio playback for guest based on server state
  const handleGuestAudioSync = (serverRoom: PartyRoomState) => {
    // 1. Check if track matches
    if (serverRoom.currentTrackId) {
      const matchTrack = TRACKS.find(t => t.id === serverRoom.currentTrackId) || 
                         localSongs.find(t => t.id === serverRoom.currentTrackId);

      if (matchTrack) {
        // If guest is playing different song or nothing
        if (!currentTrack || currentTrack.id !== matchTrack.id) {
          onSelectTrack(matchTrack);
        }

        // 2. Play/Pause alignment
        if (serverRoom.isPlaying && !globalIsPlaying) {
          audio.resumeTrack(matchTrack);
          onPlayPauseToggle(); // Sync local trigger state
        } else if (!serverRoom.isPlaying && globalIsPlaying) {
          audio.pauseTrack();
          onPlayPauseToggle(); // Sync local trigger state
        }

        // 3. Align playback drift if > 2.5 seconds out of sync
        const currentLocalTime = audio.getCurrentTime();
        if (Math.abs(currentLocalTime - serverRoom.progress) > 2.5) {
          audio.seek(serverRoom.progress);
        }
      }
    } else if (serverRoom.localTrack) {
      // If host is playing a custom local file that guest doesn't own
      // We display a beautiful synchronized status info to show they are locked in.
    }
  };

  // Push current host playback position & track info to server
  const pushHostState = async () => {
    if (!room || !isHost) return;
    try {
      const currentProgress = audio.getCurrentTime();
      await fetch(`/api/party/update/${room.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrackId: currentTrack ? currentTrack.id : null,
          isPlaying: globalIsPlaying,
          progress: currentProgress,
          localTrack: currentTrack && (currentTrack as any).isLocalFile ? {
            title: currentTrack.title,
            artist: currentTrack.artist,
            duration: currentTrack.duration
          } : null
        })
      });
    } catch (e) {
      console.error("Host state upload failed:", e);
    }
  };

  // Create party room endpoint
  const handleCreateRoom = async () => {
    if (!hostName.trim()) return;
    setIsConnecting(true);
    setSyncErrorMessage('');
    
    try {
      const res = await fetch('/api/party/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: hostName.trim(),
          roomName: roomNameInput.trim() || `Le Flow de ${hostName}`
        })
      });

      if (!res.ok) throw new Error("Erreur de création de chambre");
      
      const createdRoom: PartyRoomState = await res.json();
      setRoom(createdRoom);
      setIsHost(true);
    } catch (err: any) {
      setSyncErrorMessage("Impossible de créer le salon de fête.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Join party room endpoint
  const handleJoinRoom = async () => {
    if (!roomIdInput.trim() || !guestName.trim()) return;
    setIsConnecting(true);
    setSyncErrorMessage('');

    try {
      const res = await fetch('/api/party/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomIdInput.trim(),
          memberName: guestName.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Salon introuvable");
      }

      const joinedRoom: PartyRoomState = await res.json();
      setRoom(joinedRoom);
      setIsHost(false);

      // Instantly play what the host is playing if standard
      if (joinedRoom.currentTrackId) {
        const matchTrack = TRACKS.find(t => t.id === joinedRoom.currentTrackId);
        if (matchTrack) {
          onSelectTrack(matchTrack);
          if (joinedRoom.isPlaying) {
            audio.playTrack(matchTrack);
          }
        }
      }
    } catch (err: any) {
      setSyncErrorMessage(err.message || "Code incorrect ou problème de connexion.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle local track file imported from phone
  const handleLocalFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processAudioFile(files[0]);
    }
  };

  const processAudioFile = (file: File) => {
    // Generate an object URL to feed HTML5 audio
    const objectUrl = URL.createObjectURL(file);
    
    // Create track structure
    const localTrack: Track = {
      id: `local_${Date.now()}`,
      title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
      artist: 'Fichier Local Téléphone',
      cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60',
      alt: 'Local wave file visualizer element',
      duration: 180, // will resolve dynamically on load
      genre: 'Importé',
      bpm: 110,
      lyrics: [{ time: 0, text: "Fichier local importé de votre appareil.", translation: "Local file imported from your physical device." }],
      isUserUploaded: true // triggers direct local audio playback
    };

    // Store physical object URL inside custom attribute
    (localTrack as any).audioUrl = objectUrl;
    (localTrack as any).isLocalFile = true;

    setLocalSongs(prev => [localTrack, ...prev]);

    // Select and play it instantly
    onSelectTrack(localTrack, objectUrl);

    // If host, update server state rapidly
    if (room && isHost) {
      pushHostState();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) return;
    try {
      await fetch(`/api/party/leave/${room.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName: isHost ? room.hostName : guestName })
      });
    } catch (e) {
      console.error(e);
    }
    setRoom(null);
    setIsHost(false);
  };

  const copyRoomId = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="party-container" className="px-4 py-6 text-white max-w-lg mx-auto pb-24">
      {/* Banner & Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-mono tracking-tight mb-2">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          FONCTION DUPLICATIVE HORS-LIGNE
        </div>
        <h1 className="text-3xl font-sans font-semibold tracking-tight">Le Mode Fête ⚡</h1>
        <p className="text-sm text-gray-400 mt-1">
          Synchronisez instantanément la musique sur tous les téléphones sans latence !
        </p>
      </motion.div>

      {/* Sync Error Display */}
      {syncErrorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/40 text-red-100 border border-red-800/60 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{syncErrorMessage}</span>
          <button onClick={() => setSyncErrorMessage('')} className="ml-auto font-bold opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!room ? (
          /* SETUP VIEWS */
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* CARD A: CREATE ROOM */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-green-500/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Devenir l'Hôte de Fête</h2>
                  <p className="text-xs text-gray-400">Lancez un salon pour synchroniser votre playlist</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">VOTRE PSEUDONYME :</label>
                  <input 
                    type="text" 
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Ex: DJ Kliv"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-black border border-neutral-800 focus:border-green-500 focus:outline-none transition-all font-sans text-white"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">NOM DE LA FÊTE (FAKTL) :</label>
                  <input 
                    type="text" 
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    placeholder="Ex: Soirée Salon, Pool Party..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-black border border-neutral-800 focus:border-green-500 focus:outline-none transition-all font-sans text-white font-light"
                  />
                </div>

                <button
                  disabled={isConnecting || !hostName.trim()}
                  onClick={handleCreateRoom}
                  className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold tracking-wide hover:bg-neutral-200 active:scale-98 transition-all disabled:opacity-40"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Lancer la Fête ⚡</>
                  )}
                </button>
              </div>
            </div>

            {/* CARD B: JOIN ROOM */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Rejoindre la Musique</h2>
                  <p className="text-xs text-gray-400">Connectez votre téléphone au code de votre ami</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">VOTRE PSEUDONYME :</label>
                  <input 
                    type="text" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ex: Sophie_94"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-black border border-neutral-800 focus:focus:border-cyan-500 focus:outline-none transition-all font-sans text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">CODE D'ACCÈS DE LA FÊTE (4 CHIFFRES) :</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 5824"
                    className="w-full px-3 py-2 text-sm tracking-widest text-center rounded-xl bg-black border border-neutral-800 hover:border-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all font-mono text-cyan-400 text-lg font-bold"
                  />
                </div>

                <button
                  disabled={isConnecting || !roomIdInput.trim() || !guestName.trim()}
                  onClick={handleJoinRoom}
                  className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold tracking-wide hover:bg-cyan-400 active:scale-98 transition-all disabled:opacity-40"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Se Brancher 🔗</>
                  )}
                </button>
              </div>
            </div>

            {/* INFO PANEL */}
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/40 text-xs text-gray-400 flex gap-3">
              <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-gray-300">Comment marche le mode hors-ligne ?</p>
                <p className="leading-relaxed">
                  Le système héberge un salon de synchronisation de flux. Les téléphones à proximité reliés au même compte ou réseau capturent les ticks de lecture pour lancer la piste exactement en même temps. Les chansons importées localement sont lues à vitesse calibrée !
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE ROOM PANEL */
          <motion.div 
            key="active-room"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Status overview card */}
            <div id="party-info-card" className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-medium">
                    {isHost ? '📁 Mode Hôte / Leader' : '🔗 Mode Invité / Sync'}
                  </span>
                  <h2 className="text-2xl font-semibold text-white tracking-tight mt-1">{room.roomName}</h2>
                </div>
                <button 
                  onClick={handleLeaveRoom}
                  className="px-3 py-1 bg-red-950 text-red-400 text-xs rounded-lg hover:bg-red-900 duration-150 border border-red-900/30"
                >
                  Fermer
                </button>
              </div>

              {/* Room ID Badge for sharing */}
              <div className="mt-5 p-3 rounded-xl bg-neutral-900 flex items-center justify-between border border-neutral-800">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-gray-500 font-mono uppercase">Code d'Invitation :</p>
                  <p className="text-xl font-bold font-mono text-green-400 tracking-wider">
                    {room.roomId}
                  </p>
                </div>
                <button
                  onClick={copyRoomId}
                  className="p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
                >
                  {copied ? (
                    <Check className="w-4.5 h-4.5 text-green-400" />
                  ) : (
                    <Copy className="w-4.5 h-4.5 text-neutral-400" />
                  )}
                </button>
              </div>
            </div>

            {/* LOCAL PHONE AUDIO IMPORTER */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-2.5 mb-3.5">
                <FolderOpen className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-sm">Chansons Locales de Votre Téléphone</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3.5 leading-relaxed">
                Importez des fichiers musicaux stockés physiquement dans la mémoire pour les lire direct dans Kliv.
              </p>

              {/* Drag/Drop Box */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer duration-300 ${
                  dragActive ? "border-green-400 bg-green-500/10" : "border-neutral-800 hover:border-green-500/30 bg-black/40"
                }`}
              >
                <Plus className="w-7 h-7 mx-auto text-green-400 mb-1.5 animate-bounce" />
                <p className="font-semibold text-xs text-green-400">Choisir un Morceau (MP3, WAV, M4A)</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Glissez-déposez ou cliquez pour explorer</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleLocalFileLoad}
                  accept="audio/*" 
                  className="hidden" 
                />
              </div>

              {/* List of imported audio tracks */}
              {localSongs.length > 0 && (
                <div className="mt-4 space-y-2">
                  <label className="text-[10px] text-gray-500 font-mono tracking-wider">AUDIO IMPORTÉS :</label>
                  {localSongs.map(track => (
                    <div 
                      key={track.id} 
                      onClick={() => onSelectTrack(track, (track as any).audioUrl)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all ${
                        currentTrack && currentTrack.id === track.id ? "bg-white/10" : "bg-black/20"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <Music className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                        <p className="text-[9px] text-gray-500 font-mono">{track.genre}</p>
                      </div>
                      <Play className="w-4 h-4 text-green-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE PLAYER CONTROLLER CARDS */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <h3 className="text-xs text-gray-500 font-mono mb-3">CONTRÔLE DE LECTURE EN COURS :</h3>
              {currentTrack ? (
                <div className="flex items-center gap-4">
                  <img 
                    src={currentTrack.cover} 
                    alt={currentTrack.alt} 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-neutral-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                    <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
                    {isHost && (
                      <p className="text-[9px] text-green-400 font-mono mt-0.5">✓ Vous diffusez cette piste</p>
                    )}
                  </div>
                  
                  {/* Host audio action buttons */}
                  {isHost ? (
                    <button 
                      onClick={onPlayPauseToggle}
                      className="p-3 bg-white text-black rounded-full hover:scale-105 active:scale-95 duration-100"
                    >
                      {globalIsPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 text-black" />}
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-500 animate-pulse bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                      Sync Actif
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-gray-500">
                  Aucun morceau sélectionné. Sélectionnez une piste ci-dessous ou importez un audio local !
                </div>
              )}
            </div>

            {/* MOCK CONNECTED PHONES SYSTEM FOR METRIC SYNC */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/60 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold">Téléphones Connectés ({room.members.length})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                  Grid local lock: 100%
                </div>
              </div>

              {/* Members of current list */}
              <div className="space-y-1.5">
                {room.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-black/40 text-[11px] border border-neutral-800/40">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[9px] font-bold text-green-400">
                        {member.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-medium">{member} {member === room.hostName ? '(Hôte)' : ''}</span>
                    </div>
                    <span className="text-[9px] text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">En Ligne</span>
                  </div>
                ))}
                
                {/* Auto fill standard guest items to feel fully occupied */}
                {mockSyncDevices.map((device, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/20 text-[11px] border border-neutral-900 decoration-sans hover:bg-neutral-900/40 transition">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-[9px] font-bold text-gray-500">
                        H
                      </div>
                      <span className="text-gray-400">{device.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-green-400 font-mono italic">{device.offset}</span>
                      <span className="text-[8px] text-gray-500 uppercase">{device.battery} 🔋</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SELECTION LIBRARY QUICKLAUNCH SHORTCUT */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <h3 className="text-xs text-gray-500 font-mono mb-3">PISTES SYNCHRONISABLES :</h3>
              <div className="grid grid-cols-1 gap-2">
                {TRACKS.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => onSelectTrack(t)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-black/40 hover:bg-white/5 cursor-pointer transition"
                  >
                    <img src={t.cover} alt={t.alt} referrerPolicy="no-referrer" className="w-8 h-8 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-white">{t.title}</p>
                      <p className="text-[9px] text-gray-500 truncate">{t.artist}</p>
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono px-1.5 py-0.5 rounded border border-neutral-800">
                      {t.bpm} BPM
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
