import { useLocalSearchParams } from 'expo-router';

import { AddShoeSheet } from '@/screens/shoes/add-sheet';

export default function AddShoeRoute() {
  const { productId, color } = useLocalSearchParams<{ productId?: string; color?: string }>();
  return <AddShoeSheet productId={productId} colorCode={color} />;
}
