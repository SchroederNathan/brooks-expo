import { View, ViewProps } from 'react-native';

import { colors } from '../theme';

export function Divider({ style }: { style?: ViewProps['style'] }) {
  return <View style={[{ height: 1, backgroundColor: colors.hairline }, style]} />;
}
