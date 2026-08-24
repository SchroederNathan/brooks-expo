/**
 * Generates synthetic product copy from a product's own attributes.
 *
 * The harvested descriptions had to go entirely rather than be token-swapped.
 * They carry brand heritage ("first launched in 1976"), a named athlete, and
 * marketing prose — third-party facts and copyrighted text that survive any
 * amount of find-and-replace. Generating from `cushion` / `support` /
 * `experience` / `bestFor` yields copy that is accurate for the demo data and
 * owes nothing to anyone.
 *
 * Variation is keyed off the product id, so the same product always gets the
 * same sentence and the catalog is reproducible.
 */

function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Deterministic pick from a list, salted so different slots vary independently. */
function pick(list, id, salt) {
  return list[hash(`${id}:${salt}`) % list.length];
}

const GENDER = { womens: "women's", mens: "men's", unisex: 'unisex' };

const CUSHION = {
  Balanced: 'balanced cushioning',
  Responsive: 'responsive cushioning',
  Plush: 'plush cushioning',
};

const SUPPORT = {
  neutral: 'a neutral ride with no added guidance',
  flexible_support: 'light guidance that stays out of the way',
  balanced_support: 'even guidance through the midfoot',
  structured_support: 'structured guidance under the arch',
  max_support: 'maximum guidance for heavier miles',
};

const EXPERIENCE = {
  cushion: 'everyday cushioned miles',
  speed: 'faster efforts and race day',
  walking: 'all-day walking',
  light_trail: 'groomed trail and light gravel',
  mountain_trail: 'technical mountain terrain',
  speed_trail: 'quick trail efforts',
};

const SHOE_OPENERS = [
  (n, g) => `The ${n} is a ${g} running shoe`,
  (n, g) => `${n} is our ${g} shoe`,
  (n, g) => `Meet the ${n}, a ${g} running shoe`,
];

const APPAREL_OPENERS = [
  (n, g) => `The ${n} is a ${g} piece`,
  (n, g) => `${n} is ${g} kit`,
  (n, g) => `Reach for the ${n}, a ${g} layer`,
];

const CLOSERS = [
  'Sample data, generated for this demo.',
  'Demo catalog entry — no real product.',
  'Placeholder copy for demonstration only.',
];

/** Join a list as prose: a, b, and c. */
function list(items) {
  const v = items.filter(Boolean);
  if (v.length <= 1) return v[0] ?? '';
  if (v.length === 2) return `${v[0]} and ${v[1]}`;
  return `${v.slice(0, -1).join(', ')}, and ${v[v.length - 1]}`;
}

function lower(s) {
  return String(s).charAt(0).toLowerCase() + String(s).slice(1);
}

/**
 * One product description. Deliberately signs itself as demo data in the last
 * sentence: an App Review reader should not have to guess whether the catalog
 * is claiming to describe real merchandise.
 */
function describe(p) {
  const id = p.id;
  const gender = GENDER[p.gender] ?? 'unisex';
  const uses = (p.bestFor ?? []).slice(0, 3).map(lower);
  const isShoe = p.productType === 'Shoes';

  const opener = pick(isShoe ? SHOE_OPENERS : APPAREL_OPENERS, id, 'open')(p.name, gender);

  const parts = [];
  if (isShoe) {
    const cushion = CUSHION[p.cushion];
    const experience = EXPERIENCE[p.experience];
    parts.push(`${opener}${cushion ? ` with ${cushion}` : ''}${experience ? `, built for ${experience}` : ''}.`);
    const support = SUPPORT[p.support];
    if (support) parts.push(`It offers ${support}.`);
  } else {
    parts.push(`${opener}${uses.length ? ` for ${list(uses)}` : ''}.`);
  }

  if (isShoe && uses.length) parts.push(`Good for ${list(uses)}.`);
  if (!isShoe && (p.features ?? []).length) {
    parts.push(`Details include ${list((p.features ?? []).slice(0, 3).map(lower))}.`);
  }

  parts.push(pick(CLOSERS, id, 'close'));
  return parts.join(' ');
}

module.exports = { describe, hash, pick };
