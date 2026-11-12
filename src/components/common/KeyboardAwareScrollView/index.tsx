import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  TextInput,
  View,
} from 'react-native';

type Props = ScrollViewProps & {
  /** Space left between the focused field and the keyboard. */
  keyboardOffset?: number;
};

/**
 * Keeps the active native TextInput above the keyboard. It deliberately uses
 * React Native's currently focused input so it also works with plain
 * TextInput fields, not only the shared AppInput component.
 */
export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  keyboardOffset = 20,
  onScroll,
  scrollEventThrottle,
  ...props
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const scrollY = useRef(0);
  const focusedInput = useRef<unknown>(null);
  const keyboardHeightRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const revealFocusedInput = useCallback(() => {
    const input = TextInput.State.currentlyFocusedInput?.();
    if (!input || focusedInput.current === input) {
      return;
    }

    focusedInput.current = input;
    requestAnimationFrame(() => {
      containerRef.current?.measure((_x, scrollTop, _width, scrollHeight) => {
        input.measure((_inputX, inputTop, _inputWidth, inputHeight) => {
          const visibleBottom =
            scrollTop +
            scrollHeight -
            keyboardOffset -
            (Platform.OS === 'ios' ? keyboardHeightRef.current : 0);
          const inputBottom = inputTop + inputHeight;
          if (inputBottom > visibleBottom) {
            scrollRef.current?.scrollTo({
              y: Math.max(0, scrollY.current + inputBottom - visibleBottom),
              animated: true,
            });
          } else if (inputTop < scrollTop + keyboardOffset) {
            scrollRef.current?.scrollTo({
              y: Math.max(
                0,
                scrollY.current - (scrollTop + keyboardOffset - inputTop),
              ),
              animated: true,
            });
          }
        });
      });
    });
  }, [keyboardOffset]);

  useEffect(() => {
    const updateKeyboard = (event: KeyboardEvent) => {
      keyboardHeightRef.current = event.endCoordinates.height;
      setKeyboardHeight(event.endCoordinates.height);
      focusedInput.current = null;
      // Native layout needs one frame after the keyboard animation starts.
      setTimeout(revealFocusedInput, 80);
    };
    const clearKeyboard = () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
      focusedInput.current = null;
    };
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      updateKeyboard,
    );
    const change =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardDidChangeFrame', updateKeyboard)
        : undefined;
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      clearKeyboard,
    );
    return () => {
      show.remove();
      change?.remove();
      hide.remove();
    };
  }, [revealFocusedInput]);

  useEffect(() => {
    if (!keyboardHeight) {
      return;
    }
    // Moving from one field to another does not reopen the keyboard. Checking
    // the focused control briefly while it is visible covers that transition.
    const interval = setInterval(revealFocusedInput, 120);
    return () => clearInterval(interval);
  }, [keyboardHeight, revealFocusedInput]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  };

  return (
    <View ref={containerRef} style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={[
          contentContainerStyle,
          keyboardHeight
            ? { paddingBottom: keyboardHeight + keyboardOffset }
            : null,
        ]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle ?? 16}
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  );
}
