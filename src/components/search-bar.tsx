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
import { Press } from './press';
import { colors, font, spacing } from '../theme';

/**
 * The search field: a square, `#F8F8F8` box with the site's own search glyph
 * leading and a clear cross trailing once there is something to clear.
 *
 * @ref LLP 0003#brand — Square, no border, on the product-shot gray. The site's
 * header search opens a field of exactly this shape; the box is the one the
 * Browse screen drew for years as a fake (a `Press` that pushed a separate
 * screen). It is a real input now, and the one search input in the app.
 *
 * Contract per the expo-design-system rule: `size` maps to spacing steps, the
 * clear button is the only state the field draws itself (focus is the
 * keyboard's job, not a border's), and caller `style` merges last so a screen
 * can animate the box's frame without forking it.
 */

export const SEARCH_BAR_HEIGHT = 48;

const sizes = {
  md: { height: SEARCH_BAR_HEIGHT, paddingHorizontal: spacing.lg },
  sm: { height: 40, paddingHorizontal: spacing.md },
} as const;

export type SearchBarHandle = Pick<TextInput, 'focus' | 'blur' | 'clear' | 'isFocused'>;

type Props = Omit<TextInputProps, 'style'> & {
  value: string;
  onChangeText: (text: string) => void;
  /** Fired after the cross empties the field. The field also blurs itself. */
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
   * True from the cross being pressed until the field has settled. iOS emits a
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
      {value.length > 0 ? (
        <Press
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
          onPress={clear}
          style={styles.clear}
        >
          <BrooksIcon name="close" size={12} color={colors.ink} />
        </Press>
      ) : null}
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
  clear: {
    width: 28,
    height: 28,
    marginRight: -spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
