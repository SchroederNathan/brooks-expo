import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';

import { tap } from '../utils/haptics';

/**
 * Tappable wrapper: haptic on press. Scale feedback is currently ignored
 * pending the motion overhaul; `scaleTo` stays in the API so call sites
 * keep their intended press values.
 */
export function Press({
  children,
  style,
  scaleTo: _scaleTo = 0.97,
  haptic = true,
  onPress,
  ...rest
}: PressableProps & { scaleTo?: number; haptic?: boolean; children: React.ReactNode }) {
  void _scaleTo;
  return (
    <Pressable
      {...rest}
      style={style as ViewStyle}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
    >
      {children}
    </Pressable>
  );
}
