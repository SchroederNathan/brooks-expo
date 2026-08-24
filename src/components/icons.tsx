import type { ReactElement } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * The app's icon set.
 *
 * Every glyph here is drawn for this project. The set it replaced was verbatim
 * path data lifted from a real retailer's inline SVG sprite, which made the
 * icons third-party artwork shipped inside the binary — the same category of
 * content as the logo and the product photography.
 *
 * All glyphs share a 24x24 viewBox and a 2-unit stroke, so unlike the sprite
 * they came from, they need no per-glyph weight correction to look even beside
 * each other. `thicken` is kept because call sites pass it, and now simply adds
 * stroke width.
 *
 * Single-color glyphs live in the registry and take their color from the
 * `color` prop. The multi-color exceptions are separate components below.
 */

type Glyph = {
  /** viewBox width/height. Uniform here, but kept so call sites can scale. */
  vb: readonly [number, number];
  render: (c: string) => ReactElement;
};

const BOX = [24, 24] as const;

/** Shared stroke setup for the outline glyphs. */
const S = {
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

/** A five-pointed star path on the 24x24 grid, reused by the rating glyphs. */
const STAR_D =
  'M12 3.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1-5.4-3-5.4 3 1.1-6.1L3.2 9.6l6.1-.8z';

const glyphs = {
  search: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Circle cx={10.5} cy={10.5} r={6.5} />
        <Path d="M15.5 15.5L21 21" />
      </G>
    ),
  },
  cart: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M3 4h2.2l2.3 10.4h10L20 7H6.2" />
        <Circle cx={9} cy={19} r={1.6} />
        <Circle cx={17} cy={19} r={1.6} />
      </G>
    ),
  },
  account: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Circle cx={12} cy={8} r={4} />
        <Path d="M4.5 20.5c1.2-3.7 4-5.5 7.5-5.5s6.3 1.8 7.5 5.5" />
      </G>
    ),
  },
  hamburger: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
      </G>
    ),
  },
  filters: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M3 6h18M6 12h12M10 18h4" />
      </G>
    ),
  },
  close: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
      </G>
    ),
  },
  closeThin: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S} strokeWidth={1.4}>
        <Path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
      </G>
    ),
  },
  closeUpdated: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Circle cx={12} cy={12} r={9} />
        <Path d="M8.8 8.8l6.4 6.4M15.2 8.8l-6.4 6.4" />
      </G>
    ),
  },
  caretDown: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M5.5 9l6.5 6.5L18.5 9" />
      </G>
    ),
  },
  caretUp: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M5.5 15l6.5-6.5L18.5 15" />
      </G>
    ),
  },
  caretLeft: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M15 5.5L8.5 12l6.5 6.5" />
      </G>
    ),
  },
  caretRight: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M9 5.5L15.5 12 9 18.5" />
      </G>
    ),
  },
  arrowLeft: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M20 12H4.5M11 5.5L4.5 12l6.5 6.5" />
      </G>
    ),
  },
  arrowRight: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M4 12h15.5M13 5.5l6.5 6.5-6.5 6.5" />
      </G>
    ),
  },
  longArrow: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S} strokeWidth={1.6}>
        <Path d="M2 12h20M17 7.5l4.5 4.5-4.5 4.5" />
      </G>
    ),
  },
  diagonalArrow: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M7 17L17 7M9 7h8v8" />
      </G>
    ),
  },
  checkmark: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Circle cx={12} cy={12} r={9} />
        <Path d="M8 12.4l2.8 2.8L16.4 9.6" />
      </G>
    ),
  },
  checkmarkNoCircle: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M4.5 12.8l5 5L19.5 7" />
      </G>
    ),
  },
  tooltip: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M4 5h16v11H13l-4 3.5V16H4z" />
      </G>
    ),
  },
  plus: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M12 4.5v15M4.5 12h15" />
      </G>
    ),
  },
  minus: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M4.5 12h15" />
      </G>
    ),
  },
  star: {
    vb: BOX,
    render: (c) => <Path d={STAR_D} fill={c} />,
  },
  borderStarFull: {
    vb: BOX,
    render: (c) => <Path d={STAR_D} fill={c} stroke={c} strokeWidth={1.4} strokeLinejoin="round" />,
  },
  borderStarHalf: {
    vb: BOX,
    render: (c) => (
      <G>
        <Defs>
          {/* Hard stop at the midpoint: one gradient is cheaper than a clip
              path and renders identically on both platforms. */}
          <LinearGradient id="halfStar" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0.5" stopColor={c} />
            <Stop offset="0.5" stopColor={c} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={STAR_D} fill="url(#halfStar)" stroke={c} strokeWidth={1.4} strokeLinejoin="round" />
      </G>
    ),
  },
  borderStarEmpty: {
    vb: BOX,
    render: (c) => (
      <Path d={STAR_D} fill="none" stroke={c} strokeWidth={1.4} strokeLinejoin="round" />
    ),
  },
  ratingStar: {
    vb: BOX,
    render: (c) => <Path d={STAR_D} fill={c} />,
  },
  pin: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M12 21c4-4.6 6-7.9 6-10.6A6 6 0 006 10.4C6 13.1 8 16.4 12 21z" />
        <Circle cx={12} cy={10.2} r={2.2} />
      </G>
    ),
  },
  clock: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Circle cx={12} cy={12} r={9} />
        <Path d="M12 7v5.4l3.6 2.2" />
      </G>
    ),
  },
  expand: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S}>
        <Path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
      </G>
    ),
  },
  circle: {
    vb: BOX,
    render: (c) => <Circle cx={12} cy={12} r={9} fill={c} />,
  },
  square: {
    vb: BOX,
    render: (c) => <Rect x={3} y={3} width={18} height={18} rx={2} fill={c} />,
  },
  squiggle1: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S} strokeWidth={2.2}>
        <Path d="M2 14c2.5-5 5-5 7.5 0s5 5 7.5 0 3.5-3.5 5-1.5" />
      </G>
    ),
  },
  ctaHoverSquiggle: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S} strokeWidth={1.8}>
        <Path d="M2 13c3-4 6-4 9 0s6 4 9 0" />
      </G>
    ),
  },
  longSquiggle: {
    vb: BOX,
    render: (c) => (
      <G stroke={c} {...S} strokeWidth={1.6}>
        <Path d="M1 13c2-3.5 4-3.5 6 0s4 3.5 6 0 4-3.5 6 0 3 2 4 .5" />
      </G>
    ),
  },
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof glyphs;

