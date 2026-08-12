import { View } from 'react-native';

import { colors, spacing } from '../theme';

/** Empty/error state illustration stand-in — a Brooks-ish hand-drawn squiggle. */
export function Squiggle({ w = 120, c = colors.lime }: { w?: number; c?: string }) {
  return <View style={{ width: w, height: 6, backgroundColor: c, marginVertical: spacing.md }} />;
}
