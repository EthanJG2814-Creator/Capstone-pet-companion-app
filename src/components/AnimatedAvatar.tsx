import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StatAction } from '../types';

interface AnimatedAvatarProps {
  avatar: string;
  name: string;
  actionTrigger: StatAction | null;
  onAnimationComplete?: () => void;
  isDark?: boolean;
}

const springConfig = { damping: 12, stiffness: 150 };
const springBouncy = { damping: 8, stiffness: 120 };

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  avatar,
  name,
  actionTrigger,
  onAnimationComplete,
  isDark = false,
}) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!actionTrigger) return;

    switch (actionTrigger) {
      case 'feed': {
        // Munch / eating: quick scale up then down (2 bounces)
        scale.value = withSequence(
          withSpring(1.25, springBouncy),
          withSpring(0.95, springConfig),
          withSpring(1.1, springConfig),
          withSpring(1, springConfig)
        );
        break;
      }
      case 'play': {
        // Excited: multiple bounces with a little wiggle
        scale.value = withSequence(
          withSpring(1.3, springBouncy),
          withSpring(1, springConfig)
        );
        rotate.value = withSequence(
          withTiming(5, { duration: 80 }),
          withTiming(-5, { duration: 80 }),
          withTiming(5, { duration: 80 }),
          withTiming(0, { duration: 80 })
        );
        break;
      }
      case 'sleep': {
        // Gentle pulse: slow, soft scale down and up (dozing)
        scale.value = withSequence(
          withTiming(0.92, { duration: 400 }),
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 300 })
        );
        break;
      }
    }

    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 1200);

    return () => clearTimeout(timer);
  }, [actionTrigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <View style={[styles.avatarCard, isDark && styles.avatarCardDark]}>
      <Animated.View style={[styles.avatarWrapper, animatedStyle]}>
        <Text style={styles.avatarEmoji}>{avatar}</Text>
      </Animated.View>
      <Text style={[styles.petName, isDark && styles.petNameDark]}>
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarCard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: '#5b21b6',
  },
  avatarCardDark: {
    backgroundColor: '#4c1d95',
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 100,
    marginBottom: 12,
  },
  petName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  petNameDark: {
    color: '#fff',
  },
});
