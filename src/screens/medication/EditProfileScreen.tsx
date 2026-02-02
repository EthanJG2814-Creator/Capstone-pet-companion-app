import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import { isNotEmpty } from '../../utils/helpers';

export const EditProfileScreen: React.FC = () => {
  const { userData, updateUsername } = useAuth();
  const [username, setUsername] = useState(userData?.username ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData?.username) setUsername(userData.username);
  }, [userData]);

  const handleSave = async () => {
    if (!isNotEmpty(username)) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateUsername(username);
      Alert.alert('Saved', 'Profile updated.');
    } catch (e) {
      Alert.alert('Error', (e as Error)?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit profile</Text>
      <Input label="Username" value={username} onChangeText={setUsername} placeholder="Username" autoCapitalize="none" />
      <Button title="Save" onPress={handleSave} loading={saving} disabled={!isNotEmpty(username)} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  btn: { marginTop: 16 },
});
