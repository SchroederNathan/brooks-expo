import { Category } from '@/screens/category';

/**
 * The App Clip's first screen: New Arrivals. A link that names a product opens
 * the PDP above it, so the shopper can go back and browse.
 *
 * @ref LLP 0007#routes — A route of its own, not `category/[id]`, because the
 * root layout's `initialRouteName` names a screen and cannot pass its `id`.
 */
export default function NewArrivalsRoute() {
  return <Category id="featured-new-arrivals" title="New Arrivals" />;
}
