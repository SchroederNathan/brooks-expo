import { Gauge, HStack, Image, Rectangle, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  aspectRatio,
  clipped,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  offset,
  resizable,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { requireOptionalNativeModule } from 'expo';
import type { Widget, WidgetEnvironment } from 'expo-widgets';

import type { ShoeMileageWidgetProps } from './shoe-mileage.types';

/**
 * The shoe mileage widget: the most-worn pair, its photo, its miles against
 * its limit, and whether it is time to replace it.
 *
 * @ref LLP 0006#the-widget-reads-the-app-group — `updateSnapshot` writes the
 * props to the App Group's shared defaults (`group.<bundle id>`), and the
 * widget extension reads them from there. The photo is a file in the same
 * group. The widget never reads Health itself: it shows the number the app
 * last computed.
 *
 * @ref LLP 0006#the-widget-design — The odometer: the miles lead, and a row of
 * ticks shows them against the limit, with a longer tick at the miles run. No
 * lime: lime on the paper white fails contrast, so "Time to replace" is Brooks
 * blue.
 *
 * The function below runs in the widget's own JavaScript runtime. It can see
 * only its arguments: no imports beyond `@expo/ui/swift-ui`, no module-scope
 * constants, no theme. So the colors are restated inside it. System fonts,
 * too: Filson Pro is bundled with the app, not the extension.
 */
const ShoeMileage = (props: ShoeMileageWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const PAPER = '#F8F8F8';
  const INK = '#0E131F';
  const BLUE = '#003789';
  const MUTED = '#707070';
  const EMPTY = '#D6D6D6';
  const family = environment.widgetFamily;
  const fill = frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' });

  // Lock Screen families: the system tints them, so no colors of our own.
  if (family === 'accessoryInline') {
    return (
      <Text modifiers={[widgetURL(props.url)]}>
        {props.hasShoe ? `${props.name}: ${props.percent}` : 'Add a pair in Brooks'}
      </Text>
    );
  }
  if (family === 'accessoryCircular') {
    return (
      <Gauge
        value={props.hasShoe ? props.share : 0}
        currentValueLabel={<Text modifiers={[monospacedDigit()]}>{props.hasShoe ? props.percent : '–'}</Text>}
        modifiers={[gaugeStyle('circularCapacity'), widgetURL(props.url)]}
      />
    );
  }
  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={2} modifiers={[widgetURL(props.url)]}>
        <Text modifiers={[font({ weight: 'bold', size: 15 }), lineLimit(1)]}>
          {props.hasShoe ? props.name : 'Shoe mileage'}
        </Text>
        <Text modifiers={[font({ size: 13 }), lineLimit(1)]}>
          {props.hasShoe ? `${props.miles}. ${props.status}` : 'Add a pair in Brooks'}
        </Text>
        <Gauge value={props.hasShoe ? props.share : 0} modifiers={[gaugeStyle('linearCapacity')]} />
      </VStack>
    );
  }

  if (!props.hasShoe) {
    return (
      <VStack alignment="leading" spacing={4} modifiers={[containerBackground(PAPER, 'widget'), widgetURL(props.url), fill]}>
        <Spacer />
        <Text modifiers={[font({ weight: 'bold', size: 16 }), foregroundStyle(INK)]}>Add the pair you run in</Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(MUTED)]}>Brooks counts its miles from Apple Health.</Text>
      </VStack>
    );
  }

  const small = family === 'systemSmall';

  // A measuring tape down the right edge, filling from the bottom: 16 ticks,
  // the filled ones are the miles run, and the top filled one is long, so it
  // reads as the needle. An empty tape has no long tick.
  const lit = Math.round(props.share * 16);
  const ruler = (
    <VStack alignment="trailing" spacing={4}>
      {Array.from({ length: 16 }, (_, i) => {
        const fromBottom = 15 - i;
        const mark = fromBottom === lit - 1;
        return (
          <Rectangle
            key={i}
            modifiers={[foregroundStyle(fromBottom < lit ? INK : EMPTY), frame({ width: mark ? 18 : 10, height: 3 })]}
          />
        );
      })}
    </VStack>
  );

  const miles = (
    <VStack alignment="leading" spacing={0}>
      <Text modifiers={[font({ weight: 'heavy', size: small ? 34 : 40 }), foregroundStyle(INK), monospacedDigit(), lineLimit(1), minimumScaleFactor(0.7)]}>
        {props.milesShort}
      </Text>
      <Text modifiers={[font({ weight: 'medium', size: 12 }), foregroundStyle(MUTED), lineLimit(1)]}>{`of ${props.limit}`}</Text>
    </VStack>
  );

  const status = (
    <Text modifiers={[font({ weight: 'semibold', size: 12 }), foregroundStyle(props.replace ? BLUE : MUTED), lineLimit(1)]}>
      {props.status}
    </Text>
  );

  // Brooks shoots on #F8F8F8, so the photo sits on the widget with no edge.
  // Every side-profile shot is framed the same way: the shoe spans 8–92% of
  // the width and 37–82% of the height (the sole always at 82%). So the
  // square photo is drawn at full width, moved up 10%, and cut to the band
  // from 34% to 86%: the whole shoe, none of the empty gray.
  const photoWidth = small ? 100 : 136;
  const photo = props.image ? (
    <Image
      uiImage={props.image}
      modifiers={[
        resizable(),
        aspectRatio({ contentMode: 'fill' }),
        frame({ width: photoWidth, height: photoWidth }),
        offset({ y: -photoWidth * 0.1 }),
        frame({ width: photoWidth, height: Math.round(photoWidth * 0.52) }),
        clipped(),
      ]}
    />
  ) : (
    <Text modifiers={[font({ weight: 'bold', size: 14 }), foregroundStyle(INK), lineLimit(2)]}>{props.name}</Text>
  );

  if (small) {
    return (
      <HStack spacing={8} modifiers={[containerBackground(PAPER, 'widget'), widgetURL(props.url)]}>
        <VStack alignment="leading" spacing={2} modifiers={[fill]}>
          {miles}
          {status}
          <Spacer />
          {photo}
        </VStack>
        {ruler}
      </HStack>
    );
  }

  // Medium reads in the small widget's order: the miles and the status at the
  // top left, then the pair, named at the bottom left with its pace, its
  // photo beside the name.
  return (
    <HStack spacing={14} modifiers={[containerBackground(PAPER, 'widget'), widgetURL(props.url)]}>
      <VStack alignment="leading" spacing={2} modifiers={[fill]}>
        {miles}
        {status}
        <Spacer />
        <Text modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle(INK), lineLimit(1)]}>{props.name}</Text>
        {props.pace ? (
          <Text modifiers={[font({ size: 12 }), foregroundStyle(MUTED), lineLimit(1)]}>{props.pace}</Text>
        ) : null}
      </VStack>
      {props.image ? <VStack modifiers={[frame({ maxHeight: 10000, alignment: 'bottom' })]}>{photo}</VStack> : null}
      {ruler}
    </HStack>
  );
};

