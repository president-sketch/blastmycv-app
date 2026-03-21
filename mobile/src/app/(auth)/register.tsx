import { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../lib/state/auth-store';
import { registerUser } from '../../lib/api/blastmycv-api';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const update = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const registerMutation = useMutation({
    mutationFn: () =>
      registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      }),
    onSuccess: (result) => {
      setAuth(result.sessionCookie, result.user);
    },
  });

  const canSubmit =
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.email.trim() !== '' &&
    form.password !== '' &&
    form.confirmPassword !== '' &&
    !registerMutation.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A14' }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0A0A14', '#111128', '#0A0A14']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 32 }}>
              <Pressable
                onPress={() => router.back()}
                testID="back-button"
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </Pressable>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Create Account</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>Join BlastMyCV today</Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: 24 }}>

              {/* Error */}
              {registerMutation.isError ? (
                <View testID="error-message" style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 12,
                  borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
                  padding: 14, marginBottom: 20,
                }}>
                  <AlertCircle size={18} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 14, flex: 1 }}>
                    {registerMutation.error instanceof Error ? registerMutation.error.message : 'Registration failed.'}
                  </Text>
                </View>
              ) : null}

              {/* Name row */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                {(['firstName', 'lastName'] as const).map((field) => (
                  <View key={field} style={{ flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
                      {field === 'firstName' ? 'First Name' : 'Last Name'}
                    </Text>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center',
                      backgroundColor: '#1A1A2E', borderRadius: 14,
                      borderWidth: 1, borderColor: '#2A2A40',
                      paddingHorizontal: 12, height: 50,
                    }}>
                      <User size={16} color="#FF6B35" />
                      <TextInput
                        value={form[field]}
                        onChangeText={update(field)}
                        placeholder={field === 'firstName' ? 'John' : 'Doe'}
                        placeholderTextColor="#444466"
                        autoCapitalize="words"
                        testID={`${field}-input`}
                        style={{ flex: 1, color: '#FFFFFF', fontSize: 15, marginLeft: 8 }}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Email */}
              <FieldInput label="Email" icon={<Mail size={18} color="#FF6B35" />} value={form.email} onChangeText={update('email')} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" testID="email-input" />

              {/* Phone */}
              <FieldInput label="Phone" icon={<Phone size={18} color="#FF6B35" />} value={form.phone} onChangeText={update('phone')} placeholder="+1 234 567 890" keyboardType="phone-pad" testID="phone-input" />

              {/* Password */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Password</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#1A1A2E', borderRadius: 14,
                  borderWidth: 1, borderColor: '#2A2A40',
                  paddingHorizontal: 16, height: 54,
                }}>
                  <Lock size={18} color="#FF6B35" />
                  <TextInput
                    value={form.password}
                    onChangeText={update('password')}
                    placeholder="Create a password"
                    placeholderTextColor="#444466"
                    secureTextEntry={!showPassword}
                    testID="password-input"
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} color="#666688" /> : <Eye size={18} color="#666688" />}
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Confirm Password</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#1A1A2E', borderRadius: 14,
                  borderWidth: 1, borderColor: form.confirmPassword !== '' && form.confirmPassword !== form.password ? 'rgba(239,68,68,0.5)' : '#2A2A40',
                  paddingHorizontal: 16, height: 54,
                }}>
                  <Lock size={18} color={form.confirmPassword !== '' && form.confirmPassword !== form.password ? '#EF4444' : '#FF6B35'} />
                  <TextInput
                    value={form.confirmPassword}
                    onChangeText={update('confirmPassword')}
                    placeholder="Repeat your password"
                    placeholderTextColor="#444466"
                    secureTextEntry={!showPassword}
                    testID="confirm-password-input"
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}
                  />
                </View>
                {form.confirmPassword !== '' && form.confirmPassword !== form.password ? (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>Passwords do not match</Text>
                ) : null}
              </View>

              {/* Submit */}
              <Pressable
                onPress={() => registerMutation.mutate()}
                disabled={!canSubmit}
                testID="register-submit-button"
                style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}
              >
                <LinearGradient
                  colors={canSubmit ? ['#FF6B35', '#E55520'] : ['#553322', '#442211']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: 54, alignItems: 'center', justifyContent: 'center' }}
                >
                  {registerMutation.isPending
                    ? <ActivityIndicator color="#FFFFFF" testID="loading-indicator" />
                    : <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Create Account</Text>
                  }
                </LinearGradient>
              </Pressable>

              <Pressable onPress={() => router.back()} style={{ alignItems: 'center', marginBottom: 40 }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  Already have an account?{' '}
                  <Text style={{ color: '#FF6B35', fontWeight: '600' }}>Sign in</Text>
                </Text>
              </Pressable>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

interface FieldInputProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  testID?: string;
}

function FieldInput({ label, icon, value, onChangeText, placeholder, keyboardType = 'default', autoCapitalize = 'none', testID }: FieldInputProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>{label}</Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A1A2E', borderRadius: 14,
        borderWidth: 1, borderColor: '#2A2A40',
        paddingHorizontal: 16, height: 54,
      }}>
        {icon}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#444466"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          testID={testID}
          style={{ flex: 1, color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}
        />
      </View>
    </View>
  );
}