/**
 * A single-color glyph, scaled to fit a `size` x `size` box.
 *
 * `thicken` adds that many rendered pixels of stroke weight. The glyphs are a
 * uniform weight already, so it is only needed where a call site wants one
 * icon to read heavier than its neighbours.
 */
export function Icon({
  name,
  size = 18,
  color = colors.ink,
  thicken = 0,
}: {
  name: IconName;
  size?: number;
  color?: string;
  thicken?: number;
}) {
  const { vb, render } = glyphs[name] as Glyph;
  const [w, h] = vb;
  const scale = size / Math.max(w, h);
  const node =
    thicken > 0 ? (
      <G stroke={color} strokeWidth={thicken / scale} strokeLinejoin="round">
        {render(color)}
      </G>
    ) : (
      render(color)
    );
  return (
    <Svg width={w * scale} height={h * scale} viewBox={`0 0 ${w} ${h}`} fill="none">
      {node}
    </Svg>
  );
}

/** The PDP "i" info disc: a solid disc with the letterform knocked out. */
export function InfoIcon({
  size = 14,
  color = colors.ink,
  glyphColor = colors.surface,
}: {
  size?: number;
  color?: string;
  glyphColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={12} fill={color} />
      <Circle cx={12} cy={6.6} r={1.6} fill={glyphColor} />
      <Rect x={10.6} y={9.8} width={2.8} height={8.4} rx={1.4} fill={glyphColor} />
    </Svg>
  );
}

type ProductDiagramProps = {
  size?: number;
  color?: string;
};

/**
 * The product-detail cushioning diagram.
 *
 * Replaces a shoe cross-section the retailer served as its own SVG asset. This
 * is an abstract stack — layers over a baseline — which says the same thing
 * about cushioning depth without being a drawing of anybody's shoe.
 */
export function BalancedCushionIcon({ size = 80, color = colors.ink }: ProductDiagramProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={14} y={26} width={72} height={14} rx={7} />
        <Rect x={14} y={44} width={72} height={10} rx={5} />
        <Path d="M12 66h76" />
        <Path d="M50 70l12 20H38z" />
      </G>
    </Svg>
  );
}

/**
 * The product-detail support diagram: the same stack with guidance rails either
 * side, again abstract rather than a shoe.
 */
export function BalancedSupportIcon({ size = 80, color = colors.ink }: ProductDiagramProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={22} y={26} width={56} height={22} rx={8} />
        <Path d="M14 26v22M86 26v22" />
        <Path d="M12 66h76M12 80h76" />
      </G>
    </Svg>
  );
}

/**
 * The PDP cushion meter: an outlined track with one of three thirds filled.
 * The fill takes the palette accent rather than the meter blue the previous
 * version hard-coded, which was a value from someone else's stylesheet.
 */
export function CushionMeter({
  level,
  width = 140,
}: {
  level: 'standard' | 'more' | 'most';
  width?: number;
}) {
  const fillX = { standard: 2, more: 47, most: 92 }[level];
  return (
    <Svg width={width} height={(width / 140) * 16} viewBox="0 0 140 16" fill="none">
      <Rect
        x={1}
        y={1}
        width={138}
        height={14}
        rx={3}
        stroke={colors.blue}
        strokeWidth={2}
        fill="none"
      />
      <Rect x={fillX} y={2} width={46} height={12} rx={2} fill={colors.blue} />
    </Svg>
  );
}
