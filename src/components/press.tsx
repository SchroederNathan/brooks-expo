import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { tap } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressed feedback for anything tappable: a small spring scale plus a light tap. */
export function Press({
  children,
  style,
  scaleTo = 0.97,
  haptic = true,
  onPressIn,
  onPress,
  ...rest
}: PressableProps & { scaleTo?: number; haptic?: boolean; children: React.ReactNode }) {
  const s = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      style={[animated, style as ViewStyle]}
      onPressIn={(e) => {
        s.value = withSpring(scaleTo, { damping: 20, stiffness: 400 });
        onPressIn?.(e);
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 18, stiffness: 300 });
      }}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
