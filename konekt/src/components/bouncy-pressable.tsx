import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

/**
 * A pressable that dips and springs back.
 *
 * Opacity alone tells you a tap registered; a spring makes it feel like the
 * thing moved. That difference is most of what separates an app that feels
 * social from one that feels like a form.
 */
export function BouncyPressable({ children, style, ...rest }: PressableProps) {
  const scale = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        // Stiff and well damped: a slow spring on a tap feels sluggish, and an
        // underdamped one wobbles like a toy.
        scale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 320 });
      }}
      style={style}
      {...rest}>
      {/* Pressable's children can be a render function; pass the state through
          rather than only accepting plain nodes. */}
      {(state) => (
        <Animated.View style={animated}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
