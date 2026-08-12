import Svg, { Path } from 'react-native-svg';

/**
 * The Brooks wordmark.
 *
 * @ref LLP 0003#logo — Brooks ships its logo as an inline SVG sprite symbol with
 * no standalone public URL, so this is a hand-traced approximation of the
 * wordmark plus its chevron "flash." It reads correctly at header sizes; it is
 * not the licensed original and should be swapped for the real asset before this
 * ever leaves a prototype.
 */
export function BrooksWordmark({
  width = 110,
  color = '#0E131F',
}: {
  width?: number;
  color?: string;
}) {
  const height = (width / 120) * 20;
  return (
    <Svg width={width} height={height} viewBox="0 0 120 20" fill="none">
      {/* chevron flash */}
      <Path
        d="M0 13.4 6.2 4.1l3.1 5.2 3.2-5.2 6.1 9.3h-3.9l-2.2-3.6-3.2 5.3-3.2-5.3-2.2 3.6H0Z"
        fill={color}
      />
      {/* BROOKS */}
      <Path
        d="M24.6 4.4h5.6c2.4 0 3.8 1.1 3.8 2.9 0 1.2-.6 2-1.6 2.4 1.3.4 2.1 1.3 2.1 2.7 0 2-1.6 3.2-4.2 3.2h-5.7V4.4Zm5.2 4.4c1 0 1.6-.4 1.6-1.2 0-.8-.6-1.2-1.6-1.2h-2.6v2.4h2.6Zm.3 4.8c1.1 0 1.7-.5 1.7-1.3 0-.9-.6-1.3-1.7-1.3h-2.9v2.6h2.9ZM37.1 4.4h5.3c2.7 0 4.3 1.4 4.3 3.7 0 1.7-.9 2.9-2.4 3.4l2.8 4.1h-3.1l-2.4-3.7h-1.9v3.7h-2.6V4.4Zm5.1 5.3c1.2 0 1.9-.6 1.9-1.5 0-1-.7-1.5-1.9-1.5h-2.5v3h2.5ZM48.3 10c0-3.3 2.5-5.8 5.9-5.8 3.4 0 5.9 2.5 5.9 5.8s-2.5 5.8-5.9 5.8c-3.4 0-5.9-2.5-5.9-5.8Zm9.1 0c0-1.9-1.3-3.4-3.2-3.4-1.9 0-3.2 1.5-3.2 3.4s1.3 3.4 3.2 3.4c1.9 0 3.2-1.5 3.2-3.4ZM61.8 10c0-3.3 2.5-5.8 5.9-5.8 3.4 0 5.9 2.5 5.9 5.8s-2.5 5.8-5.9 5.8c-3.4 0-5.9-2.5-5.9-5.8Zm9.1 0c0-1.9-1.3-3.4-3.2-3.4-1.9 0-3.2 1.5-3.2 3.4s1.3 3.4 3.2 3.4c1.9 0 3.2-1.5 3.2-3.4ZM75.7 4.4h2.6v4.5l4.1-4.5h3.3l-4.4 4.7 4.6 6.5h-3.2l-3.2-4.6-1.2 1.3v3.3h-2.6V4.4ZM86.5 13.9l1.5-1.8c1 .9 2.1 1.4 3.4 1.4 1.1 0 1.7-.4 1.7-1.1 0-.7-.5-1-2.2-1.4-2.4-.6-3.9-1.3-3.9-3.4 0-2 1.7-3.4 4-3.4 1.7 0 3.1.5 4.3 1.5l-1.3 1.9c-1-.7-2-1.1-3-1.1-1 0-1.5.4-1.5 1 0 .8.6 1 2.3 1.5 2.4.6 3.7 1.5 3.7 3.4 0 2.2-1.7 3.5-4.2 3.5-1.8 0-3.6-.6-4.8-1.9Z"
        fill={color}
      />
    </Svg>
  );
}
