import type { ViewStyle } from 'react-native';

import { Swatch } from './swatch';

/**
 * Editorial imagery slot. The lifestyle photography was a third party's, so this is a
 * swatch too — square-cornered, since editorial frames set their own radius.
 */
export function Photo({
  url,
  style,
  width,
  height,
  priority,
}: {
  url: string;
  style?: ViewStyle;
  width: number;
  height: number;
  priority?: 'low' | 'normal' | 'high';
}) {
  void priority;
  return (
    <Swatch url={url} width={width} height={height} rounded={false} style={style} />
  );
}
