import { Stack } from 'expo-router/stack';

import { colors, font } from '@/theme';

/**
 * Search lives in its own stack because it is the one tab that uses a native
 * header: the search field is `Stack.SearchBar`, which only renders as part
 * of a native-stack header and integrates with the tab bar's search role.
 */
export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontFamily: font.bold, color: colors.ink },
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="search" options={{ title: 'Search' }} />
    </Stack>
  );
}
