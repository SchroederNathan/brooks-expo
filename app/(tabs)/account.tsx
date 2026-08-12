import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Divider, Press, Squiggle, Txt } from '../../src/components/primitives';
import { catalog } from '../../src/data/catalog';
import { VOICE } from '../../src/data/editorial';
import { useCart } from '../../src/store/cart';
import { leave, useMember } from '../../src/store/member';
import { RUN_CLUB_PERKS, color, space } from '../../src/theme/tokens';

/**
 * Account.
 *
 * @ref LLP 0003#login — Run Club framing throughout: a member sees their club
 * card; a guest sees the pitch, with browsing never gated behind either.
 */
export default function Account() {
  const insets = useSafeAreaInsets();
  const member = useMember();
  const cart = useCart();

  return (
    <ScrollView
      style={{ backgroundColor: color.surface }}
      contentContainerStyle={{
        paddingTop: insets.top + space.xl,
        paddingBottom: insets.bottom + 110,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.head}>
        <Txt variant="h1">{member ? `Hey, ${member.firstName}.` : 'Account'}</Txt>
      </View>

      {member ? (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.card}>
          <View style={styles.cardTopRow}>
            <Txt variant="eyebrow" c={color.lime}>
              Brooks Run Club
            </Txt>
            <View style={styles.memberBadge}>
              <Txt variant="tiny" c={color.blue}>
                Member
              </Txt>
            </View>
          </View>
          <Txt variant="h2" c={color.surface} style={{ marginTop: space.sm }}>
            {VOICE.runClub}
          </Txt>
          <Txt variant="bodySmall" c="rgba(255,255,255,0.75)" style={{ marginTop: space.sm }}>
            {member.email}
          </Txt>
          <Divider style={{ marginVertical: space.lg, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <View style={{ gap: space.sm }}>
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
          <Txt variant="eyebrow" c={color.lime}>
            Brooks Run Club
          </Txt>
          <Txt variant="h2" c={color.surface} style={{ marginTop: space.sm }}>
            {VOICE.runClub}
          </Txt>
          <Txt variant="bodySmall" c="rgba(255,255,255,0.75)" style={{ marginTop: space.sm }}>
            Free shipping, early access to new shoes, and a birthday gift. Browsing
            never requires it.
          </Txt>
          <Button
            title="Join the club"
            variant="onDark"
            style={{ marginTop: space.lg }}
            onPress={() => router.push('/login')}
          />
        </Animated.View>
      )}

      {/* ----------------------------------------------------------- ROWS -- */}
      <View style={{ marginTop: space.xxl }}>
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
          <Txt variant="caption" c={color.inkMuted}>
            Sign out
          </Txt>
        </Press>
      ) : null}

      <View style={styles.foot}>
        <Squiggle />
        <Txt variant="script" c={color.inkMuted}>
          {VOICE.tagline}
        </Txt>
        <Txt variant="tiny" c={color.inkFaint} style={{ marginTop: space.sm }}>
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
          <Txt variant="tiny" c={color.inkMuted} style={{ marginTop: 2 }}>
            {detail}
          </Txt>
        ) : null}
      </View>
      {onPress ? (
        <Txt variant="h3" c={color.inkFaint}>
          ›
        </Txt>
      ) : null}
    </Press>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.gutter, marginBottom: space.lg },
  card: {
    marginHorizontal: space.gutter,
    backgroundColor: color.navy,
    padding: space.xl,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memberBadge: {
    backgroundColor: color.lime,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  perkTick: { width: 8, height: 8, backgroundColor: color.lime },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.gutter,
    paddingVertical: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: color.hairline,
  },
  signOut: { alignSelf: 'center', marginTop: space.xl, padding: space.sm },
  foot: { alignItems: 'center', marginTop: space.xxl, paddingHorizontal: space.gutter },
});
