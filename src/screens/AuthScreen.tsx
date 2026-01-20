import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { COLORS } from '../utils/constants';
import { isValidEmail, isNotEmpty } from '../utils/helpers';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && !isNotEmpty(username)) {
      newErrors.username = 'Username cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {isSignUp
              ? 'Start caring for your Tamagotchi'
              : 'Sign in to continue'}
          </Text>

          {isSignUp && (
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              error={errors.username}
              autoCapitalize="words"
            />
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />

          <Button
            title={isSignUp ? 'Sign Up' : 'Sign In'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />

          <View style={styles.switchContainer}>
            <Text style={[styles.switchText, isDark && styles.switchTextDark]}>
              {isSignUp
                ? 'Already have an account? '
                : "Don't have an account? "}
            </Text>
            <Text
              style={[styles.switchLink, isDark && styles.switchLinkDark]}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
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
  submitButton: {
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  switchTextDark: {
    color: COLORS.textSecondaryDark,
  },
  switchLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  switchLinkDark: {
    color: COLORS.primaryLight,
  },
});
