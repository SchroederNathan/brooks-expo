import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Divider } from '@/components/divider';
import { BrooksIcon } from '@/components/icons';
import { Press } from '@/components/press';
import { Stars } from '@/components/stars';
import { Txt } from '@/components/themed-text';
import { GENDER_LABEL } from '@/data/labels';
import {
  applySearchFilters,
  COLOUR_FAMILIES,
  countSearchFilters,
  EMPTY_SEARCH_FILTERS,
  featureFacets,
  SEARCH_SORTS,
  type SearchFilters,
  type SearchSort,
} from '@/data/search-query';
import { getSearchFilterState, patchSearchFilterState, useSearchFilterState } from '@/store/search-filters';
import { border, colors, radius, spacing } from '@/theme';

/**
 * `Filter & sort` for search results, presented as a native form sheet.
 *
 * @ref LLP 0003#browse-is-the-search-screen — A port of the panel
 * brooksrunning.com opens from its PLP's `Filter & sort` button: a title with a
 * close cross, `SORT BY:` as a radio list, then collapsible `COLOUR` (swatch
 * grid, two columns), `RATING` (radio with stars, "4 and up"), and `FEATURES`
 * (checkboxes), with `Clear all` and `Apply` side by side at the foot. Gender
 * is added because search spans the whole catalog, where the site's panel sat
 * under an already-gendered listing.
 *
 * Draft state is local; Apply writes the store, so a dismissed sheet changes
 * nothing. The sheet is a route (`/search-filters`) rather than a child of
 * Browse because a native form sheet is presented by the root stack.
 */

const RATINGS = [
  { value: 5, label: '5' },
  { value: 4, label: '4 and up' },
  { value: 3, label: '3 and up' },
];

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export function SearchFilterSheet() {
  const insets = useSafeAreaInsets();
  const { candidates } = useSearchFilterState();
  const [draft, setDraft] = useState<SearchFilters>(() => getSearchFilterState().filters);
  const [draftSort, setDraftSort] = useState<SearchSort>(() => getSearchFilterState().sort);

  const features = useMemo(() => featureFacets(candidates), [candidates]);
  const genders = useMemo(
    () => [...new Set(candidates.map((p) => p.gender).filter((g): g is NonNullable<typeof g> => g != null))],
    [candidates]
  );
  const liveCount = useMemo(() => applySearchFilters(candidates, draft).length, [candidates, draft]);
  const nDraft = countSearchFilters(draft);

  const set = (patch: Partial<SearchFilters>) => setDraft((d) => ({ ...d, ...patch }));

  const apply = () => {
    patchSearchFilterState({ filters: draft, sort: draftSort });
    router.back();
  };

  // `collapsable={false}` on the root: React Native would otherwise flatten it
  // away and hand react-native-screens' form sheet eight children, which it
  // warns about and lays out wrongly.
  return (
    <View collapsable={false} style={styles.root}>
      <View style={styles.head}>
        <Txt variant="h2">Filter & sort</Txt>
        <Press accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={() => router.back()}>
          <BrooksIcon name="closeThin" size={22} color={colors.ink} />
        </Press>
      </View>

      {/* The scroll view sits inside a plain view on purpose, and nothing here
          carries a zIndex: react-native-screens walks first subviews looking
          for a scroll view to size to the whole sheet, and this layout — head,
          list, foot — must not be found by it. */}
      <View collapsable={false} style={styles.scroll}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Txt variant="eyebrow" c={colors.inkMuted} style={styles.sortLabel}>
          Sort by:
        </Txt>
        {SEARCH_SORTS.map((o) => (
          <Radio key={o.key} selected={draftSort === o.key} onPress={() => setDraftSort(o.key)}>
            <Txt variant="body">{o.label}</Txt>
          </Radio>
        ))}

        <Section title="Colour">
          <View style={styles.swatchGrid}>
            {COLOUR_FAMILIES.map((c) => {
              const selected = draft.colours.includes(c.key);
              return (
                <Press
                  key={c.key}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() => set({ colours: toggle(draft.colours, c.key) })}
                  style={styles.swatchRow}
                >
                  <View style={[styles.swatchRing, selected && styles.swatchRingOn]}>
                    <Swatch value={c.swatch} />
                  </View>
                  <Txt variant="body">{c.label}</Txt>
                </Press>
              );
            })}
          </View>
        </Section>

        <Section title="Rating">
          {RATINGS.map((r) => (
            <Radio
              key={r.value}
              selected={draft.minRating === r.value}
              onPress={() => set({ minRating: draft.minRating === r.value ? undefined : r.value })}
            >
              <Stars value={r.value} size={14} showSummary={false} />
              <Txt variant="body">{r.label}</Txt>
            </Radio>
          ))}
        </Section>

        {features.length > 0 && (
          <Section title="Features">
            {features.map((f) => (
              <Checkbox
                key={f.value}
                checked={draft.features.includes(f.value)}
                onPress={() => set({ features: toggle(draft.features, f.value) })}
              >
                <Txt variant="body">{f.value}</Txt>
              </Checkbox>
            ))}
          </Section>
        )}

        {genders.length > 1 && (
          <Section title="Gender">
            {genders.map((g) => (
              <Checkbox
                key={g}
                checked={draft.gender.includes(g)}
                onPress={() => set({ gender: toggle(draft.gender, g) })}
              >
                <Txt variant="body">{GENDER_LABEL[g] ?? g}</Txt>
              </Checkbox>
            ))}
          </Section>
        )}
      </ScrollView>
      </View>

      <Divider />
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}>
        <Button
          title="Clear all"
          variant="secondary"
          style={{ flex: 1 }}
          disabled={nDraft === 0 && draftSort === 'recommended'}
          onPress={() => {
            setDraft(EMPTY_SEARCH_FILTERS);
            setDraftSort('recommended');
          }}
        />
        {/* The count is the current search's, filtered by the draft. With no
            search there is nothing to count, so the button just says Apply. */}
        <Button
          title={candidates.length && liveCount === 0 ? 'No matches' : 'Apply'}
          accessory={
            liveCount > 0 ? `${liveCount} ${liveCount === 1 ? 'result' : 'results'}` : undefined
          }
          disabled={candidates.length > 0 && liveCount === 0}
          style={{ flex: 1 }}
          onPress={apply}
        />
      </View>
    </View>
  );
}

