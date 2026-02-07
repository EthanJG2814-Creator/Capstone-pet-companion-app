import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useTamagotchiContext } from '../contexts/TamagotchiContext';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { COLORS } from '../utils/constants';
import { isNotEmpty } from '../utils/helpers';
import type { ThemeMode } from '../contexts/ThemeContext';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, userData, signOut, updateUsername } = useAuth();
  const { tamagotchi, renameTamagotchi, loading: tamagotchiLoading } =
    useTamagotchiContext();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const [username, setUsername] = useState(userData?.username || '');
  const [petName, setPetName] = useState(tamagotchi?.name || '');
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPetName, setSavingPetName] = useState(false);

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

  const goToEditProfile = () => navigation.navigate('EditProfileScreen');
  const goToChangePassword = () => navigation.navigate('ChangePasswordScreen');
  const goToScheduleSettings = () => navigation.navigate('ScheduleSettings');
  const goToMedications = () => navigation.navigate('Main', { screen: 'Medications' });

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.centeredContent}>
        <Text style={[styles.sectionTitle, styles.sectionTitleFirst, isDark && styles.sectionTitleDark]}>
          Medication & account
        </Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingsRow} onPress={goToEditProfile} activeOpacity={0.7}>
            <Text style={[styles.settingsRowText, isDark && styles.settingsRowTextDark]}>Edit profile</Text>
            <Text style={styles.settingsRowArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={goToChangePassword} activeOpacity={0.7}>
            <Text style={[styles.settingsRowText, isDark && styles.settingsRowTextDark]}>Change password</Text>
            <Text style={styles.settingsRowArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={goToScheduleSettings} activeOpacity={0.7}>
            <Text style={[styles.settingsRowText, isDark && styles.settingsRowTextDark]}>Schedule settings</Text>
            <Text style={styles.settingsRowArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={goToMedications} activeOpacity={0.7}>
            <Text style={[styles.settingsRowText, isDark && styles.settingsRowTextDark]}>Medications</Text>
            <Text style={styles.settingsRowArrow}>→</Text>
          </TouchableOpacity>
        </View>

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

        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Appearance
        </Text>
        <View style={styles.themeRow}>
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.themeOption,
                themeMode === mode && styles.themeOptionSelected,
                isDark && styles.themeOptionDark,
                themeMode === mode && isDark && styles.themeOptionSelectedDark,
              ]}
              onPress={() => setThemeMode(mode)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  isDark && styles.themeOptionTextDark,
                  themeMode === mode && styles.themeOptionTextSelected,
                ]}
              >
                {mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'System'}
              </Text>
            </TouchableOpacity>
          ))}
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  centeredContent: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitleDark: {
    color: COLORS.textDark,
  },
  sectionTitleFirst: {
    marginTop: 0,
  },
  section: {
    marginBottom: 32,
    width: '100%',
  },
  saveButton: {
    marginTop: 12,
  },
  signOutButton: {
    marginTop: 24,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  themeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.cardLight,
    minWidth: 90,
    alignItems: 'center',
  },
  themeOptionDark: {
    backgroundColor: COLORS.cardLightDark,
  },
  themeOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  themeOptionSelectedDark: {
    backgroundColor: COLORS.primary,
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  themeOptionTextDark: {
    color: COLORS.textSecondaryDark,
  },
  themeOptionTextSelected: {
    color: '#fff',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    width: '100%',
  },
  settingsRowText: { fontSize: 16, color: COLORS.text },
  settingsRowTextDark: { color: COLORS.textDark },
  settingsRowArrow: { fontSize: 16, color: COLORS.textSecondary },
});
