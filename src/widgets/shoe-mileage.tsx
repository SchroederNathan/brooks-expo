import type { ShoeMileageWidgetProps } from './shoe-mileage.types';

/**
 * Android and web have no widget. The iOS file (`shoe-mileage.ios.tsx`)
 * defines it; this one keeps `@expo/ui/swift-ui` out of the other bundles.
 *
 * `.tsx`, not `.ts`, on purpose: Metro tries each extension in turn and
 * platform suffixes within it, so a `shoe-mileage.ts` would win over
 * `shoe-mileage.ios.tsx` and iOS would get this empty function.
 */
export function updateShoeMileageWidget(_props: ShoeMileageWidgetProps): void {}

/** No widget, so no photo for it. */
export function shoeImageFile(_key: string, _url: string, _onReady: () => void): string | null {
  return null;
}
