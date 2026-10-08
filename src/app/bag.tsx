import { Cart } from '@/screens/cart';

/**
 * The App Clip's bag. The app's bag is a tab; the Clip has no tabs, so the PDP
 * pushes this screen instead. @ref LLP 0007#routes
 */
export default function BagRoute() {
  return <Cart />;
}
