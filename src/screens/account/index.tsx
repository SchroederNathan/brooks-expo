import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrooksIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { Divider } from '@/components/divider';
import { Press } from '@/components/press';
import { Squiggle } from '@/components/squiggle';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { VOICE } from '@/data/editorial';
import { useCart } from '@/store/cart';
import { leave, useMember } from '@/store/member';
import { RUN_CLUB_PERKS } from '@/constants';
import { colors, spacing } from '@/theme';

/**
 * Account.
 *
 * @ref LLP 0003#login — Run Club framing throughout: a member sees their club
 * card; a guest sees the pitch, with browsing never gated behind either.
 */
export function Account() {
  const insets = useSafeAreaInsets();
  const member = useMember();
  const cart = useCart();

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.xl,
        paddingBottom: spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.head}>
        <Txt variant="h1">{member ? `Hey, ${member.firstName}.` : 'Account'}</Txt>
      </View>

      {member ? (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.card}>
          <View style={styles.cardTopRow}>
            <Txt variant="eyebrow" c={colors.lime}>
              Brooks Run Club
            </Txt>
            <View style={styles.memberBadge}>
              <Txt variant="tiny" c={colors.blue}>
                Member
              </Txt>
            </View>
          </View>
          <Txt variant="h2" c={colors.surface} style={{ marginTop: spacing.sm }}>
            {VOICE.runClub}
          </Txt>
          <Txt variant="bodySmall" c="rgba(255,255,255,0.75)" style={{ marginTop: spacing.sm }}>
            {member.email}
          </Txt>
          <Divider style={{ marginVertical: spacing.lg, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <View style={{ gap: spacing.sm }}>
            {RUN_CLUB_PERKS.slice(0, 3).map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <View style={styles.perkTick} />
                <Txt variant="bodySmall" c="rgba(255,255,255,0.9)">
                  {perk}
                </Txt>
              </View>
            ))}
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.card}>
          <Txt variant="eyebrow" c={colors.lime}>
            Brooks Run Club
          </Txt>
          <Txt variant="h2" c={colors.surface} style={{ marginTop: spacing.sm }}>
            {VOICE.runClub}
          </Txt>
          <Txt variant="bodySmall" c="rgba(255,255,255,0.75)" style={{ marginTop: spacing.sm }}>
            Free shipping, early access to new shoes, and a birthday gift. Browsing
            never requires it.
          </Txt>
          <Button
            title="Join the club"
            variant="onDark"
            style={{ marginTop: spacing.lg }}
            onPress={() => router.push('/login')}
          />
        </Animated.View>
      )}

      {/* ----------------------------------------------------------- ROWS -- */}
      <View style={{ marginTop: spacing.xxl }}>
        <Row
          label="Your bag"
          detail={cart.count ? `${cart.count} ${cart.count === 1 ? 'item' : 'items'}` : 'Empty'}
          onPress={() => router.push('/cart')}
        />
        <Row label="Shoe Finder" detail="Find your perfect shoe" onPress={() => router.push('/finder')} />
        <Row
          label="Order history"
          detail="Prototype — checkout is out of scope"
        />
        <Row
          label="Run Happy Promise"
          detail="90-day trial run on every order"
        />
      </View>

      {member ? (
        <Press haptic={false} onPress={leave} style={styles.signOut}>
          <Txt variant="caption" c={colors.inkMuted}>
            Sign out
          </Txt>
        </Press>
      ) : null}

      <View style={styles.foot}>
        <Squiggle />
        <Txt variant="script" c={colors.inkMuted}>
          {VOICE.tagline}
        </Txt>
        <Txt variant="tiny" c={colors.inkFaint} style={{ marginTop: spacing.sm }}>
          Catalog snapshot harvested {new Date(catalog.harvestedAt).toLocaleDateString()} ·
          photography and search live from Brooks
        </Txt>
      </View>
    </ScrollView>
  );
}

function Row({ label, detail, onPress }: { label: string; detail?: string; onPress?: () => void }) {
  return (
    <Press haptic={false} scaleTo={onPress ? 0.99 : 1} onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Txt variant="h3">{label}</Txt>
        {detail ? (
          <Txt variant="tiny" c={colors.inkMuted} style={{ marginTop: 2 }}>
            {detail}
          </Txt>
        ) : null}
      </View>
      {onPress ? <BrooksIcon name="caretRight" size={14} color={colors.inkFaint} /> : null}
    </Press>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.gutter, marginBottom: spacing.lg },
  card: {
    marginHorizontal: spacing.gutter,
    backgroundColor: colors.navy,
    padding: spacing.xl,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memberBadge: {
    backgroundColor: colors.lime,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  perkTick: { width: 8, height: 8, backgroundColor: colors.lime },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  signOut: { alignSelf: 'center', marginTop: spacing.xl, padding: spacing.sm },
  foot: { alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.gutter },
});
