import React from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { COLORS } from '../utils/constants';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          isDark && styles.inputDark,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? COLORS.textSecondaryDark : COLORS.textSecondary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: COLORS.text,
  },
  labelDark: {
    color: COLORS.textDark,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  inputDark: {
    borderColor: COLORS.borderDark,
    color: COLORS.textDark,
    backgroundColor: COLORS.backgroundDark,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
});
