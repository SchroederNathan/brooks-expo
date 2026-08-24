import { View } from 'react-native';

import { Icon } from './icons';
import { colors, spacing } from '../theme';

/**
 * The squiggle rule, used as a section divider and under headings
 * (#icon-squiggle-1), replacing an earlier flat-bar stand-in.
 */
export function Squiggle({ w = 120, c = colors.lime }: { w?: number; c?: string }) {
  return (
    <View style={{ marginVertical: spacing.md }}>
      <Icon name="squiggle1" size={w} color={c} />
    </View>
  );
}
