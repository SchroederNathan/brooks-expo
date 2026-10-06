/**
 * Brooks Run Club — the membership perks used on Account and Login.
 *
 * @ref LLP 0003#login — Every line is a member perk that brooksrunning.com
 * states, read from the live site on 2026-10-05: the sign-up page's
 * "Membership benefits include" list (free shipping, annual birthday gift,
 * early access to shoes & sales, fun games and prizes), the Brooks Run Club
 * page's 20% apparel welcome offer, and the Shipping page's member column
 * (standard free, express free over $160). Order history and saved addresses
 * are account features, not perks, and returns are free for every customer
 * (Run Happy Promise), so neither is listed as a perk.
 */
export const RUN_CLUB_PERKS = [
  'Free standard shipping on every order',
  'Free express shipping on orders over $160',
  'An annual birthday gift',
  'Early access to shoes and sales',
  'Fun games and prizes',
  '20% off one full-price apparel item when you join',
] as const;
