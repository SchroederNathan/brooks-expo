import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { Press } from './press';
import { Txt } from './themed-text';

export function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
  onDark,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
  onDark?: boolean;
}) {
  const fg = onDark ? colors.surface : colors.ink;
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Txt
            variant="eyebrow"
            c={onDark ? colors.lime : colors.inkMuted}
            style={{ marginBottom: 6 }}
          >
            {eyebrow}
          </Txt>
        ) : null}
        <Txt variant="h2" c={fg}>
          {title}
        </Txt>
      </View>
      {action ? (
        <Press onPress={onAction} scaleTo={0.95} style={styles.sectionAction}>
          <Txt variant="eyebrow" c={fg} style={{ fontSize: 11 }}>
            {action}
          </Txt>
          <View style={[styles.underline, { backgroundColor: fg }]} />
        </Press>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionAction: { paddingVertical: 4, gap: 3 },
  underline: { height: 3, width: '100%' },
});
