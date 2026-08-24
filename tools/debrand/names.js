/**
 * The synthetic vocabulary the de-branded catalog is built from.
 *
 * Every Brooks-owned string that reaches the screen is replaced from here.
 * The mappings are deliberately data, not logic: a reviewer (human or Apple's)
 * can read this one file and see exactly what was swapped for what.
 *
 * The invented names were checked informally against known running-shoe model
 * names. They are not trademark-cleared — this catalog exists to demo an app,
 * not to sell shoes. Scan the list before shipping if that changes.
 */

/**
 * Brooks franchise -> synthetic family. Covers every `franchise` value in the
 * harvested catalog, including the generic-looking ones (Dash, Run, High). We
 * rename all 54 rather than judging which are trademarks, so the output has no
 * "did we miss one?" surface.
 */
const FRANCHISE = {
  Ghost: 'Halcyon',
  Dash: 'Streamline',
  Cascadia: 'Ridgewalk',
  Glycerin: 'Softfall',
  Hyperion: 'Quickstep',
  Luxe: 'Velour',
  Movement: 'Motionwear',
  Adrenaline: 'Steadyline',
  Chaser: 'Pursuit',
  Addiction: 'Mainstay',
  Canopy: 'Shelter',
  High: 'Highrise',
  Run: 'Roadwear',
  Journey: 'Wayfare',
  PR: 'Record',
  Pro: 'Proline',
  Revel: 'Everyday',
  'Run-In': 'Warmup',
  The: 'Signature',
  Graphic: 'Printwear',
  Momentum: 'Carryover',
  Notch: 'Groove',
  Shield: 'Weatherguard',
  Anthem: 'Chorus',
  Chariot: 'Wagonette',
  Defyance: 'Bulwark',
  Distance: 'Longhaul',
  Draft: 'Slipstream',
  Kraken: 'Deepwater',
  Launch: 'Liftoff',
  Source: 'Wellspring',
  Spark: 'Kindle',
  Sprint: 'Quickfire',
  STAPLE: 'BASIC',
  Trace: 'Outline',
  Activate: 'Warmwear',
  Ariel: 'Skyward',
  Beast: 'Bruteforce',
  Brooks: 'Demoware',
  Catamount: 'Highpoint',
  Convertible: 'Twoway',
  Crossback: 'Crosstie',
  ELMN8: 'FCTR9',
  Fusion: 'Blendline',
  Heritage: 'Legacywear',
  Lightweight: 'Featherweight',
  Limitless: 'Openended',
  Propel: 'Forward',
  PYNRS: 'CRWNS',
  'QW-K': 'RP-T',
  Racerback: 'Racertie',
  Scoopback: 'Scooptie',
  Underwire: 'Underband',
  Wire: 'Bandline',
};

/**
 * Brooks material and technology marks, longest-first so `DNA LOFT` is consumed
 * before the bare `DNA` rule can strand the word `LOFT`. The replacements are
 * plain descriptions of the same thing, which keeps the product copy readable
 * instead of leaving holes in it.
 */
const MARKS = [
  [/GO₂\s*Warmᵀᴹ|GO₂\s*Warm(?:™)?/g, 'ThermalKnit'],
  [/GO₂/g, 'ThermalKnit'],
  [/BioMoGo\s+DNA/g, 'CoreFoam'],
  [/DNA\s+LOFT\s*v?\d*/g, 'SoftFoam'],
  [/DNA\s+AMP/g, 'SpringFoam'],
  [/DNA\s+FLASH/g, 'LightFoam'],
  [/GuideRails(?:™|®)?/g, 'GuidedSupport'],
  [/SpeedVault(?:™|®)?/g, 'PropulsionPlate'],
  [/RoadTack(?:™|®)?/g, 'RoadRubber'],
  [/TrailTack(?:™|®)?/g, 'TrailRubber'],
  [/3D\s+Fit\s+Print/g, 'PrintedOverlay'],
  [/DriLayer(?:™|®)?/g, 'DryKnit'],
  [/Run\s+Signature/g, 'gait design'],
  [/\bDNA\b/g, 'CoreFoam'],
  // Trailing model suffix. Brooks means "Go To Shoe"; the demo has no such
  // program, so the initialism is dropped rather than given a fake expansion.
  [/\s+GTS\b/g, ''],
];

/**
 * Colour words -> hex. Only the families the swatch renderer needs a real
 * value for; anything unlisted is hashed to a stable hue instead (see
 * `swatch.js`), so this list never has to chase 330 marketing colour names.
 */
