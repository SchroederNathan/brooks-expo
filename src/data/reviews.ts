/**
 * Generated product reviews, bundled with the app.
 *
 * The real harvested reviews were written by named members of the public, so
 * they were replaced wholesale — see `tools/debrand/reviews.js`. Ratings and
 * fit-dimension averages are kept; titles, bodies, and authors are synthetic.
 */
import raw from '../../assets/reviews.json';
import type { ProductReviews, ReviewsSnapshot } from './types';

const snapshot = raw as unknown as ReviewsSnapshot;

export function reviewsFor(productId: string): ProductReviews | undefined {
  return snapshot.products[productId];
}
