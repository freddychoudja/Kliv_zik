import {Playlist, Track} from '../types';

export const TRACKS: Track[] = [
  {
    id: 'ethereal',
    title: 'Ethereal Drift',
    artist: 'Kliv Collective',
    duration: 225,
    genre: 'Ambient Electronic',
    bpm: 90,
    lyrics: [
      {
        time: 6,
        text: 'Lost in the static of a midnight sky...',
        translation: "Perdu dans les bruits célestes d'un ciel de minuit...",
      },
    ],
  },
  {
    id: 'techno',
    title: 'Techno Beats',
    artist: 'Kliv DJ Bass',
    duration: 180,
    genre: 'Techno',
    bpm: 125,
    lyrics: [
      {
        time: 15,
        text: 'Feel the vibrations shaking the floor.',
        translation: 'Sentez les vibrations faire trembler le sol.',
      },
    ],
  },
  {
    id: 'jazz',
    title: 'Jazz Night',
    artist: 'Smooth Quartet',
    duration: 210,
    genre: 'Jazz',
    bpm: 75,
    lyrics: [
      {
        time: 24,
        text: 'Whispered secrets in the Parisian lane.',
        translation: 'Des secrets chuchotés dans la ruelle parisienne.',
      },
    ],
  },
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'chill_vibes',
    name: 'Chill & Ambient',
    description:
      "Une sélection apaisante pour le travail, l'écriture ou la détente.",
    tracks: [TRACKS[0], TRACKS[2]],
  },
  {
    id: 'electro_club',
    name: 'Techno Temple',
    description: "Le meilleur de l'électronique et du techno club survoltés.",
    tracks: [TRACKS[1]],
  },
];
