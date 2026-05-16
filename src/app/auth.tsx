import { Redirect } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BodyText, Card, LoadingState, PrimaryButton } from '@/components/waste-ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/providers/auth-provider';

export default function AuthScreen() {
  const theme = useTheme();
  const { user, initializing, signIn, signUp } = useAuth();
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  if (initializing) {
    return <LoadingState />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  async function handleSubmit() {
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn(username, password);
      } else {
        await signUp(username, password);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to continue.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <View style={styles.brandWrap}>
        <Text style={styles.recycleMark}>♻</Text>
        <Text style={[styles.brandWaste, { color: theme.primaryDark }]}>WASTE</Text>
        <Text style={[styles.brandTo, { color: theme.primaryDark }]}>TO</Text>
        <Text style={[styles.brandValue, { color: '#4B9938' }]}>VALUE</Text>
        <Text style={[styles.tagline, { color: theme.text }]}>Turn your waste{'\n'}into rewards.</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.switchRow}>
          {(['login', 'register'] as const).map((nextMode) => (
            <Pressable
              key={nextMode}
              onPress={() => {
                setMode(nextMode);
                setError('');
              }}
              style={[
                styles.switchButton,
                { backgroundColor: mode === nextMode ? theme.primary : theme.backgroundSelected },
              ]}>
              <Text style={[styles.switchText, { color: mode === nextMode ? '#FFFFFF' : theme.text }]}>
                {nextMode === 'login' ? 'Login' : 'Register'}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username or Email"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: '#FFFFFF' }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: '#FFFFFF' }]}
        />
        {mode === 'login' ? <Text style={[styles.forgot, { color: theme.primaryDark }]}>Forgot Password?</Text> : null}
        {error ? <BodyText style={{ color: theme.danger }}>{error}</BodyText> : null}
        <PrimaryButton
          title={submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          onPress={handleSubmit}
          disabled={submitting}
        />
        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.accountLink}>
          <Text style={[styles.accountText, { color: theme.text }]}>
            {mode === 'login' ? "Don’t have an account? " : 'Already have an account? '}
            <Text style={{ color: theme.primaryDark, fontWeight: 900 }}>
              {mode === 'login' ? 'Register' : 'Login'}
            </Text>
          </Text>
        </Pressable>
      </Card>

      <View style={styles.landscape}>
        <View style={[styles.tree, styles.treeLeft]} />
        <View style={[styles.tree, styles.treeRight]} />
        <View style={[styles.bin, { backgroundColor: theme.primary }]} />
        <View style={[styles.binSmall, { backgroundColor: '#58A33F' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: 64,
    paddingBottom: Spacing.three,
  },
  brandWrap: {
    alignItems: 'center',
    gap: 0,
  },
  recycleMark: {
    fontSize: 96,
    lineHeight: 104,
    color: '#36883B',
  },
  brandWaste: {
    fontFamily: Fonts.sans,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: 900,
    letterSpacing: 2,
  },
  brandTo: {
    fontFamily: Fonts.sans,
    fontSize: 25,
    lineHeight: 25,
    fontWeight: 900,
  },
  brandValue: {
    fontFamily: Fonts.sans,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: 900,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: Fonts.sans,
    marginTop: Spacing.two,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: 600,
    textAlign: 'center',
  },
  formCard: {
    gap: Spacing.two,
    borderRadius: 12,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    boxShadow: 'none',
  },
  switchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  switchButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    fontFamily: Fonts.sans,
    fontWeight: 800,
  },
  input: {
    minHeight: 58,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: '0 2px 10px rgba(16, 46, 26, 0.06)',
  },
  forgot: {
    alignSelf: 'flex-end',
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: Spacing.two,
  },
  accountLink: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  accountText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: 600,
  },
  landscape: {
    minHeight: 130,
    borderRadius: 18,
    backgroundColor: '#DFF2D4',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  tree: {
    position: 'absolute',
    bottom: 22,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E8B3C',
  },
  treeLeft: {
    left: -8,
  },
  treeRight: {
    right: -10,
  },
  bin: {
    position: 'absolute',
    right: 36,
    bottom: 18,
    width: 60,
    height: 76,
    borderRadius: 8,
  },
  binSmall: {
    position: 'absolute',
    right: 105,
    bottom: 16,
    width: 38,
    height: 54,
    borderRadius: 6,
  },
});