const COLOR_WORDS = {
  black: '#151515',
  ebony: '#2B2A28',
  onyx: '#1C1C1E',
  phantom: '#39393D',
  asphalt: '#4A4A4D',
  slate: '#54606E',
  charcoal: '#36393D',
  grey: '#9A9A9A',
  gray: '#9A9A9A',
  silver: '#C4C6C8',
  alloy: '#A8ADB2',
  chrome: '#D3D6D9',
  pearl: '#E6E3DC',
  white: '#FFFFFF',
  blanc: '#FBFBF9',
  ivory: '#F4EFE3',
  coconut: '#F2EADF',
  ecru: '#E4D9C6',
  bone: '#E8E2D5',
  sand: '#DCC9A8',
  wheat: '#E0CDA4',
  tan: '#C7A87C',
  taupe: '#A99885',
  almond: '#D8BFA3',
  biscuit: '#D6BC97',
  brown: '#6B4B34',
  coffee: '#4B3A2F',
  bronze: '#8A6A3E',
  gold: '#C9A227',
  amber: '#D69A22',
  yellow: '#F2D71E',
  lemon: '#F5E45C',
  citron: '#D6D93B',
  lime: '#C8E01B',
  limeade: '#B7DE2A',
  green: '#2F8F44',
  emerald: '#0F9D66',
  forest: '#2A4F3A',
  olive: '#71743F',
  spruce: '#33544A',
  mint: '#9FE0C4',
  teal: '#1F8A8A',
  aqua: '#5FD0D6',
  turquoise: '#2CC0C6',
  cyan: '#38C7E8',
  blue: '#2C6FD1',
  cobalt: '#2450C8',
  indigo: '#3B3F98',
  navy: '#1D2B50',
  midnight: '#1A2238',
  royal: '#2A4BC0',
  sky: '#7FBCE8',
  ice: '#DCEAF2',
  violet: '#7A55C6',
  purple: '#6E44A8',
  lavender: '#C3AEE0',
  orchid: '#C079C6',
  magenta: '#C6318F',
  fuchsia: '#D63B96',
  pink: '#F090B4',
  rose: '#DE8296',
  coral: '#F4785F',
  peach: '#F6B294',
  apricot: '#F2A45C',
  orange: '#F0742A',
  flame: '#E4552B',
  red: '#D3352A',
  burgundy: '#77202C',
  port: '#5C2030',
  beet: '#7A2140',
  grape: '#5B3466',
  raisin: '#4A3340',
  clear: '#EFEFEF',
  gum: '#C8A882',
  metallic: '#B9BDC2',
  stone: '#B5B0A6',
  gravel: '#8E8C86',
  mist: '#D5DBDE',
  storm: '#6E7680',
  smoke: '#8B8B8B',
  dove: '#CFCBC4',
  driftwood: '#A2917C',
};

/** Words that only modify a colour and must not become the swatch's name. */
const MODIFIERS = new Set([
  'heather', 'dark', 'dk', 'light', 'lt', 'bright', 'deep', 'pale', 'dusty',
  'neo', 'metallic', 'star', 'bleached', 'washed', 'rain', 'sonic', 'cyber',
  'atomic', 'blazing', 'shocking', 'potent', 'ultimate', 'primer', 'heathered',
]);


/**
 * Model-level marks that show up inside a product name without ever being the
 * `franchise` value — collab names ("Kraken x Ghost 17") carry a second
 * franchise, and some models are their own mark. Renaming the franchise field
 * alone leaves these behind, so they get a global pass.
 */
const MODELS = {
  Vanguard: 'Frontrunner',
  Divide: 'Fork',
  Caldera: 'Basin',
  Bedlam: 'Uproar',
  Ricochet: 'Rebound',
  Transcend: 'Rise',
  Dyad: 'Pairline',
  Levitate: 'Buoy',
  Aurora: 'Daybreak',
  Nightlife: 'Afterdark',
};

/**
 * Franchise names safe to replace anywhere in free text, not just in the
 * `franchise` field. The excluded ones are ordinary English words — "The",
 * "Run", "High", "Pro", "Distance" — and a global `\bThe\b` rewrite would
 * shred every sentence in the catalog. Ordinary words also carry no brand
 * association on their own, so leaving them is correct, not a compromise.
 */
const DISTINCTIVE = [
  'Adrenaline', 'Addiction', 'Anthem', 'Ariel', 'Beast', 'Canopy', 'Cascadia',
  'Catamount', 'Chariot', 'Chaser', 'Defyance', 'ELMN8', 'Ghost', 'Glycerin',
  'Hyperion', 'Kraken', 'Launch', 'Luxe', 'Notch', 'PYNRS', 'Propel', 'Revel',
  'Trace',
];

/**
 * [regex, replacement] pairs for the global pass, longest token first so
 * "Hyperion Max" cannot be half-rewritten by a shorter rule.
 */
const GLOBAL_RENAMES = Object.entries({
  ...MODELS,
  ...Object.fromEntries(DISTINCTIVE.map((k) => [k, FRANCHISE[k]]).filter(([, v]) => v)),
})
  .sort((a, b) => b[0].length - a[0].length)
  .map(([from, to]) => [
    new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}\\b`, 'g'),
    to,
  ]);

module.exports = { FRANCHISE, MARKS, MODELS, DISTINCTIVE, GLOBAL_RENAMES, COLOR_WORDS, MODIFIERS };
