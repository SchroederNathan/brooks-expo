import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  /** Blur strength at the anchored edge. */
  intensity?: number;
  /** The edge where the blur is strongest. */
  direction?: 'top' | 'bottom';
  /** Blur material. `default` keeps the effect neutral. */
  tint?: 'default' | 'light' | 'dark';
};

/**
 * Progressive blur adapted from speech-companion: a single BlurView is masked
 * by an eased alpha gradient. It deliberately has no color scrim, so the
 * underlying content keeps its original hue.
 *
 * @ref LLP 0003#screen-patterns — Persistent chrome needs a soft material edge
 * while content and the stretchy hero continue beneath it.
 */
export function ProgressiveBlur({
  style,
  intensity = 40,
  direction = 'top',
  tint = 'default',
  ...rest
}: Props) {
  const toEdge = direction === 'top' ? 'bottom' : 'top';

  return (
    <View pointerEvents="none" style={style} {...rest}>
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <View
            style={{
              flex: 1,
              experimental_backgroundImage: `linear-gradient(to ${toEdge}, rgb(0,0,0) 0%, rgb(0,0,0) 30%, rgba(0,0,0,0.95) 45%, rgba(0,0,0,0.82) 58%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.38) 81%, rgba(0,0,0,0.16) 91%, rgba(0,0,0,0) 100%)`,
            }}
          />
        }
      >
        <BlurView
          tint={tint}
          intensity={intensity}
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
      </MaskedView>
    </View>
  );
}
