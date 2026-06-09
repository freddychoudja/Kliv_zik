import { useState } from 'react';
import { CloudRain, Compass, Waves, Flame, RefreshCw } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { Soundscape, SoundscapeType } from '../types';

const INITIAL_SOUNDSCAPES: Soundscape[] = [
  { id: 'rain', name: 'Pluie d\'orage', icon: 'CloudRain', volume: 0 },
  { id: 'space', name: 'Onde Éthérée', icon: 'Compass', volume: 0 },
  { id: 'waves', name: 'Océan Atlantique', icon: 'Waves', volume: 0 },
  { id: 'campbuilt', name: 'Feu de camp', icon: 'Flame', volume: 0 },
];

export default function SoundscapeMixer() {
  const [mixers, setMixers] = useState<Soundscape[]>(INITIAL_SOUNDSCAPES);

  const handleVolumeChange = (id: SoundscapeType, val: number) => {
    const updated = mixers.map(item => {
      if (item.id === id) {
        audio.setSoundscapeVolume(id, val);
        return { ...item, volume: val };
      }
      return item;
    });
    setMixers(updated);
  };

  const handleReset = () => {
    mixers.forEach(item => {
      audio.setSoundscapeVolume(item.id, 0);
    });
    setMixers(INITIAL_SOUNDSCAPES);
  };

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'CloudRain': return <CloudRain size={20} />;
      case 'Compass': return <Compass size={20} />;
      case 'Waves': return <Waves size={20} />;
      case 'Flame': return <Flame size={20} />;
      default: return null;
    }
  };

  return (
    <div className="bg-surface/90 border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             Ambiance Mixeur
          </h3>
          <p className="text-[10px] uppercase font-black tracking-widest text-[#22c55e]/75">Superposez des bruits naturels</p>
        </div>
        <button 
          onClick={handleReset}
          className="p-1 px-3.5 bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white rounded-full text-[9px] uppercase font-black tracking-wide flex items-center gap-1 transition-all"
        >
          <RefreshCw size={10} /> Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {mixers.map((item) => (
          <div key={item.id} className="bg-black/25 rounded-2xl p-3 border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg transition-colors ${item.volume > 0 ? 'bg-primary text-background font-bold' : 'bg-white/5 text-on-surface-variant'}`}>
                {renderIcon(item.icon)}
              </div>
              <span className="text-[11px] font-bold text-white truncate">{item.name}</span>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <input 
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={item.volume}
                onChange={(e) => handleVolumeChange(item.id, parseFloat(e.target.value))}
                className="w-full accent-primary h-1 bg-surface-highest rounded-lg cursor-pointer"
              />
              <span className="text-[9px] font-mono text-on-surface-variant w-4 text-right">
                {Math.round(item.volume * 125)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
