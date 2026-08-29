import { useAudioPlayer } from 'expo-audio';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

export function VoiceNotePlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
    setPlaying(!playing);
  }

  return (
    <Pressable onPress={toggle} accessibilityRole="button">
      {({ pressed }) => (
        <ThemedView type="backgroundSelected" style={[styles.row, pressed && styles.pressed]}>
          <ThemedText type="smallBold">{playing ? '⏸ Pause voice note' : '▶ Play voice note'}</ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
