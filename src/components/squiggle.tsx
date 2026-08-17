import { View } from 'react-native';

import { BrooksIcon } from './icons';
import { colors, spacing } from '../theme';

/**
 * The Brooks squiggle — the site's own footer/newsletter squiggle glyph
 * (#icon-squiggle-1), replacing an earlier flat-bar stand-in.
 */
export function Squiggle({ w = 120, c = colors.lime }: { w?: number; c?: string }) {
  return (
    <View style={{ marginVertical: spacing.md }}>
      <BrooksIcon name="squiggle1" size={w} color={c} />
    </View>
  );
}
