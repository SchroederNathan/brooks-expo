import { useLocalSearchParams } from 'expo-router';

import { Category } from '@/screens/category';

export default function CategoryRoute() {
  const { id, title, franchise } = useLocalSearchParams<{
    id: string;
    title?: string;
    franchise?: string;
  }>();
  return <Category id={String(id)} title={title} franchise={franchise} />;
}
