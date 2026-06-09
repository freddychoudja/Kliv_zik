import { Track, Playlist } from '../types';

export const TRACKS: Track[] = [
  {
    id: 'ethereal',
    title: 'Ethereal Drift',
    artist: 'Kliv Collective',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMVFDkowGKd0OscP87mJhEjo9Yc_vyeM-6i0sUQO_M9ubMGPS5r6MY_gUCO6aW2xx0WGP1nRp9AuY8J0r-yCAWS9x94bQu5_n5yUsgMAVIu8S6-xT4Pbh6kR7QnBLjp9zAm64DOsTYkUwdkOkgMMF8Cj1OkKCkJHMI3mH0SjI8L7gxg68772xu4GYq7yip0-12_J1K4saGfTLvkLY0izi_rJ_z2UyXDxlSTI7Iepegg3oVwhSIuTXxSyPtkGmQOWJGBHkCsLrS_GwU',
    alt: 'Ambient glowing blue orb',
    duration: 225,
    genre: 'Ambient Electronic',
    bpm: 90,
    lyrics: [
      { time: 0, text: "🎵 [Synth introduction playing] 🎵", translation: "🎵 [Introduction au synthétiseur] 🎵" },
      { time: 6, text: "Lost in the static of a midnight sky...", translation: "Perdu dans les bruits célestes d'un ciel de minuit..." },
      { time: 14, text: "We close our eyes and let the thoughts go by", translation: "Nous fermons les yeux et laissons filer les pensées" },
      { time: 22, text: "Floating further than the satellite line", translation: "Flottant plus loin que l'orbite des satellites" },
      { time: 30, text: "Into the colors of an infinite mind...", translation: "Dans les couleurs d'un esprit sans fin..." },
      { time: 38, text: "🎵 [Electronic melodic drop] 🎵", translation: "🎵 [Drop mélodique électronique] 🎵" },
      { time: 46, text: "Tell me you feel this drift tonight", translation: "Dis-moi que tu ressens cette dérive ce soir" },
      { time: 54, text: "Shining under the neon green light", translation: "Brillant sous la lumière vert néon" },
      { time: 62, text: "We are the frequency, we are the sound", translation: "Nous sommes la fréquence, nous sommes le son" },
      { time: 70, text: "Lifting our heavy hearts high off the ground...", translation: "Élevant nos cœurs lourds bien au-dessus du sol..." },
      { time: 82, text: "🎵 [Soprano vocal echo ambient] 🎵", translation: "🎵 [Écho vocal soprano aérien] 🎵" },
      { time: 94, text: "Time is but a digital clock on the wall", translation: "Le temps n'est qu'une horloge digitale au mur" },
      { time: 102, text: "But in this space we don't feel time at all", translation: "Mais dans cet espace, nous n'avons plus de repères" },
      { time: 110, text: "Every beat is a step in the dark", translation: "Chaque battement est un pas dans l'inconnu" },
      { time: 118, text: "Waiting to trigger that electric spark...", translation: "Attendant de déclencher cette étincelle électrique..." },
      { time: 126, text: "🎵 [Main synth and bass bridge] 🎵", translation: "🎵 [Pont principal de basse et synthé] 🎵" },
      { time: 145, text: "Lost in the static... we are free", translation: "Perdu dans les bruits... nous sommes libres" },
      { time: 153, text: "Exactly where we are meant to be", translation: "Exactement là où nous devons être" },
      { time: 161, text: "Ethereal wave, wash over me", translation: "Onde éthérée, submerge-moi" },
      { time: 169, text: "Carry me back to the cosmic sea...", translation: "Ramène-moi vers la mer cosmique..." },
      { time: 178, text: "🎵 [Beautiful fade out beats] 🎵", translation: "🎵 [Fin progressive en douceur] 🎵" }
    ]
  },
  {
    id: 'techno',
    title: 'Techno Beats',
    artist: 'Kliv DJ Bass',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS1ht5jeBI4iMbl3qEB86BxIteplQIS-Jtfwbgx2yhvHZZUY7zQXFlgSb2hqGc_Iu-xIQGdDcaVSOAi9CGXG7j0pZ-HLFZP1HRHSL_3F8SNjudcYF3s1MZFMFWFv-67LiCo66_g-Jawg54TLdsVahmLQMqgx9PNaFKErre5_PvWgZesOlP_Rn9fQyOFB2fRXNJTobZRBlkGGXQciSvAEbvnWKadXaeUHjZaTBmvfay8ZlnMXdZyjRAtNFfV6dW7Mtex7KdwSdaWqUS',
    alt: 'Neon green and charcoal geometric shapes',
    duration: 180,
    genre: 'Techno',
    bpm: 125,
    lyrics: [
      { time: 0, text: "⚡ [Furious 4/4 Kick Drums kicking in] ⚡", translation: "⚡ [Grand tambour de kicks énergique en action] ⚡" },
      { time: 10, text: "Enter the dark room.", translation: "Entrez dans la pièce sombre." },
      { time: 15, text: "Feel the vibrations shaking the floor.", translation: "Sentez les vibrations faire trembler le sol." },
      { time: 20, text: "This is the temple of bass.", translation: "C'est le temple de la basse." },
      { time: 25, text: "We do not need anything more.", translation: "Nous n'avons besoin de rien d'autre." },
      { time: 30, text: "⚠️ [Heavy modular synthesizers building up] ⚠️", translation: "⚠️ [Synthétiseurs modulaires massifs en tension] ⚠️" },
      { time: 45, text: "Let the rhythm take control of your soul!", translation: "Laissez le rythme s'emparer de votre âme !" },
      { time: 55, text: "Move your hands, lose control!", translation: "Bougez vos mains, perdez le contrôle !" },
      { time: 65, text: "🎵 [Acid synth drop peaking] 🎵", translation: "🎵 [Drop d'acide synthé intense] 🎵" }
    ]
  },
  {
    id: 'jazz',
    title: 'Jazz Night',
    artist: 'Smooth Quartet',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8mXzBl6GGyTSltNHPMbx1G6vjSlbt38LuS7yo9SmjMZ0QPP1OC8SyKXcWehEUGD_gJR6WKo-Oe0AxShU8PBx_8K5pokzSOc7uWc6EoMFCZNHmq4feJvHQMtalF6_OeN8p74RUG2IZx2Ls-CRC9JCrEph9WV563Clx-zw4k5I56-2RjEmuG6Na2n4CMHntUskR_bdQYiGoV3Jmh5g5mSfhU13RZ0lJJ5gK6wmxDYPdbqduV4tO_-HjmV0D6l8pBMrB1ulgDNg4Mrvb',
    alt: 'Acoustic guitar in emerald light',
    duration: 210,
    genre: 'Jazz',
    bpm: 75,
    lyrics: [
      { time: 0, text: "🎷 [Smooth double bass and saxophone intro] 🎷", translation: "🎷 [Contrebasse douce et saxophone en introduction] 🎷" },
      { time: 12, text: "Raindrops on the glass window pane...", translation: "Des gouttes de pluie sur la vitre..." },
      { time: 24, text: "Whispered secrets in the Parisian lane.", translation: "Des secrets chuchotés dans la ruelle parisienne." },
      { time: 36, text: "A cup of coffee, sitting with you,", translation: "Une tasse de café, assis à tes côtés," },
      { time: 48, text: "Nothing is wrong when the melody is blue...", translation: "Rien ne va mal quand la mélodie est bleue..." }
    ]
  },
  {
    id: 'lofi',
    title: 'Lofi Coffee Shop',
    artist: 'Chilled Cow',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCrOaIXvGf14UOLwCm4IShUyA-5E2IAUM8AdPe_CzLgB21kQud9yCaGrNcabA9my8DbkwcYAykB7YJcNFkT3K7M_8uCEvljzVCmsLfzOvkAma9YhFHXUyLlRSJOVlg0vYXLe2emP-mUPU88pKMR6rBZ7Ka43VJUU5gxO9xV3lfSyDrtEBsh_d5aWVrjcHSFh-FTbDBcvET0cKjPL9_YAyXv2erqwvjg0GJdbvF5DvDNs7pZq8JOxETHjtIo7elNZjzqLZ1zbWjQkJy',
    alt: 'Pixel art study room with green plants',
    duration: 195,
    genre: 'Lofi',
    bpm: 80,
    lyrics: [
      { time: 0, text: "☕ [Vinyl crackling static playing] ☕", translation: "☕ [Crackle de vinyle authentique] ☕" },
      { time: 10, text: "Study hard, stay cozy...", translation: "Étudiez dur, restez au chaud..." },
      { time: 25, text: "Let the relaxing piano keys wash away the stress.", translation: "Laissez les notes de piano relaxantes balayer le stress." },
      { time: 45, text: "Soft drums, chill dreams.", translation: "Douces percussions, rêves paisibles." }
    ]
  },
  {
    id: 'hiphop',
    title: 'Urban Boulevard',
    artist: 'Mc Flow',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyHw6zfJ9_tPusOpGSEwK_lByKARqzdSqrxa4IA6RI5ksZ7_U2YNMxgXgi-WWRxnjT02xCKVrCvrh0gcnBHd9bMXcW1MoVRcZdaPb6M7mFtwpBTzL1IZVlyr8Xim_oCwjY2YugQI7Z8QNhY9Y2ZlDKzWZg5Y8GwJYrwjzru6bJawrzYCV3lcUf8biXPF-ZVGDS7kEhPzGjw3qWHvL62RmhLcsK9s5yEihahcMKveOFYQmIQO3Vur8R4QuT3Kdl9xkjbIt2nWhCPbSu',
    alt: 'Graffiti under deep pink sunset',
    duration: 160,
    genre: 'Hip-Hop',
    bpm: 95,
    lyrics: [
      { time: 0, text: "🎤 [Boom bap golden-era scratch] 🎤", translation: "🎤 [Scratch vinyle à l'ancienne boom bap] 🎤" },
      { time: 8, text: "Yeah, walking down the street at 3 AM...", translation: "Ouais, marchant dans la rue à 3 heures du matin..." },
      { time: 15, text: "City lights look like glowing emerald gems.", translation: "Les lumières de la ville ressemblent à des émeraudes brillantes." },
      { time: 22, text: "Got my heavy shoes, got my green headphones,", translation: "Mes grosses baskets aux pieds, mon casque vert sur les oreilles," },
      { time: 29, text: "Tuned into Kliv, writing these flows in my zones...", translation: "Branché sur Kliv, écrivant ces flows dans ma zone d'écriture..." }
    ]
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'liked',
    name: 'Titres Likés',
    description: 'Vos morceaux préférés, réunis au même endroit.',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByxKSdHYSlz9hUdCSVYHGTL9PTv7ab_IAgbU9-zyywFLTnVFfRaQo0zVqruXp0Ltlddth3ot5roJ53aC2bXF2vhlbaYR__9IaZyhvzio3Ujoqr6g0VFJKV9GR_CZficiQjUhUhLLBctmDBJMZamisUKhGXdY0_31H5RH0X_VlTN592Pa_r0eYgnakWzToKfy96jc7AjOuUElP8Y9MnyJfcyC7bKtqE_1BQv9CwkcB_3MdHgt5QxkPVFlil9m0zN5Z246MaURBS4Luf',
    tracks: [TRACKS[0]],
  },
  {
    id: 'chill_vibes',
    name: 'Chill & Ambient',
    description: 'Une sélection apaisante pour le travail, l\'écriture ou la détente.',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKM8prtlTEfB_U9e6h1AaXXxxiWi12gyjnaJoPuu4CYj7wdom15w__R6C73wW0uwuAFuAubeeTTUemxRsweUm2XJYaZRdw5-96yVDpSGtZfgOOxlDDdsHIcmKyINdtyetpWgbQRkF8yzwfeOGQag0ODexmSAYkKynOjb3GbmYkkAGC3dt5S0nennmUHI3NdQsw6HQ6qUhmVQsXXprnZ0zTqV6hntPNMwKiIVH13wQXOB4j6j-dhA6WVOZOD9D4xGxtZIbmd4hYBmd5',
    tracks: [TRACKS[0], TRACKS[2], TRACKS[3]],
  },
  {
    id: 'electro_club',
    name: 'Techno Temple',
    description: 'Le meilleur de l\'électronique et du techno club survoltés.',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS1ht5jeBI4iMbl3qEB86BxIteplQIS-Jtfwbgx2yhvHZZUY7zQXFlgSb2hqGc_Iu-xIQGdDcaVSOAi9CGXG7j0pZ-HLFZP1HRHSL_3F8SNjudcYF3s1MZFMFWFv-67LiCo66_g-Jawg54TLdsVahmLQMqgx9PNaFKErre5_PvWgZesOlP_Rn9fQyOFB2fRXNJTobZRBlkGGXQciSvAEbvnWKadXaeUHjZaTBmvfay8ZlnMXdZyjRAtNFfV6dW7Mtex7KdwSdaWqUS',
    tracks: [TRACKS[1], TRACKS[4]],
  }
];
