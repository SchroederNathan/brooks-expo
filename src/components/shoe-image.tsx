import type { ViewStyle } from 'react-native';

import { Swatch } from './swatch';

/**
 * Product imagery. The synthetic catalog ships colourway swatches instead of
 * photography, so this renders locally and never hits the network. The props
 * are unchanged from the CDN-backed version so call sites did not have to move.
 */
export function ShoeImage({
  url,
  width,
  height,
  style,
  contentFit,
  priority,
  transition,
}: {
  url: string;
  width: number;
  height?: number;
  style?: ViewStyle;
  /** Accepted and ignored: a generated swatch always fills its frame. */
  contentFit?: 'contain' | 'cover';
  priority?: 'low' | 'normal' | 'high';
  transition?: number;
}) {
  void contentFit;
  void priority;
  void transition;
  return <Swatch url={url} width={width} height={height} style={style} />;
}
