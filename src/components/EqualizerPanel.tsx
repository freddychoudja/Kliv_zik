import { useState } from 'react';
import { Sliders } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { EqualizerPreset } from '../types';

const EQ_PRESETS: EqualizerPreset[] = [
  { name: 'Plat', bass: 0, mid: 0, treble: 0 },
  { name: 'Bass Booster', bass: 8, mid: 2, treble: -2 },
  { name: 'Techno Club', bass: 7, mid: -1, treble: 5 },
  { name: 'Acoustique', bass: 2, mid: 3, treble: 4 },
  { name: 'Vocal Pop', bass: -2, mid: 5, treble: 3 },
];

export default function EqualizerPanel() {
  const [selectedPreset, setSelectedPreset] = useState<string>('Plat');
  const [bass, setBass] = useState(0); // -10 to +10
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);

  const applyEQ = (b: number, m: number, t: number) => {
    setBass(b);
    setMid(m);
    setTreble(t);
    audio.setEQ(b, m, t);
  };

  const handleSelectPreset = (preset: EqualizerPreset) => {
    setSelectedPreset(preset.name);
    applyEQ(preset.bass, preset.mid, preset.treble);
  };

  const handleSliderChange = (type: 'bass' | 'mid' | 'treble', val: number) => {
    setSelectedPreset('Personnalisé');
    if (type === 'bass') {
      applyEQ(val, mid, treble);
    } else if (type === 'mid') {
      applyEQ(bass, val, treble);
    } else if (type === 'treble') {
      applyEQ(bass, mid, val);
    }
  };

  return (
    <div className="bg-surface/90 border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
      <div>
        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
          <Sliders size={16} className="text-primary" />
          Égalisateur Audio Club
        </h3>
        <p className="text-[10px] uppercase font-black tracking-widest text-[#22c55e]/75">Modelez votre signature sonore</p>
      </div>

      {/* Preset Pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-2 px-2 py-1">
        {EQ_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleSelectPreset(preset)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors border ${
              selectedPreset === preset.name
                ? 'bg-primary text-background border-primary'
                : 'bg-black/25 text-on-surface-variant border-white/5 hover:border-white/15'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Faders sliders */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        {/* Bass Slider */}
        <div className="flex flex-col items-center gap-2 bg-black/15 p-3 rounded-2xl border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Basses</span>
          <div className="h-28 flex items-center justify-center">
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={bass}
              orient="vertical" /* Legacy compatibility */
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              onChange={(e) => handleSliderChange('bass', parseInt(e.target.value))}
              className="accent-primary cursor-ns-resize h-24"
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">{bass > 0 ? `+${bass}` : bass}dB</span>
        </div>

        {/* Mid Slider */}
        <div className="flex flex-col items-center gap-2 bg-black/15 p-3 rounded-2xl border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Médiums</span>
          <div className="h-28 flex items-center justify-center">
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={mid}
              onChange={(e) => handleSliderChange('mid', parseInt(e.target.value))}
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              className="accent-primary cursor-ns-resize h-24"
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">{mid > 0 ? `+${mid}` : mid}dB</span>
        </div>

        {/* Treble Slider */}
        <div className="flex flex-col items-center gap-2 bg-black/15 p-3 rounded-2xl border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Aigus</span>
          <div className="h-28 flex items-center justify-center">
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={treble}
              onChange={(e) => handleSliderChange('treble', parseInt(e.target.value))}
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              className="accent-primary cursor-ns-resize h-24"
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">{treble > 0 ? `+${treble}` : treble}dB</span>
        </div>
      </div>
    </div>
  );
}
