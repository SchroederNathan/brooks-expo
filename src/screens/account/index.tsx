import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrooksIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { Divider } from '@/components/divider';
import { Press } from '@/components/press';
import { Screen, ScreenHeading, ScreenScrollView } from '@/components/screen';
import { Squiggle } from '@/components/squiggle';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { VOICE } from '@/data/editorial';
import { useCart } from '@/store/cart';
import { leave, useMember } from '@/store/member';
import { RUN_CLUB_PERKS } from '@/constants';
import { border, colors, spacing } from '@/theme';

/**
 * Account.
 *
 * @ref LLP 0003#login — Run Club framing throughout: a member sees their club
 * card; a guest sees the pitch, with browsing never gated behind either.
 * [observed 2026-08-28] A guest gets the pitch and nothing else: no heading,
 * no rows, no footer — a centred illustration, one line saying what signing
 * in unlocks, then `Log in` over `Create an account` as a full-width stack,
 * held in the middle of the screen. Both lead to the same on-device form; the
 * mode only relabels it. The bag and Shoe Finder are one tab-bar tap away.
 */
export function Account() {
  const member = useMember();
  const cart = useCart();

  // @ref LLP 0003#the-header-collapses-on-scroll — the blue header is Home's
  // alone. The controls this screen used to carry up top (search, cart, browse)
  // are all one tab-bar tap away, and the rows below already reach the bag and
  // the Shoe Finder.
  if (!member) {
    return (
      <Screen style={styles.guestScreen}>
        <GuestPitch />
      </Screen>
    );
  }

  return (
    <ScreenScrollView>
      <ScreenHeading>{`Hey, ${member.firstName}.`}</ScreenHeading>

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
      ) : null}

      {/* ----------------------------------------------------------- ROWS -- */}
      {/* The rows' rules stop at the gutter, not the screen edge. */}
      <View style={{ marginTop: spacing.xxl, marginHorizontal: spacing.gutter }}>
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

/**
 * What a guest sees. The copy makes only claims Brooks makes on its own
 * support site (see `RUN_CLUB_PERKS`); the illustration is built from the
 * brand's own sprite glyphs so it needs no new asset.
 */
function GuestPitch() {
  return (
    <View style={styles.guest}>
      <View style={styles.illustration} accessible={false}>
        <View style={styles.illustrationCore}>
          <BrooksIcon name="account" size={56} color={colors.surface} />
        </View>
        <View style={[styles.satellite, styles.satelliteTopLeft]}>
          <BrooksIcon name="cart" size={22} color={colors.blue} />
        </View>
        <View style={[styles.satellite, styles.satelliteTopRight]}>
          <BrooksIcon name="clock" size={22} color={colors.blue} />
        </View>
        <View style={[styles.satellite, styles.satelliteBottom]}>
          <BrooksIcon name="pin" size={22} color={colors.blue} />
        </View>
      </View>

      <Txt variant="body" c={colors.inkSoft} style={styles.guestBody}>
        Log in to your Brooks Run Club account to see your order history, start
        a return, and keep your addresses and payment methods in one place.
      </Txt>

      <View style={styles.actions}>
        <Button title="Log in" onPress={() => router.push('/login?mode=login')} />
        <Button
          title="Create an account"
          variant="secondary"
          onPress={() => router.push('/login?mode=create')}
        />
      </View>

      <Txt variant="tiny" c={colors.inkFaint} style={styles.guestNote}>
        Membership is free. Browsing never requires it.
      </Txt>
    </View>
  );
}

function Row({ label, detail, onPress }: { label: string; detail?: string; onPress?: () => void }) {
  return (
    <Press scaleTo={onPress ? 0.99 : 1} onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Txt variant="navRow">{label}</Txt>
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

/** The button's hard shadow hangs 4pt below its face; the note clears it. */
const SHADOW_GAP = 4;
const ILLUSTRATION = 168;
const SATELLITE = 44;

const styles = StyleSheet.create({
  /** Centre the pitch in the space above the tab bar; the safe area is already applied. */
  guestScreen: { justifyContent: 'center', paddingBottom: spacing.xxxl },
  guest: { paddingHorizontal: spacing.gutter, alignItems: 'center' },
  illustration: {
    width: ILLUSTRATION,
    height: ILLUSTRATION,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCore: {
    width: 104,
    height: 104,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Square, outlined in the brand's control rule: the same block the buttons are. */
  satellite: {
    position: 'absolute',
    width: SATELLITE,
    height: SATELLITE,
    backgroundColor: colors.surface,
    borderWidth: border.heavy,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  satelliteTopLeft: { top: 0, left: 0 },
  satelliteTopRight: { top: 0, right: 0 },
  satelliteBottom: { bottom: 0, right: spacing.lg },
  guestBody: { textAlign: 'center', marginTop: spacing.xl },
  /** The two actions stack with room for the lower button's hard shadow. */
  actions: { alignSelf: 'stretch', marginTop: spacing.xl, gap: spacing.lg },
  guestNote: { marginTop: spacing.lg + SHADOW_GAP, textAlign: 'center' },
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
    paddingVertical: spacing.lg,
    borderBottomWidth: border.rule,
    borderBottomColor: colors.hairline,
  },
  signOut: { alignSelf: 'center', marginTop: spacing.xl, padding: spacing.sm },
  foot: { alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.gutter },
});
