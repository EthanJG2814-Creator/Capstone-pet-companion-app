import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTamagotchi } from '../hooks/useTamagotchi';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { COLORS } from '../utils/constants';
import { isNotEmpty } from '../utils/helpers';

export const SettingsScreen: React.FC = () => {
  const { user, userData, signOut, updateUsername } = useAuth();
  const { tamagotchi, renameTamagotchi, loading: tamagotchiLoading } =
    useTamagotchi(user?.id || null);
  const [username, setUsername] = useState(userData?.username || '');
  const [petName, setPetName] = useState(tamagotchi?.name || '');
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPetName, setSavingPetName] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => {
    if (userData?.username) {
      setUsername(userData.username);
    }
  }, [userData]);

  React.useEffect(() => {
    if (tamagotchi?.name) {
      setPetName(tamagotchi.name);
    }
  }, [tamagotchi]);

  const handleUpdateUsername = async () => {
    if (!isNotEmpty(username)) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (username === userData?.username) {
      return;
    }

    setSavingUsername(true);
    try {
      await updateUsername(username);
      Alert.alert('Success', 'Username updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update username');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleRenamePet = async () => {
    if (!tamagotchi) {
      Alert.alert('Error', 'No Tamagotchi found');
      return;
    }

    if (!isNotEmpty(petName)) {
      Alert.alert('Error', 'Pet name cannot be empty');
      return;
    }

    if (petName === tamagotchi.name) {
      return;
    }

    setSavingPetName(true);
    try {
      await renameTamagotchi(petName);
      Alert.alert('Success', 'Pet name updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to rename pet');
    } finally {
      setSavingPetName(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (tamagotchiLoading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
        Account Settings
      </Text>

      <View style={styles.section}>
        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          autoCapitalize="words"
        />
        <Button
          title="Save Username"
          onPress={handleUpdateUsername}
          loading={savingUsername}
          disabled={username === userData?.username || !isNotEmpty(username)}
          style={styles.saveButton}
        />
      </View>

      {tamagotchi && (
        <>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            Pet Settings
          </Text>

          <View style={styles.section}>
            <Input
              label="Pet Name"
              value={petName}
              onChangeText={setPetName}
              placeholder="Enter pet name"
              autoCapitalize="words"
            />
            <Button
              title="Save Pet Name"
              onPress={handleRenamePet}
              loading={savingPetName}
              disabled={petName === tamagotchi.name || !isNotEmpty(petName)}
              style={styles.saveButton}
            />
          </View>
        </>
      )}

      <View style={styles.section}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          style={styles.signOutButton}
        />
      </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: COLORS.textDark,
  },
  section: {
    marginBottom: 32,
  },
  saveButton: {
    marginTop: 12,
  },
  signOutButton: {
    marginTop: 24,
  },
});
