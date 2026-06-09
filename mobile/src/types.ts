export interface LyricLine {
  text: string;
  translation: string;
  time: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  bpm: number;
  lyrics: LyricLine[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
}
