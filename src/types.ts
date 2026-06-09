export type Screen = 'home' | 'search' | 'library' | 'player' | 'profile' | 'edit-profile' | 'auth' | 'upload' | 'playlist' | 'equalizer' | 'party';

export interface LyricLine {
  text: string;
  translation: string;
  time: number; // in seconds
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  description?: string;
  alt: string;
  isUserUploaded?: boolean;
  duration: number; // in seconds
  lyrics: LyricLine[];
  genre: string;
  bpm: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  tracks: Track[];
  isCustom?: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string;
  followers: number;
  following: number;
}

export type SoundscapeType = 'rain' | 'space' | 'waves' | 'campbuilt';

export interface Soundscape {
  id: SoundscapeType;
  name: string;
  icon: string;
  volume: number;
}

export interface EqualizerPreset {
  name: string;
  bass: number; // -10 to +10
  mid: number;
  treble: number;
}
