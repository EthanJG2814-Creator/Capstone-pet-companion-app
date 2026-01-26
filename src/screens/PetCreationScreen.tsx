import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTamagotchi } from '../hooks/useTamagotchi';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { COLORS, AVATAR_OPTIONS } from '../utils/constants';
import { isNotEmpty } from '../utils/helpers';

export const PetCreationScreen: React.FC = () => {
  const { user } = useAuth();
  const { createTamagotchi, loading } = useTamagotchi(user?.id || null);
  const [petName, setPetName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [error, setError] = useState<string>('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleCreate = async () => {
    if (!isNotEmpty(petName)) {
      setError('Please enter a name for your Tamagotchi');
      return;
    }

    setError('');
    try {
      await createTamagotchi(petName, selectedAvatar);
      // Navigation will be handled by the navigation logic checking if pet exists
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create Tamagotchi');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating your Tamagotchi..." />;
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Create Your Tamagotchi
      </Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        Give your pet a name and choose an avatar
      </Text>

      <Input
        label="Pet Name"
        value={petName}
        onChangeText={(text) => {
          setPetName(text);
          setError('');
        }}
        placeholder="Enter your pet's name"
        error={error}
        autoCapitalize="words"
      />

      <View style={styles.avatarSection}>
        <Text style={[styles.avatarLabel, isDark && styles.avatarLabelDark]}>
          Choose Avatar
        </Text>
        <View style={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((avatar) => (
            <TouchableOpacity
              key={avatar}
              style={[
                styles.avatarOption,
                selectedAvatar === avatar && styles.avatarOptionSelected,
                isDark && styles.avatarOptionDark,
              ]}
              onPress={() => setSelectedAvatar(avatar)}
            >
              <Text style={styles.avatarEmoji}>{avatar}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button
        title="Create Tamagotchi"
        onPress={handleCreate}
        disabled={!isNotEmpty(petName)}
        style={styles.createButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  titleDark: {
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  subtitleDark: {
    color: COLORS.textSecondaryDark,
  },
  avatarSection: {
    marginVertical: 24,
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  avatarLabelDark: {
    color: COLORS.textDark,
  },
  avatarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  avatarOptionDark: {
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.backgroundDark,
  },
  avatarOptionSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  createButton: {
    marginTop: 16,
  },
});
