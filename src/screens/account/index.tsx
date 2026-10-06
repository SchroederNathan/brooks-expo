import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { BrooksIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { Divider } from '@/components/divider';
import { Press } from '@/components/press';
import { Screen, ScreenHeading, ScreenScrollView, useScreenTopPadding } from '@/components/screen';
import { Squiggle } from '@/components/squiggle';
import { Txt } from '@/components/themed-text';
import { catalog } from '@/data/catalog';
import { VOICE } from '@/data/editorial';
import { useCart } from '@/store/cart';
import { leave, useMember } from '@/store/member';
import { RUN_CLUB_PERKS } from '@/constants';
import { border, colors, spacing } from '@/theme';
import { useUpdateCheck } from '@/utils/updates';

/**
 * Account.
 *
 * @ref LLP 0003#login — Run Club framing throughout: a member sees their club
 * card; a guest sees the pitch, with browsing never gated behind either.
 * A guest gets the pitch and nothing else: a navy Run Club panel, three perks
 * Brooks states itself, and one `Log in or join` button that opens the
 * email-first sheet. The bag and Shoe Finder are one tab-bar tap away.
 */
export function Account() {
  const member = useMember();
  const cart = useCart();
  const update = useUpdateCheck();

  // @ref LLP 0003#the-header-collapses-on-scroll — the blue header is Home's
  // alone. The controls this screen used to carry up top (search, cart, browse)
  // are all one tab-bar tap away, and the rows below already reach the bag and
  // the Shoe Finder.
  if (!member) {
    return (
      <GuestPitch />
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
        <Row label={update.label} detail={update.detail} onPress={update.onPress} />
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
 * What a guest sees. The perks repeat only what Brooks states on its own
 * support site (see `RUN_CLUB_PERKS`).
 */
function GuestPitch() {
  const top = useScreenTopPadding();
  const focused = useIsFocused();
  return (
    <Screen style={styles.guestScreen}>
      {/* The navy panel runs under the status bar, so the bar goes light while
          this tab is in front. */}
      {focused && <StatusBar style="light" animated />}
      <View style={[styles.hero, { paddingTop: top + spacing.xl }]}>
        <Txt variant="eyebrow" c={colors.lime}>
          Brooks Run Club
        </Txt>
        <Txt variant="hero" c={colors.surface} style={{ marginTop: spacing.md }}>
          Join the club.{'\n'}Run happier.
        </Txt>
        <Txt variant="body" c="rgba(255,255,255,0.8)" style={{ marginTop: spacing.md }}>
          Membership is free. Log in to see your orders and keep your addresses
          and payment methods in one place.
        </Txt>
      </View>

      <View style={styles.perkList}>
        <Txt variant="eyebrow" c={colors.inkMuted} style={{ marginBottom: spacing.sm }}>
          What members get
        </Txt>
        <Perk glyph={<TruckGlyph />} title="Free shipping" body="Standard shipping on every order. Express is free at $160." />
        <Perk glyph={<BoxGlyph />} title="Easy returns" body="Your order history in one place, so a return is easy to start." />
        <Perk glyph={<GiftGlyph />} title="A birthday gift" body="A gift with purchase during your birthday month." />
      </View>

      <View style={{ flex: 1 }} />
      <View style={styles.guestActions}>
        <Button title="Log in or join" onPress={() => router.push('/login')} />
        <Txt variant="tiny" c={colors.inkFaint} style={styles.guestNote}>
          Browsing never requires an account.
        </Txt>
      </View>
    </Screen>
  );
}

function Perk({ glyph, title, body }: { glyph: React.ReactNode; title: string; body: string }) {
  return (
    <View style={styles.perk} accessible accessibilityLabel={`${title}. ${body}`}>
      <View style={styles.perkGlyph}>{glyph}</View>
      <View style={{ flex: 1 }}>
        <Txt variant="productTitle">{title}</Txt>
        <Txt variant="bodySmall" c={colors.inkMuted} style={{ marginTop: 2 }}>
          {body}
        </Txt>
      </View>
    </View>
  );
}

/** Line glyphs for the perks, drawn in the ink of the control rule. */
const GLYPH = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: colors.ink, strokeWidth: 2, strokeLinecap: 'square', strokeLinejoin: 'miter' } as const;

function TruckGlyph() {
  return (
    <Svg {...GLYPH}>
      <Rect x={1} y={4} width={15} height={12} />
      <Polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <Circle cx={5.5} cy={18.5} r={2.5} />
      <Circle cx={18.5} cy={18.5} r={2.5} />
    </Svg>
  );
}

function BoxGlyph() {
  return (
    <Svg {...GLYPH}>
      <Path d="M21 8 12 3 3 8v8l9 5 9-5V8z" />
      <Polyline points="3 8 12 13 21 8" />
      <Line x1={12} y1={13} x2={12} y2={21} />
    </Svg>
  );
}

function GiftGlyph() {
  return (
    <Svg {...GLYPH}>
      <Polyline points="20 12 20 22 4 22 4 12" />
      <Rect x={2} y={7} width={20} height={5} />
      <Line x1={12} y1={22} x2={12} y2={7} />
      <Path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <Path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </Svg>
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

const styles = StyleSheet.create({
  /** The navy panel draws its own top inset, so the screen adds none. */
  guestScreen: { paddingTop: 0, paddingBottom: spacing.xl },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
  },
  perkList: { paddingHorizontal: spacing.gutter, marginTop: spacing.xl },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: border.rule,
    borderBottomColor: colors.hairline,
  },
  /** Square, outlined in the control rule: the same block the buttons are. */
  perkGlyph: {
    width: 44,
    height: 44,
    borderWidth: border.heavy,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestActions: { paddingHorizontal: spacing.gutter },
  guestNote: { marginTop: spacing.md + SHADOW_GAP, textAlign: 'center' },
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
