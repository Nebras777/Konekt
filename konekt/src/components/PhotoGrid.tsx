import { Image } from 'expo-image';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

export type PhotoGridProps = {
  photos: string[];
  columns?: number;
};

export function PhotoGrid({ photos, columns = 3 }: PhotoGridProps) {
  if (photos.length === 0) {
    return null;
  }

  const tileWidth: DimensionValue = `${100 / columns}%`;

  return (
    <View style={styles.grid}>
      {photos.map((uri, index) => (
        <ThemedView
          key={`${uri}-${index}`}
          type="backgroundSelected"
          style={[styles.tile, { width: tileWidth }]}>
          <Image source={{ uri }} style={styles.image} contentFit="cover" />
        </ThemedView>
      ))}
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
});
