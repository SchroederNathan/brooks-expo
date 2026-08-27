import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { BrooksIcon } from './icons';
import { colors, font, spacing } from '../theme';

/**
 * The search field: a square, `#F8F8F8` box with the site's own search glyph
 * leading, and nothing trailing.
 *
 * @ref LLP 0003#brand — Square, no border, on the product-shot gray. The site's
 * header search opens a field of exactly this shape; the box is the one the
 * Browse screen drew for years as a fake (a `Press` that pushed a separate
 * screen). It is a real input now, and the one search input in the app.
 *
 * The field draws no state of its own: focus is the keyboard's job rather than
 * a border's, and clearing is the caller's. Browse already flanks the focused
 * field with an outlined cross that resets it, so a second cross inside the box
 * was two controls a thumb's width apart doing nearly the same thing. The
 * routine behind that cross survives as `reset()` on the ref — the exit is the
 * same, only its button moved outside.
 *
 * Contract per the expo-design-system rule: `size` maps to spacing steps, and
 * caller `style` merges last so a screen can animate the box's frame without
 * forking it.
 */

export const SEARCH_BAR_HEIGHT = 48;

const sizes = {
  md: { height: SEARCH_BAR_HEIGHT, paddingHorizontal: spacing.lg },
  sm: { height: 40, paddingHorizontal: spacing.md },
} as const;

export type SearchBarHandle = Pick<TextInput, 'focus' | 'blur' | 'clear' | 'isFocused'> & {
  /**
   * The full exit: blur, empty, notify, and hold the resign-time guard. `clear`
   * is the bare `TextInput` method and does none of that, so a dismiss control
   * must use this one or the stale change slips through. Since the field draws
   * no cross of its own, this is the only way the box gets emptied.
   */
  reset: () => void;
};

type Props = Omit<TextInputProps, 'style'> & {
  value: string;
  onChangeText: (text: string) => void;
  /** Fired after `reset()` empties the field. The field also blurs itself. */
  onClear?: () => void;
  size?: keyof typeof sizes;
  style?: StyleProp<ViewStyle>;
};

export const SearchBar = forwardRef<SearchBarHandle, Props>(function SearchBar(
  { value, onChangeText, onClear, size = 'md', style, placeholder = 'Search shoes, apparel…', ...input },
  ref
) {
  const inputRef = useRef<TextInput>(null);
  /**
   * True from `reset()` being called until the field has settled. iOS emits a
   * change carrying the *old* text as the field resigns (keyboard state being
   * committed), and that event arrives after the empty string — so while
   * clearing, any non-empty change is the field talking to itself, not the user.
   */
  const clearing = useRef(false);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
    isFocused: () => inputRef.current?.isFocused() ?? false,
    reset: () => clear(),
  }));

  const handleChange = (text: string) => {
    if (clearing.current && text.length > 0) return;
    onChangeText(text);
  };

  const clear = () => {
    clearing.current = true;
    inputRef.current?.blur();
    inputRef.current?.clear();
    onChangeText('');
    onClear?.();
    // Long enough to outlive the resign-time events; far shorter than a retype.
    setTimeout(() => {
      clearing.current = false;
    }, 150);
  };

  return (
    <View style={[styles.box, sizes[size], style]}>
      <BrooksIcon name="search" size={15} color={colors.inkMuted} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityRole="search"
        selectionColor={colors.blue}
        {...input}
        style={styles.input}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.ink,
    // RN pads inputs on Android; zero it so the text sits on the icon's axis.
    paddingVertical: 0,
  },
});
