import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';

/**
 * Tappable wrapper. Scale feedback is currently ignored pending the motion
 * overhaul; `scaleTo` stays in the API so call sites keep their intended press
 * values.
 *
 * [observed 2026-08-26] This used to fire a light impact on every press, and
 * the `haptic={false}` opt-out was threaded through roughly a dozen call sites
 * to silence it. Both are gone: the tab bar is the only place the app still
 * buzzes. See `utils/haptics`.
 */
export function Press({
  children,
  style,
  scaleTo: _scaleTo = 0.97,
  ...rest
}: PressableProps & { scaleTo?: number; children: React.ReactNode }) {
  void _scaleTo;
  return (
    <Pressable {...rest} style={style as ViewStyle}>
      {children}
    </Pressable>
  );
}