const NativeWidgets = requireOptionalNativeModule<{ widgetsDirectory: string | null }>('ExpoWidgets');

/**
 * Null in Expo Go, which does not include `expo-widgets`: there the app runs
 * and the widget calls do nothing, as on Android.
 */
const ShoeMileageWidget: Widget<ShoeMileageWidgetProps> | null = NativeWidgets
  ? (require('expo-widgets') as typeof import('expo-widgets')).createWidget<ShoeMileageWidgetProps>(
      'ShoeMileage',
      ShoeMileage
    )
  : null;

export function updateShoeMileageWidget(props: ShoeMileageWidgetProps): void {
  ShoeMileageWidget?.updateSnapshot(props);
}

const pending = new Set<string>();

/**
 * The shoe photo the widget can read: a file in the App Group, which the
 * widget extension can open and the app's own image cache is not.
 *
 * Returns the file's URL when it is already there. Otherwise it returns null
 * and starts the download; `onReady` runs once the file exists, so the caller
 * can publish again with the photo.
 */
export function shoeImageFile(key: string, url: string, onReady: () => void): string | null {
  const dir = NativeWidgets?.widgetsDirectory;
  if (!dir || !url) return null;
  const { Directory, File } = require('expo-file-system') as typeof import('expo-file-system');
  const file = new File(dir, `${key}.png`);
  if (file.exists) return file.uri;
  if (pending.has(key)) return null;
  pending.add(key);
  const folder = new Directory(dir);
  if (!folder.exists) folder.create({ intermediates: true });
  File.downloadFileAsync(url, file, { idempotent: true })
    .then(onReady, () => {})
    .finally(() => pending.delete(key));
  return null;
}
