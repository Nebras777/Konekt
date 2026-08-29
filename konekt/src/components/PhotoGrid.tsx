import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

export type PhotoGridItem = {
  uri: string;
  type?: 'photo' | 'video';
};

export type PhotoGridProps = {
  photos: (string | PhotoGridItem)[];
  columns?: number;
};

function normalize(photo: string | PhotoGridItem): PhotoGridItem {
  return typeof photo === 'string' ? { uri: photo, type: 'photo' } : photo;
}

export function PhotoGrid({ photos, columns = 3 }: PhotoGridProps) {
  if (photos.length === 0) {
    return null;
  }

  // Never squeeze fewer items than `columns` into narrow tiles — a single
  // photo/video should take the full width, not sit in a 1/3-width slot
  // meant for a multi-photo grid.
  const effectiveColumns = Math.min(columns, photos.length);
  const tileWidth: DimensionValue = `${100 / effectiveColumns}%`;

  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => {
        const { uri, type } = normalize(photo);
        return type === 'video' ? (
          <VideoTile key={`${uri}-${index}`} uri={uri} width={tileWidth} />
        ) : (
          <ThemedView
            key={`${uri}-${index}`}
            type="backgroundSelected"
            style={[styles.tile, { width: tileWidth }]}>
            <Image source={{ uri }} style={styles.media} contentFit="cover" />
          </ThemedView>
        );
      })}
    </View>
  );
}

function VideoTile({ uri, width }: { uri: string; width: DimensionValue }) {
  // Muted, non-looping, not auto-playing: the native controls (which include
  // their own fullscreen button — see expo-video's FullscreenOptions, default
  // enable: true) own all interaction here. A custom Pressable overlay was
  // tried first but the native player's own touch handling swallowed the tap
  // before it ever reached it.
  const player = useVideoPlayer(uri, (p) => {
    p.muted = false;
  });

  return (
    <ThemedView type="backgroundSelected" style={[styles.tile, { width }]}>
      <VideoView player={player} style={styles.media} contentFit="cover" nativeControls />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  tile: {
    aspectRatio: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
});
