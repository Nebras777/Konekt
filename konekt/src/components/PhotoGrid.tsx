import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { ThemedView } from './themed-view';

import { Radii, Spacing } from '@/constants/theme';

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
  // One photo gets a wide, letterbox crop rather than a square: it is the
  // subject of the card, and a square thumbnail reads as an attachment.
  const single = photos.length === 1;

  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => {
        const { uri, type } = normalize(photo);
        return type === 'video' ? (
          <VideoTile key={`${uri}-${index}`} uri={uri} width={tileWidth} single={single} />
        ) : (
          <ThemedView
            key={`${uri}-${index}`}
            type="backgroundSelected"
            style={[styles.tile, single && styles.tileSingle, { width: tileWidth }]}>
            <Image source={{ uri }} style={styles.media} contentFit="cover" />
          </ThemedView>
        );
      })}
    </View>
  );
}

function VideoTile({
  uri,
  width,
  single,
}: {
  uri: string;
  width: DimensionValue;
  single: boolean;
}) {
  // Muted, non-looping, not auto-playing: the native controls (which include
  // their own fullscreen button — see expo-video's FullscreenOptions, default
  // enable: true) own all interaction here. A custom Pressable overlay was
  // tried first but the native player's own touch handling swallowed the tap
  // before it ever reached it.
  const player = useVideoPlayer(uri, (p) => {
    p.muted = false;
  });

  return (
    <ThemedView
      type="backgroundSelected"
      style={[styles.tile, single && styles.tileSingle, { width }]}>
      <VideoView player={player} style={styles.media} contentFit="cover" nativeControls />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tile: {
    aspectRatio: 1,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  tileSingle: {
    aspectRatio: 4 / 3,
    borderRadius: Radii.lg,
  },
  media: {
    width: '100%',
    height: '100%',
  },
});
