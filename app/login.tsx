import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Press, Txt, notify } from '../src/components/primitives';
import { join } from '../src/store/member';
import { RUN_CLUB_PERKS, color, font, space } from '../src/theme/tokens';

/**
 * Join Brooks Run Club.
 *
 * @ref LLP 0003#login — adidas's membership framing: joining a club, never
 * passing a gate. The guest path stays visible at all times. No Brooks auth API
 * is reachable from an app (LLP 0002), so this stores a first name on-device
 * and asks for nothing sensitive.
 */
export default function Login() {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const nameOk = firstName.trim().length >= 1;
  const emailOk = /.+@.+\..+/.test(email.trim());

  const onJoin = () => {
    setTouched(true);
    if (!nameOk || !emailOk) {
      notify(Haptics.NotificationFeedbackType.Error);
      return;
    }
    join({ firstName: firstName.trim(), email: email.trim() });
    notify(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: Platform.OS === 'ios' ? space.xl : insets.top + space.xl,
          paddingBottom: insets.bottom + space.xl,
        }}
      >
        <View style={styles.head}>
          <Press haptic={false} hitSlop={10} onPress={() => router.back()} style={{ alignSelf: 'flex-end' }}>
            <Txt variant="h3" c={color.inkMuted}>
              ✕
            </Txt>
          </Press>
        </View>

        {/* --------------------------------------------------- THE PITCH --- */}
        <Animated.View entering={FadeInDown.duration(320)} style={styles.card}>
          <Txt variant="eyebrow" c={color.lime}>
            Brooks Run Club
          </Txt>
          <Txt variant="h1" c={color.surface} style={{ marginTop: space.sm }}>
            Join the club.{'\n'}Run happier.
          </Txt>
          <View style={{ marginTop: space.xl, gap: space.md }}>
            {RUN_CLUB_PERKS.map((perk, i) => (
              <Animated.View
                key={perk}
                entering={FadeInDown.delay(120 + i * 70).duration(280)}
                style={styles.perk}
              >
                <View style={styles.perkTick}>
                  <Txt variant="tiny" c={color.blue}>
                    ✓
                  </Txt>
                </View>
                <Txt variant="body" c="rgba(255,255,255,0.9)" style={{ flex: 1 }}>
                  {perk}
                </Txt>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

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

          <Txt variant="tiny" c={color.inkFaint} style={{ marginTop: space.sm }}>
            Prototype: membership lives on this device only. Nothing is sent anywhere.
          </Txt>

          <Button title="Join the club" style={{ marginTop: space.lg }} onPress={onJoin} />

          {/* The guest path is always visible — a commerce demo that forces
              auth dies on stage. */}
          <Press haptic={false} onPress={() => router.back()} style={styles.guest}>
            <Txt variant="caption" c={color.inkMuted}>
              Continue as guest
            </Txt>
            <View style={styles.guestUnderline} />
          </Press>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    <View style={{ marginBottom: space.lg }}>
      <Txt variant="eyebrow" c={color.inkMuted} style={{ fontSize: 11, marginBottom: space.sm }}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={color.inkFaint}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        autoCorrect={false}
        style={[styles.input, error ? { borderColor: color.sale } : null]}
      />
      {error ? (
        <Txt variant="tiny" c={color.sale} style={{ marginTop: 4 }}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.surface },
  head: { paddingHorizontal: space.gutter, marginBottom: space.sm },
  card: {
    marginHorizontal: space.gutter,
    backgroundColor: color.navy,
    padding: space.xl,
  },
  perk: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  perkTick: {
    width: 22,
    height: 22,
    backgroundColor: color.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { paddingHorizontal: space.gutter, marginTop: space.xl },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: color.hairline,
    paddingHorizontal: space.md,
    fontFamily: font.regular,
    fontSize: 16,
    color: color.ink,
    backgroundColor: color.surface,
  },
  guest: { alignSelf: 'center', marginTop: space.lg, alignItems: 'center', gap: 3 },
  guestUnderline: { height: 2, alignSelf: 'stretch', backgroundColor: color.hairline },
});
