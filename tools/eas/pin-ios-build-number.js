/**
 * Writes the EAS remote iOS build number into app.json.
 *
 * Only the `repack` job needs this. A full `build` job under
 * `appVersionSource: remote` has EAS write the remote number into the native
 * project it generates. `repack` has no native project — it regenerates
 * Info.plist from the app config — so whatever `expo.ios.buildNumber` says at
 * that moment becomes CFBundleVersion, and an absent value becomes the Expo
 * default of 1.
 *
 * EAS still consumes a remote increment for a repack, and the build record
 * already carries that number before this hook runs. So the number to write is
 * not derived or guessed: it is read back from EAS with `build:version:get`.
 * An earlier version of this hook used `SOURCE_BUILD_NUMBER + 1`, which is the
 * number after the *source* build rather than after the last build of any kind.
 * The source build is pinned by fingerprint, so that expression returned the
 * same already-uploaded number on every run.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APP_JSON = path.resolve(__dirname, '..', '..', 'app.json');

function readRemoteBuildNumber() {
  const stdout = execFileSync(
    'npx',
    [
      '--yes',
      'eas-cli@latest',
      'build:version:get',
      '--platform',
      'ios',
      '--profile',
      'production',
      '--json',
      '--non-interactive',
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
  );

  const { buildNumber } = JSON.parse(stdout);
  if (!/^\d+$/.test(String(buildNumber))) {
    throw new Error(`eas build:version:get returned no usable buildNumber: ${stdout}`);
  }
  return Number(buildNumber);
}

function main() {
  const remote = readRemoteBuildNumber();

  // The remote counter advances for every EAS build, including the source
  // build being repacked. If it has not passed the source, the counter is not
  // the authority it is assumed to be here, and shipping the value would
  // reuse a number App Store Connect has already seen.
  const source = Number(process.env.SOURCE_BUILD_NUMBER);
  if (Number.isFinite(source) && remote <= source) {
    throw new Error(
      `Remote build number ${remote} does not exceed the source build number ${source}.`
    );
  }

  const config = JSON.parse(fs.readFileSync(APP_JSON, 'utf8'));
  config.expo.ios.buildNumber = String(remote);
  fs.writeFileSync(APP_JSON, `${JSON.stringify(config, null, 2)}\n`);

  console.log(`Repacking build ${source || 'unknown'} as build number ${remote}`);
}

main();
