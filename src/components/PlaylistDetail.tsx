import { Play, Shuffle, ChevronLeft, Music, Clock } from 'lucide-react';
import { Playlist, Track } from '../types';

interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
  onPlaySong: (track: Track) => void;
  onPlayPlaylist: (tracks: Track[], shuffle: boolean) => void;
  currentTrackId?: string;
}

export default function PlaylistDetail({
  playlist,
  onBack,
  onPlaySong,
  onPlayPlaylist,
  currentTrackId,
}: PlaylistDetailProps) {
  
  // Convert seconds to format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors py-1 text-sm font-bold"
      >
        <ChevronLeft size={20} /> Retour
      </button>

      {/* Playlist Hero Metadata banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
        <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-surface-high shrink-0 relative group">
          <img 
            src={playlist.cover} 
            alt={playlist.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Music size={32} className="text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#22c55e]">Playlist Publique</span>
          <h1 className="text-3xl font-black text-white tracking-tight">{playlist.name}</h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">{playlist.description}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            <span>Kliv Streaming</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{playlist.tracks.length} morceaux</span>
          </div>
        </div>
      </div>

      {/* Primary Actions bar */}
      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => onPlayPlaylist(playlist.tracks, false)}
          className="flex-1 py-3.5 bg-primary text-background font-black text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Play fill="black" size={16} /> Écouter Tout
        </button>
        <button 
          onClick={() => onPlayPlaylist(playlist.tracks, true)}
          className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-full border border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Shuffle size={16} /> Aléatoire
        </button>
      </div>

      {/* Tracks List */}
      <div className="space-y-1.5">
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-3 pb-2 border-b border-white/5">
          <span className="w-8 text-center text-[11px]">#</span>
          <span className="flex-1">Titre</span>
          <span className="w-12 text-right"><Clock size={12} className="inline mr-1" /></span>
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="py-12 text-center text-sm text-on-surface-variant">
            Aucun morceau dans cette playlist.
          </div>
        ) : (
          playlist.tracks.map((track, i) => {
            const isActive = currentTrackId === track.id;
            return (
              <button
                key={track.id}
                onClick={() => onPlaySong(track)}
                className={`w-full flex items-center text-left p-2.5 rounded-xl transition-all group active:scale-[0.99] ${
                  isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface/30 hover:bg-surface-high border border-transparent'
                }`}
              >
                <div className="w-8 text-center text-xs font-mono font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                  {i + 1}
                </div>
                <img 
                  src={track.cover} 
                  alt={track.title} 
                  className="w-10 h-10 rounded-lg object-cover mr-3.5 border border-white/5" 
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${isActive ? 'text-primary' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-wider font-semibold">
                    {track.artist}
                  </p>
                </div>
                <div className="w-12 text-right font-mono text-xs text-on-surface-variant pr-1">
                  {formatTime(track.duration)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
