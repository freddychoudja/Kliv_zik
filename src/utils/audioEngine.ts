import { Track, SoundscapeType } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  
  // Track playback state & synth triggers
  private isSynthesizing = false;
  private bpm = 100;
  private timerId: any = null;
  private currentBeat = 0;
  private activeGenre = 'ambient';

  // Soundscapes nodes
  private soundscapes: { [key in SoundscapeType]?: { gain: GainNode; sourceNode?: AudioNode } } = {};

  // Analytical visualizer source
  public analyser: AnalyserNode | null = null;
  private lowEqualizer: BiquadFilterNode | null = null;
  private midEqualizer: BiquadFilterNode | null = null;
  private highEqualizer: BiquadFilterNode | null = null;

  // Physical local files playback support
  private localAudio: HTMLAudioElement | null = null;
  private localSource: MediaElementAudioSourceNode | null = null;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.value = 0.5; // Master Volume default

      // Equalizer Filter Nodes
      this.lowEqualizer = this.ctx.createBiquadFilter();
      this.lowEqualizer.type = 'lowshelf';
      this.lowEqualizer.frequency.value = 250; // Bass
      this.lowEqualizer.gain.value = 0;

      this.midEqualizer = this.ctx.createBiquadFilter();
      this.midEqualizer.type = 'peaking';
      this.midEqualizer.frequency.value = 1000; // Middle
      this.midEqualizer.Q.value = 1;
      this.midEqualizer.gain.value = 0;

      this.highEqualizer = this.ctx.createBiquadFilter();
      this.highEqualizer.type = 'highshelf';
      this.highEqualizer.frequency.value = 4000; // Treble
      this.highEqualizer.gain.value = 0;

      // Connections chain
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;

      // Set up physical audio nodes
      this.localAudio = new Audio();
      this.localAudio.crossOrigin = 'anonymous';
      this.localSource = this.ctx.createMediaElementSource(this.localAudio);

      // Route through the effects chain! Connect localSource to analyser!
      this.localSource.connect(this.analyser);

      // Chain connections
      this.analyser.connect(this.lowEqualizer);
      this.lowEqualizer.connect(this.midEqualizer);
      this.midEqualizer.connect(this.highEqualizer);
      this.highEqualizer.connect(this.primaryGain);
      this.primaryGain.connect(this.ctx.destination);

      // Create ambient soundscapes
      this.setupSoundscapes();
    } catch (e) {
      console.error('AudioEngine initialization failed:', e);
    }
  }

  // Set individual EQ parameters
  public setEQ(bass: number, mid: number, treble: number) {
    this.init();
    if (this.lowEqualizer) this.lowEqualizer.gain.value = bass;
    if (this.midEqualizer) this.midEqualizer.gain.value = mid;
    if (this.highEqualizer) this.highEqualizer.gain.value = treble;
  }

  private setupSoundscapes() {
    if (!this.ctx || !this.primaryGain) return;

    const types: SoundscapeType[] = ['rain', 'space', 'waves', 'campbuilt'];
    
    types.forEach(type => {
      const gainNode = this.ctx!.createGain();
      gainNode.gain.value = 0; // Starts silent
      gainNode.connect(this.primaryGain!);
      
      this.soundscapes[type] = { gain: gainNode };
      
      if (type === 'rain') {
        // Synthesizing rain static sound
        const bufferSize = 2 * this.ctx!.sampleRate;
        const noiseBuffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.ctx!.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const rainFilter = this.ctx!.createBiquadFilter();
        rainFilter.type = 'bandpass';
        rainFilter.frequency.value = 800;
        rainFilter.Q.value = 0.6;

        whiteNoise.connect(rainFilter);
        rainFilter.connect(gainNode);
        whiteNoise.start();
        this.soundscapes[type]!.sourceNode = whiteNoise;
      } 
      
      else if (type === 'space') {
        // Space cosmic drone
        const osc = this.ctx!.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 60; // deep hum

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100;

        osc.connect(filter);
        filter.connect(gainNode);
        osc.start();
        this.soundscapes[type]!.sourceNode = osc;
      } 
      
      else if (type === 'waves') {
        // Oscillating oceanwaves using rolling white noise LFO modulated
        const bufferSize = 4 * this.ctx!.sampleRate;
        const noiseBuffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx!.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const lowpass = this.ctx!.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 350;

        // Custom sweeping speed using LFO
        const lfo = this.ctx!.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15; // 8 seconds cycle

        const lfoGain = this.ctx!.createGain();
        lfoGain.gain.value = 250;

        lfo.connect(lfoGain);
        lfoGain.connect(lowpass.frequency); // sweeps frequency filter to sound like crashing waves

        noise.connect(lowpass);
        lowpass.connect(gainNode);

        lfo.start();
        noise.start();
        this.soundscapes[type]!.sourceNode = noise;
      }
      
      else if (type === 'campbuilt') {
        // Campfire crackle
        const bufferSize = 1 * this.ctx!.sampleRate;
        const noiseBuffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const baseNoise = this.ctx!.createBufferSource();
        baseNoise.buffer = noiseBuffer;
        baseNoise.loop = true;

        const hp = this.ctx!.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 3000;

        // Make crackly sounds using a low frequency oscillator pulses
        const modOsc = this.ctx!.createOscillator();
        modOsc.type = 'sawtooth';
        modOsc.frequency.value = 7; 

        const modGain = this.ctx!.createGain();
        modGain.gain.value = 0.8;

        modOsc.connect(modGain);
        
        const mainGain = this.ctx!.createGain();
        mainGain.gain.value = 0.5;

        baseNoise.connect(hp);
        hp.connect(mainGain);
        mainGain.connect(gainNode);

        modOsc.start();
        baseNoise.start();
        this.soundscapes[type]!.sourceNode = baseNoise;
      }
    });
  }

  // Adjust specific soundscape volume
  public setSoundscapeVolume(type: SoundscapeType, level: number) {
    this.init();
    const node = this.soundscapes[type];
    if (node) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      node.gain.gain.linearRampToValueAtTime(level, this.ctx!.currentTime + 0.3);
    }
  }

  // Master Volume Controls
  public setVolume(val: number) {
    this.init();
    if (this.primaryGain && this.ctx) {
      this.primaryGain.gain.linearRampToValueAtTime(val, this.ctx.currentTime + 0.05);
    }
  }

  // Start music track synthesizer or physical audio file
  public playTrack(track: Track, customAudioUrl?: string) {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Stop any existing synthesizer loops
    this.stopSynthesis();

    // Pause any physical players
    if (this.localAudio) {
      this.localAudio.pause();
    }

    const audioUrl = customAudioUrl || (track as any).audioUrl;

    if ((track.isUserUploaded || (track as any).isLocalFile) && audioUrl) {
      // Direct file/URL playback via HTML5 standard tag routed into analysis node
      if (this.localAudio) {
        this.localAudio.src = audioUrl;
        this.localAudio.play().catch(err => {
          console.error("Physical audio file playback failed:", err);
        });
      }
    } else {
      // Procedure tracker synth algorithm
      this.bpm = track.bpm || 90;
      this.activeGenre = track.genre.toLowerCase();
      
      this.isSynthesizing = true;
      this.currentBeat = 0;
      
      // Beat scheduler
      const intervalMs = (60 / this.bpm) * 1000 / 2; // eighth notes
      this.timerId = setInterval(() => this.schedulerStep(), intervalMs);
    }
  }

  // Set physical audio playback seek position
  public seek(seconds: number) {
    if (this.localAudio && !isNaN(seconds)) {
      this.localAudio.currentTime = seconds;
    }
  }

  // Get current playhead position (in seconds)
  public getCurrentTime(): number {
    if (this.localAudio && this.localAudio.src && !this.isSynthesizing) {
      return this.localAudio.currentTime || 0;
    }
    // For synthesized tracks, we simulate playhead position based on beat count
    if (this.isSynthesizing) {
      const beatsPerSec = (this.bpm / 60) * 2; // 8th notes frequency
      return beatsPerSec > 0 ? this.currentBeat / beatsPerSec : 0;
    }
    return 0;
  }

  // Standard duration provider
  public getDuration(track: Track): number {
    if (track.isUserUploaded && this.localAudio && this.localAudio.duration) {
      return this.localAudio.duration;
    }
    return track.duration || 180;
  }

  // Precise party pausing
  public pauseTrack() {
    if (this.localAudio) {
      this.localAudio.pause();
    }
    this.stopSynthesis();
  }

  // Resume playback
  public resumeTrack(track: Track, customAudioUrl?: string) {
    const audioUrl = customAudioUrl || (track as any).audioUrl;
    if ((track.isUserUploaded || (track as any).isLocalFile) && audioUrl && this.localAudio) {
      this.localAudio.play().catch(err => console.error("Resume failed:", err));
    } else {
      this.playTrack(track);
    }
  }

  public stopTrack() {
    this.stopSynthesis();
    if (this.localAudio) {
      this.localAudio.pause();
      this.localAudio.currentTime = 0;
    }
  }

  private stopSynthesis() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isSynthesizing = false;
  }

  private schedulerStep() {
    if (!this.ctx || !this.analyser) return;

    // Music generation algorithms per genre
    const step = this.currentBeat % 16;
    
    if (this.activeGenre.includes('techno')) {
      this.playTechnorhythm(step);
    } else if (this.activeGenre.includes('ambient') || this.activeGenre.includes('chill')) {
      this.playAmbientRhythm(step);
    } else if (this.activeGenre.includes('jazz')) {
      this.playJazzRhythm(step);
    } else if (this.activeGenre.includes('lofi')) {
      this.playLofiRhythm(step);
    } else {
      this.playGenericRhythm(step);
    }

    this.currentBeat++;
  }

  // --- Music Synthesizer Algorithms ---

  private playAmbientRhythm(step: number) {
    const scale = [220, 246.94, 277.18, 329.63, 369.99, 440, 554.37]; // A Minor Pentatonic / C# Minor
    
    // Play subtle soft pad note every 4 beats
    if (step === 0 || step === 8) {
      const randomFreq = scale[Math.floor(Math.random() * scale.length)];
      this.triggerSoftOsc(randomFreq, 0.25, 1.8, 'triangle');
    }
    
    // High soft bell note occasionally on offbeats
    if (step === 4 || step === 12 || (step === 14 && Math.random() > 0.6)) {
      const highFreq = scale[Math.floor(Math.random() * scale.length)] * 2;
      this.triggerSoftOsc(highFreq, 0.08, 0.8, 'sine');
    }
  }

  private playTechnorhythm(step: number) {
    // Solid 4/4 Kick on beat 0, 4, 8, 12
    if (step % 4 === 0) {
      this.triggerKickDrum();
    }
    
    // Sharp high hat on step 2, 6, 10, 14
    if (step % 4 === 2) {
      this.triggerHiHat();
    }

    // Heavy pulsing synthesizer bass notes
    if (step % 2 === 1) {
      const notes = [55, 55, 65.41, 73.42, 55, 55, 82.41, 110];
      const selectedNote = notes[step % notes.length];
      this.triggerSynthBass(selectedNote, 0.12);
    }
  }

  private playJazzRhythm(step: number) {
    // Soft swing brush sound
    if (step % 3 === 0) {
      this.triggerHiHat(0.02);
    }

    // Nice warm electric piano Rhodes-like chords
    if (step === 0) {
      this.triggerJazzChord([146.83, 196.00, 246.94, 293.66], 1.5); // G Major 7 / D Minor 7
    } else if (step === 8) {
      this.triggerJazzChord([130.81, 164.81, 196.00, 246.94], 1.5); // C Major 7
    }
  }

  private playLofiRhythm(step: number) {
    // Chill dusty boombap beats
    if (step === 0 || step === 10) {
      this.triggerKickDrum(100, 0.4);
    }
    if (step === 8) {
      this.triggerSnare();
    }
    if (step % 2 === 1) {
      this.triggerHiHat(0.04);
    }
    if (step === 4) {
      // Warm chill piano tone
      this.triggerSoftOsc(261.63, 0.15, 1.2, 'sine'); // C4
    }
  }

  private playGenericRhythm(step: number) {
    if (step % 4 === 0) {
      this.triggerKickDrum();
    }
    if (step === 8) {
      this.triggerHiHat(0.1);
    }
  }

  // --- Drum / Instrument Triggers ---

  private triggerKickDrum(startFreq = 150, amp = 0.5) {
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(amp, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  private triggerHiHat(dur = 0.05) {
    if (!this.ctx || !this.analyser) return;

    // Generate white noise burst
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    source.start();
  }

  private triggerSnare() {
    if (!this.ctx || !this.analyser) return;

    // Crack snare: highpass white noise with sweeping tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    oscGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.analyser);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.analyser);

    osc.start();
    noise.start();
  }

  private triggerSynthBass(freq: number, dur: number) {
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start();
    osc.stop(this.ctx.currentTime + dur + 0.05);
  }

  private triggerSoftOsc(freq: number, value: number, decay: number, type: OscillatorType) {
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(value, this.ctx.currentTime + 0.1); // soft attack
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + decay);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start();
    osc.stop(this.ctx.currentTime + decay + 0.1);
  }

  private triggerJazzChord(freqs: number[], decay: number) {
    freqs.forEach(freq => {
      this.triggerSoftOsc(freq, 0.1, decay, 'sine');
    });
  }
}

export const audio = new AudioEngine();
