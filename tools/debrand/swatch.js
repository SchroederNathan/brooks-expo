/**
 * Turns a Brooks colourway name into locally-rendered swatch colours.
 *
 * The de-branded app cannot fetch product photography, so a colourway becomes
 * the thing a colourway actually describes: its colours. Every hex here is
 * derived, never fetched, so the app has no image dependency at all.
 *
 * Two rules, in order:
 *  1. A recognised colour word uses its real hex, so "Black/White" looks like
 *     black and white rather than like two arbitrary hues.
 *  2. Anything else (the ~250 marketing names — "Spellbound", "Nightlife",
 *     "Euphoryc Halogen") is hashed to a stable hue. Hashing rather than
 *     mapping means the output is deterministic and complete without anyone
 *     curating a 330-entry table, and re-harvesting cannot introduce a gap.
 */

const { COLOR_WORDS, MODIFIERS } = require('./names.js');

/** FNV-1a. Small, stable across Node versions, and good enough to spread hues. */
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(Math.min(k - 3, 9 - k), 1));
    return Math.round(255 * v)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Hashed fallback. Saturation and lightness are held in a mid band so a
 * hashed colour never comes out as mud or as neon next to a real one.
 */
function hashedHex(token) {
  const h = hash(token.toLowerCase());
  const hue = h % 360;
  const sat = 0.32 + ((h >>> 9) % 28) / 100;
  const light = 0.38 + ((h >>> 17) % 26) / 100;
  return hslToHex(hue, sat, light);
}

/** The colour family a token belongs to, ignoring modifiers like "Heather". */
function familyOf(token) {
  const words = token
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !MODIFIERS.has(w));
  for (const w of words) {
    if (COLOR_WORDS[w]) return w;
  }
  return null;
}

function hexOf(token) {
  const fam = familyOf(token);
  return fam ? COLOR_WORDS[fam] : hashedHex(token);
}

/** Title-case a family word for display: "grey" -> "Grey". */
function label(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Name a hashed colour by the nearest listed family, so an invented hue still
 * gets an honest label instead of leaking "Spellbound" into the UI.
 */
function nearestFamily(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  let best = null;
  let bestD = Infinity;
  for (const [word, h] of Object.entries(COLOR_WORDS)) {
    const [r2, g2, b2] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bestD) {
      bestD = d;
      best = word;
    }
  }
  return best;
}

/**
 * The full swatch for one colourway.
 *
 * Returns up to three stops and a regenerated name. The name is rebuilt from
 * the stops rather than edited, which guarantees the label always matches what
 * is drawn and that no Brooks colour name survives the transform.
 */
function swatchFor(colorwayName, code) {
  const tokens = String(colorwayName || '')
    .split(/[/&]/)
    .map((t) => t.trim())
    .filter(Boolean);

  const source = tokens.length ? tokens : [String(code || 'default')];
  const stops = [];
  const names = [];

  for (const token of source.slice(0, 3)) {
    const hex = hexOf(token);
    if (stops.includes(hex)) continue;
    stops.push(hex);
    names.push(label(familyOf(token) ?? nearestFamily(hex)));
  }

  if (!stops.length) {
    const hex = hashedHex(String(code || 'default'));
    stops.push(hex);
    names.push(label(nearestFamily(hex)));
  }

  return { stops, name: names.join('/') };
}

module.exports = { swatchFor, hashedHex, nearestFamily };
