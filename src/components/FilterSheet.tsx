import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { applyFilters, facetsFor, type Filters, type SortKey } from '../data/query';
import { genderLabel, supportLabel } from '../data/labels';
import type { Product } from '../data/types';
import { color, space } from '../theme/tokens';
import { Button, Chip, Divider, Press, Txt, select } from './primitives';

/**
 * The PLP filter sheet.
 *
 * @ref LLP 0003#plp — A full-height bottom sheet whose Apply button carries a
 * live result count, so nobody applies a filter into an empty grid. Options are
 * derived from the products actually in this category (facetsFor), so the sheet
 * never offers an axis that yields zero results.
 */

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'rating', label: 'Top rated' },
];

export function countActiveFilters(f: Filters): number {
  return (
    (f.gender?.length ?? 0) +
    (f.productType?.length ?? 0) +
    (f.cushion?.length ?? 0) +
    (f.support?.length ?? 0) +
    (f.width?.length ?? 0) +
    (f.size?.length ?? 0) +
    (f.onSale ? 1 : 0)
  );
}

function toggle(list: string[] | undefined, value: string): string[] {
  const cur = list ?? [];
  return cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
}

export function FilterSheet({
  visible,
  onClose,
  products,
  filters,
  sort,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  /** The unfiltered product set for this category. */
  products: Product[];
  filters: Filters;
  sort: SortKey;
  onApply: (filters: Filters, sort: SortKey) => void;
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Filters>(filters);
  const [draftSort, setDraftSort] = useState<SortKey>(sort);

  // Re-seed the draft each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setDraft(filters);
      setDraftSort(sort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const facets = useMemo(() => facetsFor(products), [products]);
  const liveCount = useMemo(() => applyFilters(products, draft).length, [products, draft]);
  const activeCount = countActiveFilters(draft);

  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));

  const shoeSizes = facets.size.filter((o) => /^\d/.test(o.value));
  const apparelSizes = facets.size.filter((o) => !/^\d/.test(o.value));
  const APPAREL_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  apparelSizes.sort((a, b) => APPAREL_ORDER.indexOf(a.value) - APPAREL_ORDER.indexOf(b.value));
  shoeSizes.sort((a, b) => Number(a.value) - Number(b.value));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdropWrap}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
          <Press onPress={onClose} haptic={false} style={{ flex: 1 }}>
            <View />
          </Press>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(240)}
          style={[styles.sheet, { paddingBottom: insets.bottom + space.md }]}
        >
          <View style={styles.grabberRow}>
            <View style={styles.grabber} />
          </View>

          <View style={styles.head}>
            <Txt variant="h2">Filter & sort</Txt>
            {activeCount > 0 ? (
              <Press
                haptic={false}
                onPress={() => {
                  select();
                  setDraft({});
                }}
              >
                <Txt variant="caption" c={color.blue}>
                  Clear all ({activeCount})
                </Txt>
              </Press>
            ) : null}
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            <Section title="Sort by">
              <View style={styles.wrap}>
                {SORT_OPTIONS.map((o) => (
                  <Chip
                    key={o.key}
                    label={o.label}
                    size="sm"
                    selected={draftSort === o.key}
                    onPress={() => setDraftSort(o.key)}
                  />
                ))}
              </View>
            </Section>

            {facets.gender.length > 1 && (
              <Section title="Gender">
                <View style={styles.wrap}>
                  {facets.gender.map((o) => (
                    <Chip
                      key={o.value}
                      label={`${genderLabel(o.value)} (${o.count})`}
                      size="sm"
                      selected={draft.gender?.includes(o.value)}
                      onPress={() => set({ gender: toggle(draft.gender, o.value) })}
                    />
                  ))}
                </View>
              </Section>
            )}

            {facets.productType.length > 1 && (
              <Section title="Product type">
                <View style={styles.wrap}>
                  {facets.productType.map((o) => (
                    <Chip
                      key={o.value}
                      label={`${o.value} (${o.count})`}
                      size="sm"
                      selected={draft.productType?.includes(o.value)}
                      onPress={() => set({ productType: toggle(draft.productType, o.value) })}
                    />
                  ))}
                </View>
              </Section>
            )}

            {facets.cushion.length > 0 && (
              <Section title="Cushion">
                <View style={styles.wrap}>
                  {facets.cushion.map((o) => (
                    <Chip
                      key={o.value}
                      label={`${o.value} (${o.count})`}
                      size="sm"
                      selected={draft.cushion?.includes(o.value)}
                      onPress={() => set({ cushion: toggle(draft.cushion, o.value) })}
                    />
                  ))}
                </View>
              </Section>
            )}

            {facets.support.length > 0 && (
              <Section title="Support">
                <View style={styles.wrap}>
                  {facets.support.map((o) => (
                    <Chip
                      key={o.value}
                      label={`${supportLabel(o.value)} (${o.count})`}
                      size="sm"
                      selected={draft.support?.includes(o.value)}
                      onPress={() => set({ support: toggle(draft.support, o.value) })}
                    />
                  ))}
                </View>
              </Section>
            )}

            {facets.width.length > 1 && (
              <Section title="Width">
                <View style={styles.wrap}>
                  {facets.width.map((o) => (
                    <Chip
                      key={o.value}
                      label={o.value}
                      size="sm"
                      selected={draft.width?.includes(o.value)}
                      onPress={() => set({ width: toggle(draft.width, o.value) })}
                    />
                  ))}
                </View>
              </Section>
            )}

            {shoeSizes.length > 1 && (
              <Section title="Shoe size">
                <View style={styles.wrap}>
                  {shoeSizes.map((o) => (
                    <Chip
                      key={o.value}
                      label={o.value}
                      size="sm"
                      selected={draft.size?.includes(o.value)}
                      onPress={() => set({ size: toggle(draft.size, o.value) })}
                    />
                  ))}
                </View>
              </Section>
            )}

            {apparelSizes.length > 1 && (
              <Section title="Apparel size">
                <View style={styles.wrap}>
                  {apparelSizes.map((o) => (
                    <Chip
                      key={o.value}
                      label={o.value}
                      size="sm"
                      selected={draft.size?.includes(o.value)}
                      onPress={() => set({ size: toggle(draft.size, o.value) })}
                    />
                  ))}
                </View>
              </Section>
            )}

            <Section title="Deals">
              <View style={styles.wrap}>
                <Chip
                  label="On sale"
                  size="sm"
                  selected={draft.onSale}
                  onPress={() => set({ onSale: !draft.onSale })}
                />
              </View>
            </Section>
          </ScrollView>

          <Divider />
          <View style={styles.footer}>
            <Button
              title={liveCount === 0 ? 'No matches' : 'Apply'}
              accessory={liveCount > 0 ? `${liveCount} ${liveCount === 1 ? 'result' : 'results'}` : undefined}
              disabled={liveCount === 0}
              onPress={() => {
                onApply(draft, draftSort);
                onClose();
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="eyebrow" c={color.inkMuted} style={{ marginBottom: space.md }}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdropWrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.overlay,
  },
  sheet: {
    backgroundColor: color.surface,
    maxHeight: '88%',
    borderTopWidth: 3,
    borderTopColor: color.ink,
  },
  grabberRow: { alignItems: 'center', paddingVertical: space.sm },
  grabber: { width: 44, height: 4, backgroundColor: color.hairline },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.gutter,
    paddingBottom: space.md,
  },
  body: { paddingHorizontal: space.gutter, paddingBottom: space.lg },
  section: { marginTop: space.lg },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  footer: { paddingHorizontal: space.gutter, paddingTop: space.md },
});
