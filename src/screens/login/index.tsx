import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrooksIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { Press } from '@/components/press';
import { Txt } from '@/components/themed-text';
import { join } from '@/store/member';
import { RUN_CLUB_PERKS } from '@/constants';
import { border, colors, font, spacing } from '@/theme';

/**
 * Join Brooks Run Club.
 *
 * @ref LLP 0003#login — adidas's membership framing: joining a club, never
 * passing a gate. The guest path stays visible at all times. No Brooks auth API
 * is reachable from an app (LLP 0002), so this stores a first name on-device
 * and asks for nothing sensitive.
 */
export function Login() {
  const insets = useSafeAreaInsets();
  // Account's guest screen offers `Log in` and `Create an account` as two
  // actions, as the site does. The prototype has one on-device form behind
  // both, so the mode only changes what the sheet calls itself.
  const { mode } = useLocalSearchParams<{ mode?: 'login' | 'create' }>();
  const isLogin = mode === 'login';
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const nameOk = firstName.trim().length >= 1;
  const emailOk = /.+@.+\..+/.test(email.trim());

  const onJoin = () => {
    setTouched(true);
    if (!nameOk || !emailOk) {
      return;
    }
    join({ firstName: firstName.trim(), email: email.trim() });
    router.back();
  };

  // `KeyboardAwareScrollView` (react-native-keyboard-controller) rather than
  // `KeyboardAvoidingView` + `ScrollView`: it scrolls the *focused field* clear
  // of the keyboard, tracking the keyboard's own frame on the UI thread, so the
  // email field is never left under it and the card above never jumps.
  return (
    <KeyboardAwareScrollView
      style={styles.root}
      bottomOffset={spacing.xl}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingTop: Platform.OS === 'ios' ? spacing.xl : insets.top + spacing.xl,
        paddingBottom: insets.bottom + spacing.xl,
      }}
    >
      <View style={styles.head}>
        <Press hitSlop={10} onPress={() => router.back()} style={{ alignSelf: 'flex-end' }}>
          <BrooksIcon name="close" size={14} color={colors.inkMuted} />
        </Press>
      </View>

      {/* --------------------------------------------------- THE PITCH --- */}
      <View style={styles.card}>
        <Txt variant="eyebrow" c={colors.lime}>
          Brooks Run Club
        </Txt>
        <Txt variant="h1" c={colors.surface} style={{ marginTop: spacing.sm }}>
          {isLogin ? 'Welcome back.' : 'Join the club.'}{'\n'}Run happier.
        </Txt>
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {RUN_CLUB_PERKS.map((perk) => (
            <View key={perk} style={styles.perk}>
              <View style={styles.perkTick}>
                <BrooksIcon name="checkmarkNoCircle" size={11} color={colors.blue} thicken={0.7} />
              </View>
              <Txt variant="body" c="rgba(255,255,255,0.9)" style={{ flex: 1 }}>
                {perk}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      {/* ------------------------------------------------------- FORM ---- */}
      <View style={styles.form}>
        <Field
          label="First name"
          value={firstName}
          onChange={setFirstName}
          placeholder="Runner"
          error={touched && !nameOk ? 'We need something to call you.' : null}
        />
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          error={touched && !emailOk ? 'That email doesn’t look right.' : null}
        />

        <Txt variant="tiny" c={colors.inkFaint} style={{ marginTop: spacing.sm }}>
          Prototype: membership lives on this device only. Nothing is sent anywhere.
        </Txt>

        <Button
          title={isLogin ? 'Log in' : 'Create an account'}
          style={{ marginTop: spacing.lg }}
          onPress={onJoin}
        />

        {/* The guest path is always visible — a commerce demo that forces
            auth dies on stage. */}
        <Press onPress={() => router.back()} style={styles.guest}>
          <Txt variant="caption" c={colors.inkMuted}>
            Continue as guest
          </Txt>
          <View style={styles.guestUnderline} />
        </Press>
      </View>
    </KeyboardAwareScrollView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'email-address';
  error?: string | null;
}) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Txt variant="eyebrow" c={colors.inkMuted} style={{ fontSize: 11, marginBottom: spacing.sm }}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        autoCorrect={false}
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
  head: { paddingHorizontal: spacing.gutter, marginBottom: spacing.sm },
  card: {
    marginHorizontal: spacing.gutter,
    backgroundColor: colors.navy,
    padding: spacing.xl,
  },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  perkTick: {
    width: 22,
    height: 22,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { paddingHorizontal: spacing.gutter, marginTop: spacing.xl },
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
  guest: { alignSelf: 'center', marginTop: spacing.lg, alignItems: 'center', gap: 3 },
  guestUnderline: { height: 2, alignSelf: 'stretch', backgroundColor: colors.hairline },
});
