import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrooksIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { Press } from '@/components/press';
import { Txt } from '@/components/themed-text';
import { RUN_CLUB_PERKS } from '@/constants';
import { join, knownMember } from '@/store/member';
import { border, colors, font, headerIcon, nativeSheetHeader, spacing } from '@/theme';

/**
 * Log in or join Brooks Run Club.
 *
 * @ref LLP 0003#login — One sheet, email first. The shopper types an email and
 * taps Continue; the app decides whether that is a returning member (welcome
 * back, done) or a new one (ask a first name, then join). This replaces the
 * old `Log in` / `Create an account` pair, which led to the same form anyway.
 * No Brooks auth API is reachable from an app (LLP 0002), so "returning" means
 * "joined on this device before", and nothing sensitive is asked for.
 */
export function Login() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'email' | 'name'>('email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [touched, setTouched] = useState(false);
  const nameRef = useRef<TextInput>(null);

  const emailOk = /.+@.+\..+/.test(email.trim());
  const nameOk = firstName.trim().length >= 1;

  const onContinue = () => {
    setTouched(true);
    if (!emailOk) return;
    const known = knownMember(email);
    if (known) {
      join({ firstName: known.firstName, email: known.email });
      router.back();
      return;
    }
    setTouched(false);
    setStep('name');
    // The name field mounts with this step; focus it on the next frame.
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const onJoin = () => {
    setTouched(true);
    if (!nameOk) return;
    join({ firstName: firstName.trim(), email: email.trim() });
    router.back();
  };

  // `KeyboardAwareScrollView` scrolls the focused field clear of the keyboard
  // on the UI thread. The offset also clears the button under the field, so
  // the action is never hidden while typing.
  return (
    <KeyboardAwareScrollView
      style={styles.root}
      bottomOffset={BUTTON_CLEARANCE}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: Platform.OS === 'ios' ? spacing.xl : insets.top + spacing.xl,
        paddingBottom: insets.bottom + spacing.xl,
        paddingHorizontal: spacing.gutter,
      }}
    >
      {/* On iOS the close is the modal's native bar: the system `xmark` in
          its trailing slot. Elsewhere the sheet draws its own.
          @ref LLP 0003#pushed-screens-wear-the-native-header */}
      {nativeSheetHeader ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon={headerIcon.close} accessibilityLabel="Close" onPress={() => router.back()} />
        </Stack.Toolbar>
      ) : (
        <Press hitSlop={10} onPress={() => router.back()} style={styles.close} accessibilityLabel="Close">
          <BrooksIcon name="close" size={14} color={colors.inkMuted} />
        </Press>
      )}

      <Txt variant="eyebrow" c={colors.blue}>
        Brooks Run Club
      </Txt>

      {step === 'email' ? (
        <>
          <Txt variant="hero" style={styles.headline}>
            Log in or join.
          </Txt>
          <Txt variant="body" c={colors.inkSoft} style={styles.lead}>
            Enter your email. If you are new, we set up your free membership next.
          </Txt>

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            onSubmit={onContinue}
            error={touched && !emailOk ? 'That email doesn’t look right.' : null}
          />
          <Button title="Continue" style={styles.primary} onPress={onContinue} />
        </>
      ) : (
        <>
          <Txt variant="hero" style={styles.headline}>
            Welcome to{'\n'}the club.
          </Txt>
          <Press onPress={() => setStep('email')} style={styles.emailChip} accessibilityRole="button" accessibilityLabel={`${email.trim()}. Change email`}>
            <Txt variant="caption" c={colors.ink} numberOfLines={1} style={{ flexShrink: 1 }}>
              {email.trim()}
            </Txt>
            <Txt variant="caption" c={colors.blue} style={styles.underline}>
              Change
            </Txt>
          </Press>

          <View style={styles.perks}>
            {MEMBER_PERKS.map((perk) => (
              <View key={perk} style={styles.perk}>
                <View style={styles.perkTick}>
                  <BrooksIcon name="checkmarkNoCircle" size={10} color={colors.ink} thicken={0.7} />
                </View>
                <Txt variant="bodySmall" c={colors.inkSoft} style={{ flex: 1 }}>
                  {perk}
                </Txt>
              </View>
            ))}
          </View>

          <Field
            inputRef={nameRef}
            label="First name"
            value={firstName}
            onChange={setFirstName}
            placeholder="What should we call you?"
            onSubmit={onJoin}
            error={touched && !nameOk ? 'We need something to call you.' : null}
          />
          <Button title="Join Brooks Run Club" style={styles.primary} onPress={onJoin} />
        </>
      )}

      <View style={{ flex: 1, minHeight: spacing.xxl }} />

      {/* The guest path is always visible — a commerce demo that forces auth
          dies on stage. */}
      <Press onPress={() => router.back()} style={styles.guest} accessibilityRole="button">
        <Txt variant="caption" c={colors.ink} style={styles.underline}>
          Continue as guest
        </Txt>
      </Press>
      <Txt variant="tiny" c={colors.inkFaint} style={styles.note}>
        Prototype: membership lives on this device only. Nothing is sent anywhere.
      </Txt>
    </KeyboardAwareScrollView>
  );
}

/** The button under each field: its top gap, its 50pt face and its hard shadow. */
const BUTTON_CLEARANCE = spacing.lg + 50 + 6 + spacing.lg;

/** The first perks Brooks lists for members (`RUN_CLUB_PERKS`). */
const MEMBER_PERKS = [RUN_CLUB_PERKS[0], RUN_CLUB_PERKS[2], RUN_CLUB_PERKS[3]];

function Field({
  inputRef,
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  onSubmit,
  error,
}: {
  inputRef?: React.Ref<TextInput>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'email-address';
  onSubmit: () => void;
  error?: string | null;
}) {
  const isEmail = keyboardType === 'email-address';
  return (
    <View style={{ marginTop: spacing.xl }}>
      <Txt variant="eyebrow" c={colors.inkMuted} style={{ fontSize: 11, marginBottom: spacing.sm }}>
        {label}
      </Txt>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        keyboardType={keyboardType}
        autoCapitalize={isEmail ? 'none' : 'words'}
        autoComplete={isEmail ? 'email' : 'given-name'}
        textContentType={isEmail ? 'emailAddress' : 'givenName'}
        autoCorrect={false}
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        accessibilityLabel={label}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? (
        <Txt variant="tiny" c={colors.sale} style={{ marginTop: 4 }}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  close: { alignSelf: 'flex-end', marginBottom: spacing.sm },
  headline: { marginTop: spacing.sm },
  lead: { marginTop: spacing.md },
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  underline: { textDecorationLine: 'underline' },
  perks: { marginTop: spacing.xl, gap: spacing.md },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  // Lime is a spark, never a surface (LLP 0003): a small tick, not a panel.
  perkTick: {
    width: 20,
    height: 20,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderWidth: border.rule,
    borderColor: colors.controlBorder,
    paddingHorizontal: spacing.md,
    fontFamily: font.regular,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  /** Error is the field's emphasis state, same doubling as a selection. */
  inputError: { borderWidth: border.emphasis, borderColor: colors.sale },
  primary: { marginTop: spacing.lg },
  guest: { alignSelf: 'center', padding: spacing.sm },
  note: { textAlign: 'center', marginTop: spacing.sm },
});
