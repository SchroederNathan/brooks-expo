import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * The demo's mark.
 *
 * Drawn here rather than bundled as an asset so it inherits the header colour.
 * It replaced a real retailer's logo, which had been captured verbatim from
 * their site — the single clearest piece of third-party content the app
 * carried. This is a plain geometric glyph: a rounded tile with a forward
 * chevron, owing nothing to anyone.
 *
 * The `width` prop and the 120x20 viewBox are kept from the old wordmark so the
 * header and splash layouts did not need to be re-measured.
 */
export function BrandMark({
  width = 110,
  color = colors.ink,
}: {
  width?: number;
  color?: string;
}) {
  const height = (width / 120) * 20;
  return (
    <Svg width={width} height={height} viewBox="0 0 120 20" fill="none">
      {/* Tile */}
      <Rect x="0" y="1" width="18" height="18" rx="5" fill={color} />
      {/* Chevron, knocked out of the tile */}
      <Path
        d="M6.4 5.6L11.6 10L6.4 14.4"
        stroke={colors.surface}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* "DEMO" in geometric strokes, sized to the old wordmark's optical weight. */}
      <Path
        fill={color}
        d="M25 3h6.2c4.3 0 6.8 2.6 6.8 7s-2.5 7-6.8 7H25V3zm4 3.2v7.6h2c2 0 3.2-1.4 3.2-3.8S33 6.2 31 6.2h-2z"
      />
      <Path fill={color} d="M41 3h11v3.2h-7v2.3h6.4v3.1H45v2.2h7V17H41V3z" />
      <Path
        fill={color}
        d="M55 3h4.6l3.4 7.3L66.4 3H71v14h-3.9V9.4L64.3 17h-2.6l-2.8-7.6V17H55V3z"
      />
      <Path
        fill={color}
        d="M81.9 2.7c4.4 0 7.4 2.9 7.4 7.3s-3 7.3-7.4 7.3-7.4-2.9-7.4-7.3 3-7.3 7.4-7.3zm0 3.3c-2 0-3.3 1.6-3.3 4s1.3 4 3.3 4 3.3-1.6 3.3-4-1.3-4-3.3-4z"
      />
    </Svg>
  );
}
