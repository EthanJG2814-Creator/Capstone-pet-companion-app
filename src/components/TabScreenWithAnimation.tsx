import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_DISTANCE = SCREEN_WIDTH * 0.06;
const DURATION = 220;

let previousTabIndex = -1;

interface TabScreenWithAnimationProps {
  children: React.ReactNode;
  tabIndex: number;
}

/**
 * Wraps tab screen content with a direction-aware slide animation.
 * Slides from the right when moving to a tab on the right, from the left when moving left.
 * Uses timing (no bounce) for a subtle, smooth feel.
 */
export function TabScreenWithAnimation({ children, tabIndex }: TabScreenWithAnimationProps) {
  const navigation = useNavigation();
  const translateX = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      const state = navigation.getParent?.()?.getState?.() ?? navigation.getState?.();
      const currentIndex = typeof state?.index === 'number' ? state.index : tabIndex;

      const fromRight = currentIndex > previousTabIndex;
      const fromLeft = currentIndex < previousTabIndex;

      const startX = fromRight ? SLIDE_DISTANCE : fromLeft ? -SLIDE_DISTANCE : 0;
      translateX.value = startX;

      translateX.value = withTiming(0, {
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
      });

      previousTabIndex = currentIndex;

      return () => {};
    }, [navigation, tabIndex, translateX])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
