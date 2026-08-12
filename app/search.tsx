import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Divider, Press, Price, ShoeImage, Txt } from '../src/components/primitives';
import { catalog } from '../src/data/catalog';
import { autocomplete, type SearchHit, type Suggestions } from '../src/data/constructor';
import { heroImage } from '../src/data/images';
import { byId } from '../src/data/query';
import { colors, font, spacing } from '../src/theme';

/**
 * Search.
 *
 * @ref LLP 0002#constructor-io — The one screen that talks to a real Brooks API
 * live from the device: type-ahead against the same Constructor.io index the
 * website's search box uses. Constructor carries no prices, so every hit is
 * joined back to the catalog snapshot by style id before it renders a price.
 */

const TRENDING = ['Ghost', 'Glycerin', 'Adrenaline', 'Hyperion', 'Trail', 'Sports bra'];

export default function Search() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [live, setLive] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const inputRef = useRef<TextInput>(null);

  /** Debounced live autocomplete; aborts the in-flight request on every keystroke. */
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setLive(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const s = await autocomplete(q, { signal: ctrl.signal });
        setLive(s);
        setOffline(false);
      } catch (e) {
        if (!ctrl.signal.aborted) {
          setLive(null);
          setOffline(true);
        }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query]);

  /** Offline (or Constructor hiccup): search the snapshot by name instead. */
  const localHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!offline || q.length < 2) return [];
    return catalog.products
      .filter(
        (p) => p.name.toLowerCase().includes(q) || (p.franchise ?? '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [offline, query]);

  const openHit = (hit: SearchHit) => {
    Keyboard.dismiss();
    const local = byId(catalog, hit.id);
    if (local) {
      router.push({ pathname: '/product/[id]', params: { id: hit.id } });
    } else {
      // In the live index but not the snapshot — land on search-in-category.
      router.push({
        pathname: '/category/[id]',
        params: { id: 'featured-new-arrivals', title: hit.name },
      });
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      {/* ------------------------------------------------------- INPUT BAR -- */}
      <View style={styles.barRow}>
        <View style={styles.inputWrap}>
          <Txt variant="h3" c={colors.inkMuted}>
            ⌕
          </Txt>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Shoes, apparel, franchises…"
            placeholderTextColor={colors.inkFaint}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
          />
          {loading ? <ActivityIndicator size="small" color={colors.inkMuted} /> : null}
          {!loading && query.length > 0 ? (
            <Press haptic={false} hitSlop={8} onPress={() => setQuery('')}>
              <Txt variant="caption" c={colors.inkMuted}>
                ✕
              </Txt>
            </Press>
          ) : null}
        </View>
        <Press haptic={false} hitSlop={8} onPress={() => router.back()} style={{ padding: spacing.sm }}>
          <Txt variant="caption" c={colors.ink}>
            Cancel
          </Txt>
        </Press>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* --------------------------------------------------------- EMPTY -- */}
        {query.trim().length < 2 && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.block}>
            <Txt variant="eyebrow" c={colors.inkMuted} style={{ marginBottom: spacing.md }}>
              Trending
            </Txt>
            <View style={styles.chips}>
              {TRENDING.map((t) => (
                <Chip key={t} label={t} size="sm" onPress={() => setQuery(t)} />
              ))}
            </View>
            <Txt variant="tiny" c={colors.inkFaint} style={{ marginTop: spacing.xl }}>
              Search is live against the same index brooksrunning.com uses.
            </Txt>
          </Animated.View>
        )}

        {/* --------------------------------------------------- SUGGESTIONS -- */}
        {live && live.terms.length > 0 && (
          <View style={styles.block}>
            <View style={styles.chips}>
              {live.terms.map((t) => (
                <Chip key={t} label={t} size="sm" onPress={() => setQuery(t)} />
              ))}
            </View>
          </View>
        )}

        {/* -------------------------------------------------- PRODUCT HITS -- */}
        {live && live.products.length > 0 && (
          <View style={{ marginTop: spacing.md }}>
            {live.products.map((hit, i) => {
              const local = byId(catalog, hit.id);
              const imageUrl = local ? heroImage(local.colors[0]?.images ?? []) : hit.imageUrl;
              return (
                <Animated.View key={hit.id} entering={FadeInDown.delay(i * 40).duration(240)}>
                  <Press haptic={false} scaleTo={0.98} onPress={() => openHit(hit)} style={styles.hit}>
                    <View style={styles.hitImage}>
                      {imageUrl ? <ShoeImage url={imageUrl} width={64} height={64} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt variant="productTitle" numberOfLines={1}>
                        {hit.name}
                      </Txt>
                      <Txt variant="tiny" c={colors.inkMuted} numberOfLines={1}>
                        {[
                          hit.gender === 'womens' ? "Women's" : hit.gender === 'mens' ? "Men's" : null,
                          hit.cushion ? `${hit.cushion} cushion` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Txt>
                      {local ? (
                        <View style={{ marginTop: 3 }}>
                          <Price value={local.price} listValue={local.listPrice} />
                        </View>
                      ) : (
                        <Txt variant="tiny" c={colors.inkFaint} style={{ marginTop: 3 }}>
                          Live index — not in this snapshot
                        </Txt>
                      )}
                    </View>
                    <Txt variant="h3" c={colors.inkFaint}>
                      ›
                    </Txt>
                  </Press>
                  <Divider style={{ marginLeft: spacing.gutter + 64 + spacing.lg }} />
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* ------------------------------------------------ OFFLINE / LOCAL -- */}
        {offline && query.trim().length >= 2 && (
          <View style={styles.block}>
            <Txt variant="tiny" c={colors.inkMuted} style={{ marginBottom: spacing.md }}>
              Live search unreachable — searching the on-device catalog instead.
            </Txt>
            {localHits.map((p) => (
              <Press
                key={p.id}
                haptic={false}
                scaleTo={0.98}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
                style={[styles.hit, { paddingHorizontal: 0 }]}
              >
                <View style={styles.hitImage}>
                  <ShoeImage url={heroImage(p.colors[0]?.images ?? [])} width={64} height={64} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="productTitle" numberOfLines={1}>
                    {p.name}
                  </Txt>
                  <View style={{ marginTop: 3 }}>
                    <Price value={p.price} listValue={p.listPrice} />
                  </View>
                </View>
              </Press>
            ))}
          </View>
        )}

        {live && live.terms.length === 0 && live.products.length === 0 && (
          <View style={[styles.block, { alignItems: 'center', paddingTop: spacing.xxl }]}>
            <Txt variant="h3">No matches for “{query.trim()}”</Txt>
            <Txt variant="body" c={colors.inkMuted} style={{ marginTop: spacing.sm, textAlign: 'center' }}>
              Try a franchise name — Ghost, Glycerin, Adrenaline…
            </Txt>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.md,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  input: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 16,
    color: colors.ink,
    height: '100%',
  },
  block: { paddingHorizontal: spacing.gutter, marginTop: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
  },
  hitImage: { backgroundColor: colors.surfaceAlt },
});
