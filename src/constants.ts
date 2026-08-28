/**
 * Brooks Run Club — the membership framing used on Account and Login.
 *
 * @ref LLP 0003#login — Every line is what Brooks itself says an account
 * gives you, taken from the support article "Why should I create a Brooks Run
 * Club account?" (support.brooksrunning.com, article 360016635851) and the
 * account-login page description. Nothing here is invented: the list used to
 * promise "Fun games and prizes" and "Early access to new shoes and sales",
 * which Brooks does not state. Order the list by what a shopper in the app
 * can act on first.
 */
export const RUN_CLUB_PERKS = [
  'Order history in one place, so a return is easy to start',
  'Saved addresses and payment methods',
  'Free standard shipping on every order',
  'Free express shipping on orders of $160 or more',
  'A gift with purchase during your birthday month',
  'Member-exclusive promotions and games',
] as const;
