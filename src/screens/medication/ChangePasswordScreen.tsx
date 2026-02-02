import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import { isNotEmpty } from '../../utils/helpers';

export const ChangePasswordScreen: React.FC = () => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!isNotEmpty(newPassword)) {
      Alert.alert('Error', 'New password is required');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changePassword(newPassword);
      Alert.alert('Success', 'Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      Alert.alert('Error', (e as Error)?.message ?? 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Change password</Text>
      <Input label="New password" value={newPassword} onChangeText={setNewPassword} placeholder="At least 6 characters" secureTextEntry autoCapitalize="none" />
      <Input label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm" secureTextEntry autoCapitalize="none" />
      <Button title="Update password" onPress={handleSave} loading={saving} disabled={!isNotEmpty(newPassword) || newPassword !== confirmPassword} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  btn: { marginTop: 16 },
});
