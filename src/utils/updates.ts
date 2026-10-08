import { requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';
import type * as ExpoUpdates from 'expo-updates';
import { useState } from 'react';

import { colors } from '@/theme';

/**
 * Null in the App Clip, which is built without `expo-updates`: the package
 * throws on import when its native module is missing.
 * @ref LLP 0007#what-the-clip-leaves-out
 */
const Updates: typeof ExpoUpdates | null = requireOptionalNativeModule('ExpoUpdates')
  ? (require('expo-updates') as typeof ExpoUpdates)
  : null;

/**
 * Dev clients and Expo Go load JS from Metro, so there is nothing for EAS
 * Update to swap in. Only store and internal builds check.
 */
const updatesEnabled = !!Updates?.isEnabled && !__DEV__;

/**
 * Manual EAS Update check for the Account screen. The native side already
 * checks on launch; this lets a tester pull the newest update on the build's
 * channel without cold-starting the app. A found update downloads straight
 * away, then the same row offers the restart.
 */
export const useUpdateCheck = Updates ? () => useLiveUpdateCheck(Updates) : useNoUpdateCheck;

/** The row in a binary without `expo-updates`: shown, but it does nothing. */
function useNoUpdateCheck() {
  return { label: 'Check for updates', detail: 'Off in this build', onPress: undefined };
}

function useLiveUpdateCheck(Updates: typeof ExpoUpdates) {
  const { isChecking, isDownloading, isUpdatePending, currentlyRunning } = Updates.useUpdates();
  const [status, setStatus] = useState<string | null>(null);
  const busy = isChecking || isDownloading;

  const check = async () => {
    setStatus(null);
    try {
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        setStatus('You’re on the latest version');
        return;
      }
      const fetched = await Updates.fetchUpdateAsync();
      if (!fetched.isNew && !fetched.isRollBackToEmbedded) setStatus('You’re on the latest version');
    } catch {
      setStatus('Couldn’t check for updates');
    }
  };

  const restart = async () => {
    try {
      await Updates.reloadAsync({
        reloadScreenOptions: { backgroundColor: colors.surface, spinner: { color: colors.blue } },
      });
    } catch {
      setStatus('Close and reopen the app to update');
    }
  };

  const detail = !updatesEnabled
    ? 'Off in development builds'
    : isChecking
      ? 'Checking…'
      : isDownloading
        ? 'Downloading…'
        : isUpdatePending
          ? 'Tap to restart and update'
          : (status ?? versionLabel(currentlyRunning));

  return {
    label: isUpdatePending ? 'Update ready' : 'Check for updates',
    detail,
    onPress: !updatesEnabled || busy ? undefined : () => void (isUpdatePending ? restart() : check()),
  };
}

/** "Version 1.0.0 · Update from Sep 30, 2026". */
function versionLabel(running: ExpoUpdates.CurrentlyRunningInfo) {
  const version = Constants.expoConfig?.version;
  const update =
    !running.isEmbeddedLaunch && running.createdAt
      ? `Update from ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(running.createdAt)}`
      : null;
  return [version && `Version ${version}`, update].filter(Boolean).join(' · ');
}
