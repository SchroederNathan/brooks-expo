/**
 * TurnTo review data captured from the real Brooks PDP controllers.
 *
 * @ref LLP 0002#turnto-reviews — The controllers share the storefront's
 * Akamai boundary, so reviews are harvested through a browser and bundled.
 */
import raw from '../../assets/reviews.json';
import type { ProductReviews, ReviewsSnapshot } from './types';

const snapshot = raw as unknown as ReviewsSnapshot;

export function reviewsFor(productId: string): ProductReviews | undefined {
  return snapshot.products[productId];
}
