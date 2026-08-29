import { View } from 'react-native';

/**
 * A bell drawn from plain views.
 *
 * The header used the 🔔 emoji, which can't be recoloured — emoji carry their
 * own palette. An icon font would be better, but @expo/vector-icons isn't
 * installed, so this is drawn instead: four rectangles, shaped by radii.
 *
 * The proportions matter. An earlier version made the dome as wide as it was
 * tall with a full radius, which just reads as a circle.
 */
export function BellIcon({ color, size = 22 }: { color: string; size?: number }) {
  const unit = size / 22;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-start' }}>
      {/* the little stem on top */}
      <View
        style={{
          width: 3 * unit,
          height: 3 * unit,
          borderRadius: 2 * unit,
          backgroundColor: color,
        }}
      />
      {/* the body: taller than wide, rounded at the top, squared at the base */}
      <View
        style={{
          width: 12 * unit,
          height: 11 * unit,
          borderTopLeftRadius: 6 * unit,
          borderTopRightRadius: 6 * unit,
          borderBottomLeftRadius: 1.5 * unit,
          borderBottomRightRadius: 1.5 * unit,
          backgroundColor: color,
          marginTop: -0.5 * unit,
        }}
      />
      {/* the rim, wider than the body — this is what makes it read as a bell */}
      <View
        style={{
          width: 18 * unit,
          height: 2.2 * unit,
          borderRadius: 1.2 * unit,
          backgroundColor: color,
          marginTop: 0.6 * unit,
        }}
      />
      {/* the clapper */}
      <View
        style={{
          width: 4 * unit,
          height: 4 * unit,
          borderRadius: 2.5 * unit,
          backgroundColor: color,
          marginTop: 0.8 * unit,
        }}
      />
    </View>
  );
}
