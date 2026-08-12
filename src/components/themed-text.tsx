import { Text, TextProps } from 'react-native';

import { colors, type } from '../theme';

/**
 * The one text primitive: screens pick a `type` ramp step by variant and never
 * touch fontSize. Color rides a `c` prop so one ramp serves ink-on-surface and
 * white-on-navy alike. Caller style merges last.
 */
export function Txt({
  variant = 'body',
  c = colors.ink,
  style,
  ...rest
}: TextProps & { variant?: keyof typeof type; c?: string }) {
  return <Text {...rest} style={[type[variant], { color: c }, style]} />;
}
