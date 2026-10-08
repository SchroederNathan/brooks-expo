/**
 * Gives the App Clip and the widget the app's version and build number.
 *
 * @ref LLP 0007#build-numbers — EAS writes the build number into each
 * target's Info.plist file after prebuild. The Clip and the widget generate
 * their Info.plist (`GENERATE_INFOPLIST_FILE`), so Xcode takes their
 * `CFBundleVersion` from `CURRENT_PROJECT_VERSION` instead. That is 1 for the
 * widget always, and for the Clip unless EAS knew the number when the build
 * started (`EAS_BUILD_IOS_BUILD_NUMBER`, which @bacons/apple-targets reads).
 * Workflow builds increment the number on the build machine, after that
 * point, and Xcode refuses an App Clip whose build number differs from the
 * app's. So at build time each embedded target copies both versions from the
 * app's Info.plist file into its own processed Info.plist.
 *
 * A finalized mod, so it runs after @bacons/apple-targets, which adds the
 * Clip in a custom mod that runs after the regular Xcode project mod.
 */
const { IOSConfig, withFinalizedMod } = require('expo/config-plugins');
const fs = require('fs');

const PHASE_NAME = 'Match the app version';

const EMBEDDED_PRODUCT_TYPES = new Set([
  '"com.apple.product-type.app-extension"',
  '"com.apple.product-type.application.on-demand-install-capable"',
]);

/** @param {string} appInfoPlist The app's Info.plist, relative to `ios/`. */
function script(appInfoPlist) {
  return [
    // Fail the build rather than write an empty version.
    'set -e',
    `APP_PLIST="$SRCROOT/${appInfoPlist}"`,
    'PLIST="$TARGET_BUILD_DIR/$INFOPLIST_PATH"',
    'for KEY in CFBundleVersion CFBundleShortVersionString; do',
    '  VALUE=$(/usr/libexec/PlistBuddy -c "Print :$KEY" "$APP_PLIST")',
    '  /usr/libexec/PlistBuddy -c "Set :$KEY $VALUE" "$PLIST"',
    'done',
  ].join('\\n');
}

function releaseSetting(project, target, key) {
  const list = project.pbxXCConfigurationList()[target.buildConfigurationList];
  const configs = project.pbxXCBuildConfigurationSection();
  const release = list.buildConfigurations.map((c) => configs[c.value]).find((c) => c.name === 'Release');
  return release?.buildSettings[key];
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = function withTargetVersions(config) {
  return withFinalizedMod(config, [
    'ios',
    (config) => {
      const project = IOSConfig.XcodeUtils.getPbxproj(config.modRequest.projectRoot);
      const appName = IOSConfig.XcodeUtils.getProjectName(config.modRequest.projectRoot);
      const targets = Object.entries(project.pbxNativeTargetSection()).filter(
        ([key]) => !key.endsWith('_comment')
      );

      const app = targets.find(([, target]) => target.name === appName)?.[1];
      const appInfoPlist = app && releaseSetting(project, app, 'INFOPLIST_FILE')?.replace(/^"|"$/g, '');
      if (!appInfoPlist) throw new Error(`with-target-versions: no Info.plist for target ${appName}`);

      const phases = project.hash.project.objects.PBXShellScriptBuildPhase ?? {};
      for (const [uuid, target] of targets) {
        if (!EMBEDDED_PRODUCT_TYPES.has(target.productType)) continue;
        // A prebuild without --clean runs the plugins on the existing project.
        const added = target.buildPhases.some((phase) => phases[phase.value]?.name === `"${PHASE_NAME}"`);
        if (added) continue;
        const { buildPhase } = project.addBuildPhase([], 'PBXShellScriptBuildPhase', PHASE_NAME, uuid, {
          shellPath: '/bin/sh',
          shellScript: script(appInfoPlist),
          // The processed Info.plist as an input orders this phase after
          // Xcode writes it.
          inputPaths: [`"$(SRCROOT)/${appInfoPlist}"`, '"$(TARGET_BUILD_DIR)/$(INFOPLIST_PATH)"'],
        });
        // It edits a file another task produces, so it declares no outputs;
        // this tells Xcode that running on every build is intended.
        buildPhase.alwaysOutOfDate = 1;
      }

      fs.writeFileSync(project.filepath, project.writeSync());
      return config;
    },
  ]);
};
