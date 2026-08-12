import { useLocalSearchParams } from 'expo-router';

import { ProductDetail } from '@/screens/product';

export default function ProductRoute() {
  const { id, color } = useLocalSearchParams<{ id: string; color?: string }>();
  return <ProductDetail id={String(id)} colorParam={color} />;
}
