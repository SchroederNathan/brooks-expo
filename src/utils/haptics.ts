import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * The tab bar's selection tick — the app's only haptic.
 *
 * [observed 2026-08-26] Everything else that used to buzz (every `Press`, every
 * chip, every `Button`, the add-to-bag and quiz-complete notifications) has been
 * removed. A tap that opens a screen already has the transition to confirm it;
 * a second, physical confirmation on top of that reads as noise, and firing one
 * on *every* press spends the signal until it means nothing. Switching tabs is
 * the exception: it is the one move with no animation of its own to feel.
 *
 * Haptics throw on web in some browsers; make it a no-op there.
 */
export function select() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}
