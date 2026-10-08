import { type NativeModule, requireOptionalNativeModule } from 'expo';

declare class BrooksAppClipModule extends NativeModule<{}> {
  /** True in the App Clip binary, false in the full app. */
  readonly isAppClip: boolean;
  /**
   * Shows the App Store overlay that installs the full app. Does nothing
   * outside the App Clip.
   */
  promptFullAppAsync(): Promise<void>;
}

/**
 * Null where the module is not linked: Android, web, and Expo Go. None of them
 * can be an App Clip, so callers read null as "the full app".
 */
export default requireOptionalNativeModule<BrooksAppClipModule>('BrooksAppClip');
