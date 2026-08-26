import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrooksIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { Divider } from '@/components/divider';
import { Press } from '@/components/press';
import { ScreenHeading, ScreenScrollView } from '@/components/screen';
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
  const member = useMember();
  const cart = useCart();

  // @ref LLP 0003#the-header-collapses-on-scroll — the blue header is Home's
  // alone. The controls this screen used to carry up top (search, cart, browse)
  // are all one tab-bar tap away, and the rows below already reach the bag and
  // the Shoe Finder.
  return (
    <ScreenScrollView>
      <ScreenHeading>{member ? `Hey, ${member.firstName}.` : 'Account'}</ScreenHeading>

      {member ? (
        <View style={styles.card}>
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
        </View>
      ) : (
        <View style={styles.card}>
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
        </View>
      )}

      {/* ----------------------------------------------------------- ROWS -- */}
      <View style={{ marginTop: spacing.xxl }}>
        <Row
          label="Your bag"
          detail={cart.count ? `${cart.count} ${cart.count === 1 ? 'item' : 'items'}` : 'Empty'}
          onPress={() => router.push('/cart')}
        />
        <Row label="Shoe Finder" detail="Find your perfect shoe" onPress={() => router.navigate('/(tabs)/(finder)/finder')} />
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
        <Press onPress={leave} style={styles.signOut}>
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
    </ScreenScrollView>
  );
}

function Row({ label, detail, onPress }: { label: string; detail?: string; onPress?: () => void }) {
  return (
    <Press scaleTo={onPress ? 0.99 : 1} onPress={onPress} style={styles.row}>
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