/** A collapsible group, as the site's panel folds each facet. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.section}>
      <Divider />
      <Press
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={styles.sectionHead}
      >
        <Txt variant="eyebrow">{title}</Txt>
        <BrooksIcon name={open ? 'caretUp' : 'caretDown'} size={12} color={colors.ink} />
      </Press>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

function Radio({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: ReactNode }) {
  return (
    <Press
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.optionRow}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      {children}
    </Press>
  );
}

function Checkbox({ checked, onPress, children }: { checked: boolean; onPress: () => void; children: ReactNode }) {
  return (
    <Press
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.optionRow}
    >
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked ? <BrooksIcon name="checkmarkNoCircle" size={11} color={colors.surface} thicken={0.6} /> : null}
      </View>
      {children}
    </Press>
  );
}

/** `multi` is the site's rainbow disc; every other family is a flat fill. */
function Swatch({ value }: { value: string }) {
  if (value === 'multi') {
    return (
      <LinearGradient
        colors={['#DADADA', '#F53FA6', '#D01B1B']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.swatch}
      />
    );
  }
  return (
    <View
      style={[
        styles.swatch,
        { backgroundColor: value },
        value.toUpperCase() === '#FFFFFF' && styles.swatchOutline,
      ]}
    />
  );
}

const SWATCH = 40;
const CONTROL = 24;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  head: {
    backgroundColor: colors.surface,
    // No zIndex here: React Native implements zIndex by reordering native
    // subviews, which would put the list's wrapper first — the path
    // react-native-screens walks to find "the sheet's scroll view", whose frame
    // it then forces to the whole sheet and hides its end under the footer.
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  scroll: { flex: 1 },
  body: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl },
  sortLabel: { marginTop: spacing.sm, marginBottom: spacing.xs },
  section: { marginTop: spacing.md },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  sectionBody: { paddingBottom: spacing.sm },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  radio: {
    width: CONTROL,
    height: CONTROL,
    borderRadius: radius.pill,
    borderWidth: border.rule,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Form indicators rest in ink, not `controlBorder`: at 24pt they are the
  // control, not its frame. Choosing still doubles the rule (see `border`).
  radioOn: { borderWidth: border.emphasis, borderColor: colors.blue },
  radioDot: { width: 14, height: 14, borderRadius: radius.pill, backgroundColor: colors.blue },
  checkbox: {
    width: CONTROL,
    height: CONTROL,
    borderWidth: border.rule,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.ink },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  swatchRow: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  swatchRing: {
    width: SWATCH + 8,
    height: SWATCH + 8,
    borderRadius: radius.pill,
    borderWidth: border.emphasis,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRingOn: { borderColor: colors.ink },
  swatch: { width: SWATCH, height: SWATCH, borderRadius: radius.pill, overflow: 'hidden' },
  /** A white swatch has to draw its own edge, so it borrows the control rule. */
  swatchOutline: { borderWidth: border.rule, borderColor: colors.controlBorder },
  footer: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
  },
});
