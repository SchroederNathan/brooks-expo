import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { startOfDay } from '@/data/mileage';
import { spacing } from '@/theme';

const DAY_MS = 24 * 60 * 60 * 1000;

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: '2 weeks ago', days: 14 },
  { label: '1 month ago', days: 30 },
  { label: '2 months ago', days: 61 },
  { label: '3 months ago', days: 91 },
  { label: '6 months ago', days: 182 },
];

/**
 * The start date as presets. The iOS file uses the system date picker; this
 * one serves Android and web, where a pair's mileage comes from the miles
 * entered, so a rough start date is enough.
 */
export function StartDateField({ value, onChange }: { value: number; onChange: (day: number) => void }) {
  const today = startOfDay(Date.now());
  return (
    <View style={styles.row}>
      {PRESETS.map((p) => {
        const day = startOfDay(today - p.days * DAY_MS);
        return (
          <Chip key={p.label} label={p.label} size="sm" selected={value === day} onPress={() => onChange(day)} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
