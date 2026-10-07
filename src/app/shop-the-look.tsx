import { useLocalSearchParams } from 'expo-router';

import { ShopTheLookSheet } from '@/screens/product/shop-the-look-sheet';

export default function ShopTheLookRoute() {
  const { id, color, size, width } = useLocalSearchParams<{
    id: string;
    color?: string;
    size?: string;
    width?: string;
  }>();
  return <ShopTheLookSheet id={String(id)} color={color} size={size} width={width} />;
}
