import { DatePicker, Host } from '@expo/ui/swift-ui';
import { tint } from '@expo/ui/swift-ui/modifiers';

import { startOfDay } from '@/data/mileage';
import { colors } from '@/theme';

/**
 * The start date as the system's compact date picker: a date-shaped button
 * that opens the calendar. No future dates: a pair cannot have started yet.
 */
export function StartDateField({ value, onChange }: { value: number; onChange: (day: number) => void }) {
  return (
    <Host matchContents>
      <DatePicker
        title="Started running in them"
        selection={new Date(value)}
        range={{ end: new Date() }}
        displayedComponents={['date']}
        onDateChange={(date) => onChange(startOfDay(date.getTime()))}
        modifiers={[tint(colors.blue)]}
      />
    </Host>
  );
}
