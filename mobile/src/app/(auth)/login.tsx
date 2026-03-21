import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../lib/state/auth-store';
import { loginUser } from '../../lib/api/blastmycv-api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: () => loginUser(email.trim().toLowerCase(), password),
    onSuccess: (result) => {
      setAuth(result.sessionCookie, result.user);
    },
  });

  function handleLogin() {
    if (!email.trim() || !password.trim()) return;
    loginMutation.mutate();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A14' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0A0A14', '#111128', '#0A0A14']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Logo */}
            <View style={{ alignItems: 'center', paddingTop: 80, paddingBottom: 40 }}>
              <Text style={{ fontSize: 38, fontWeight: '800', letterSpacing: -1 }}>
                <Text style={{ color: '#FFFFFF' }}>blastmy</Text>
                <Text style={{ color: '#FF6B35' }}>CV</Text>
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8, fontSize: 15 }}>
                Sign in to your account
              </Text>
            </View>

            <View style={{ paddingHorizontal: 24 }}>

              {/* Error message */}
              {loginMutation.isError ? (
                <View testID="error-message" style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 12,
                  borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
                  padding: 14, marginBottom: 20,
                }}>
                  <AlertCircle size={18} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 14, flex: 1 }}>
                    {loginMutation.error instanceof Error ? loginMutation.error.message : 'Login failed. Please try again.'}
                  </Text>
                </View>
              ) : null}

              {/* Email */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Email</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#1A1A2E', borderRadius: 14,
                  borderWidth: 1, borderColor: '#2A2A40',
                  paddingHorizontal: 16, height: 54,
                }}>
                  <Mail size={18} color="#FF6B35" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="#444466"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="email-input"
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Password</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#1A1A2E', borderRadius: 14,
                  borderWidth: 1, borderColor: '#2A2A40',
                  paddingHorizontal: 16, height: 54,
                }}>
                  <Lock size={18} color="#FF6B35" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor="#444466"
                    secureTextEntry={!showPassword}
                    onSubmitEditing={handleLogin}
                    testID="password-input"
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} testID="toggle-password">
                    {showPassword ? <EyeOff size={18} color="#666688" /> : <Eye size={18} color="#666688" />}
                  </Pressable>
                </View>
              </View>

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={loginMutation.isPending || !email.trim() || !password.trim()}
                testID="login-button"
                style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}
              >
                <LinearGradient
                  colors={loginMutation.isPending || !email.trim() || !password.trim()
                    ? ['#553322', '#442211']
                    : ['#FF6B35', '#E55520']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 54, alignItems: 'center', justifyContent: 'center' }}
                >
                  {loginMutation.isPending
                    ? <ActivityIndicator color="#FFFFFF" testID="loading-indicator" />
                    : <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Sign In</Text>
                  }
                </LinearGradient>
              </Pressable>

              {/* Forgot Password */}
              <Pressable style={{ alignItems: 'center', marginBottom: 32 }} testID="forgot-password">
                <Text style={{ color: '#FF6B35', fontSize: 14, fontWeight: '500' }}>Forgot password?</Text>
              </Pressable>

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A40' }} />
                <Text style={{ color: '#444466', marginHorizontal: 14, fontSize: 13 }}>New to BlastMyCV?</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A40' }} />
              </View>

              {/* Register Button */}
              <Pressable
                onPress={() => router.push('/(auth)/register')}
                testID="register-button"
                style={{
                  borderRadius: 14, borderWidth: 1.5, borderColor: '#2A2A40',
                  height: 54, alignItems: 'center', justifyContent: 'center', marginBottom: 40,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Create Account</Text>
              </Pressable>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
