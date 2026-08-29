import { View } from 'react-native';

/**
 * A bell drawn from plain views.
 *
 * The header previously used the 🔔 emoji, which can't be recoloured — emoji
 * carry their own palette. Drawing it means it can take any colour, and it
 * needs no icon-font dependency.
 */
export function BellIcon({ color, size = 22 }: { color: string; size?: number }) {
  const domeWidth = size * 0.66;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: domeWidth,
          height: domeWidth * 0.8,
          borderTopLeftRadius: domeWidth / 2,
          borderTopRightRadius: domeWidth / 2,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          width: size * 0.88,
          height: 2.5,
          borderRadius: 2,
          backgroundColor: color,
          marginTop: 1,
        }}
      />
      <View
        style={{
          width: 4.5,
          height: 4.5,
          borderRadius: 3,
          backgroundColor: color,
          marginTop: 1.5,
        }}
      />
    </View>
  );
}
