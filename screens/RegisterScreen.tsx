import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Surface, Snackbar } from 'react-native-paper';
import { register } from './authHelper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// GOLD-WHITE THEME COLORS
const GOLD = "#B88908";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const DARK_TEXT = "#232323";
const ACCENT = "#6c47ff";

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'info' | 'error' });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      setSnackbar({ visible: true, message: 'Please enter email and password.', type: 'error' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setSnackbar({ visible: true, message: 'Invalid email address.', type: 'error' });
      return false;
    }
    if (password.length < 6) {
      setSnackbar({ visible: true, message: 'Password must be at least 6 characters.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError('');
    Keyboard.dismiss();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register(email, password);
      setSnackbar({ visible: true, message: 'Registration successful! Redirecting...', type: 'info' });
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, 900);
    } catch (err) {
      let msg = 'Registration failed';
      if (err && typeof err === 'object' && 'message' in err) {
        msg = (err as { message: string }).message;
      }
      setSnackbar({ visible: true, message: msg, type: 'error' });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
          <Image
            source={require('../assets/images/metanoia-logo.png')}
            style={{ width: 90, height: 90, marginBottom: 6 }}
            resizeMode="contain"
          />
          <Text style={styles.title}>Join Metanoia!</Text>
          <Text style={styles.subtitle}>Create a new account</Text>
        </View>
        <Surface style={styles.surface}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
            outlineColor={GOLD}
            activeOutlineColor={GOLD}
            textColor={DARK_TEXT}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
            left={<TextInput.Icon icon="email" color={GOLD} />}
            disabled={loading}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            style={styles.input}
            mode="outlined"
            outlineColor={GOLD}
            activeOutlineColor={GOLD}
            textColor={DARK_TEXT}
            autoComplete="password"
            returnKeyType="done"
            left={<TextInput.Icon icon="lock" color={GOLD} />}
            right={
              <TextInput.Icon
                icon={secure ? "eye-off" : "eye"}
                onPress={() => setSecure((prev) => !prev)}
                forceTextInputFocus={false}
              />
            }
            disabled={loading}
          />
          <Button
            mode="contained"
            onPress={handleRegister}
            buttonColor={GOLD}
            textColor={WHITE}
            style={styles.registerBtn}
            loading={loading}
            disabled={loading}
            icon="account-plus"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
          <Button
            mode="text"
            style={styles.loginBtn}
            textColor={GOLD}
            onPress={() => navigation.replace('Login')}
            disabled={loading}
          >
            Already have an account? Login
          </Button>
        </Surface>
        <View style={{ flex: 1 }} />
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={2200}
          style={{
            backgroundColor: snackbar.type === "error" ? "#b92c2c" : ACCENT,
          }}
        >
          {snackbar.message}
        </Snackbar>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: WHITE },
  title: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 2,
  },
  subtitle: {
    color: DARK_TEXT,
    fontSize: 16,
    marginBottom: 10,
  },
  surface: {
    backgroundColor: CARD_BG,
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 22,
    elevation: 4,
    shadowColor: GOLD,
  },
  input: {
    marginBottom: 16,
    backgroundColor: WHITE,
    borderRadius: 10,
  },
  registerBtn: {
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 8,
    marginTop: 2,
  },
  loginBtn: {
    marginTop: 6,
  },
  errorText: {
    color: '#b92c2c',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
});