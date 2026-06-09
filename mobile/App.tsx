import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {INITIAL_PLAYLISTS, TRACKS} from './src/data/tracks';
import {Playlist, Track} from './src/types';

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
};

function TrackCard({track}: {track: Track}) {
  return (
    <View style={styles.card}>
      <Text style={styles.trackTitle}>{track.title}</Text>
      <Text style={styles.trackMeta}>{track.artist}</Text>
      <Text style={styles.trackMeta}>
        {track.genre} • {track.bpm} BPM • {formatDuration(track.duration)}
      </Text>
    </View>
  );
}

function PlaylistCard({playlist}: {playlist: Playlist}) {
  return (
    <View style={styles.playlistCard}>
      <Text style={styles.playlistTitle}>{playlist.name}</Text>
      <Text style={styles.playlistMeta}>{playlist.description}</Text>
      <Text style={styles.playlistMeta}>{playlist.tracks.length} titres</Text>
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Kliv Mobile</Text>
          <Text style={styles.subtitle}>
            Version React Native CLI prête pour build APK Android.
          </Text>

          <Text style={styles.sectionTitle}>Playlists</Text>
          {INITIAL_PLAYLISTS.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}

          <Text style={styles.sectionTitle}>Titres populaires</Text>
          {TRACKS.map(track => (
            <TrackCard key={track.id} track={track} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  listContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#f9fafb',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#d1d5db',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#34d399',
  },
  card: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    padding: 14,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  trackMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#d1d5db',
  },
  playlistCard: {
    borderRadius: 12,
    backgroundColor: '#0f766e',
    padding: 14,
    marginTop: 10,
  },
  playlistTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ecfeff',
  },
  playlistMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#ccfbf1',
  },
});

export default App;
