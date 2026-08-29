import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { ThemedText } from './themed-text';
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

  const tileWidth: DimensionValue = `${100 / columns}%`;

  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => {
        const { uri, type } = normalize(photo);
        return (
          <ThemedView
            key={`${uri}-${index}`}
            type="backgroundSelected"
            style={[styles.tile, { width: tileWidth }]}>
            {type === 'video' ? <VideoTile uri={uri} /> : <PhotoTile uri={uri} />}
          </ThemedView>
        );
      })}
    </View>
  );
}

function PhotoTile({ uri }: { uri: string }) {
  return <Image source={{ uri }} style={styles.image} contentFit="cover" />;
}

function VideoTile({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.image}>
      <VideoView player={player} style={styles.image} contentFit="cover" nativeControls={false} />
      <View style={styles.playBadge}>
        <ThemedText type="small" themeColor="background">
          {'▶'}
        </ThemedText>
      </View>
    </View>
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
  image: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    bottom: Spacing.one,
    right: Spacing.one,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
