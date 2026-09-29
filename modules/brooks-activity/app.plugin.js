/**
 * Config plugin for the local brooks-activity module.
 *
 * @ref LLP 0005#read-only-by-default — Adds the HealthKit entitlement and the
 * read-access usage string, and nothing else: no background delivery and no
 * write access. `sampleData: true` adds the write-access string so that a
 * development build can seed a simulator; production builds leave it off.
 */
const { withEntitlementsPlist, withInfoPlist } = require('expo/config-plugins');

const SHARE_DESCRIPTION =
  'The Shoe Finder reads your recent runs, walks, hikes and steps to answer some of its questions for you. Your data stays on this device.';
const UPDATE_DESCRIPTION =
  'Development builds write sample workouts so the Shoe Finder can be tested on a simulator.';

/** @type {import('expo/config-plugins').ConfigPlugin<{ sampleData?: boolean } | void>} */
module.exports = function withBrooksActivity(config, props) {
  const sampleData = !!props?.sampleData;

  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.healthkit'] = true;
    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.NSHealthShareUsageDescription = SHARE_DESCRIPTION;
    if (sampleData) config.modResults.NSHealthUpdateUsageDescription = UPDATE_DESCRIPTION;
    else delete config.modResults.NSHealthUpdateUsageDescription;
    return config;
  });

  return config;
};
