import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { useAuthStore } from '../../lib/state/auth-store';
import { loginUser } from '../../lib/api/blastmycv-api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email.trim().toLowerCase(), password);
      setAuth(result.token, result.user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid email or password. Please try again.';
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="items-center pt-20 pb-8">
              <View className="mb-6">
                <Text style={{ fontSize: 36, fontWeight: '800', letterSpacing: -1 }}>
                  <Text style={{ color: '#FFFFFF' }}>blastmy</Text>
                  <Text style={{ color: '#FF6B35' }}>CV</Text>
                </Text>
              </View>
              <Text className="text-white/60 text-base text-center px-8">
                Sign in with your BlastMyCV account
              </Text>
            </View>

            {/* Form */}
            <View className="px-6 pt-4">
              {/* Email */}
              <View className="mb-4">
                <Text className="text-white/70 text-sm font-medium mb-2 ml-1">Email</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1A1A2E',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#2A2A40',
                    paddingHorizontal: 16,
                    height: 54,
                  }}
                >
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
                    style={{
                      flex: 1,
                      color: '#FFFFFF',
                      fontSize: 16,
                      marginLeft: 12,
                    }}
                  />
                </View>
              </View>

              {/* Password */}
              <View className="mb-6">
                <Text className="text-white/70 text-sm font-medium mb-2 ml-1">Password</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1A1A2E',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#2A2A40',
                    paddingHorizontal: 16,
                    height: 54,
                  }}
                >
                  <Lock size={18} color="#FF6B35" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor="#444466"
                    secureTextEntry={!showPassword}
                    testID="password-input"
                    style={{
                      flex: 1,
                      color: '#FFFFFF',
                      fontSize: 16,
                      marginLeft: 12,
                    }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7} testID="toggle-password">
                    {showPassword ? (
                      <EyeOff size={18} color="#666688" />
                    ) : (
                      <Eye size={18} color="#666688" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                testID="login-button"
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  marginBottom: 20,
                }}
              >
                <LinearGradient
                  colors={['#FF6B35', '#E55520']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 54,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" testID="loading-indicator" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
                      Sign In
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity className="items-center mb-8" activeOpacity={0.7} testID="forgot-password">
                <Text style={{ color: '#FF6B35', fontSize: 14, fontWeight: '500' }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A40' }} />
                <Text style={{ color: '#444466', marginHorizontal: 12, fontSize: 13 }}>
                  Don't have an account?
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A40' }} />
              </View>

              {/* Sign Up Link */}
              <View className="items-center mb-10">
                <Text className="text-white/50 text-sm text-center">
                  Register at{' '}
                  <Text style={{ color: '#FF6B35', fontWeight: '600' }}>
                    blastmycv.com
                  </Text>
                  {' '}and sign in here.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
