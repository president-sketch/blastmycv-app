import { View, Text, Pressable, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ExternalLink, ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();

  const handleOpenSite = () => {
    Linking.openURL('https://blastmycv.com');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A14' }} testID="register-screen">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0A0A14', '#111128', '#0A0A14']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      >
        {/* Logo */}
        <Text style={{ fontSize: 36, fontWeight: '800', letterSpacing: -1, marginBottom: 40 }}>
          <Text style={{ color: '#FFFFFF' }}>blastmy</Text>
          <Text style={{ color: '#FF6B35' }}>CV</Text>
        </Text>

        {/* Card */}
        <View
          style={{
            width: '100%',
            backgroundColor: '#1A1A2E',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#2A2A40',
            padding: 28,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            Create an Account
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#888899',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 28,
            }}
          >
            To get started with BlastMyCV, please register at our website. Then sign in here with your new account.
          </Text>

          <Pressable
            onPress={handleOpenSite}
            style={({ pressed }) => ({
              width: '100%',
              backgroundColor: pressed ? '#FF5520' : '#FF6B35',
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 16,
            })}
            testID="open-website-button"
          >
            <ExternalLink size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
              Register at blastmycv.com
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: '100%',
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: pressed ? '#3A3A50' : '#2A2A40',
              backgroundColor: pressed ? '#22223A' : 'transparent',
            })}
            testID="back-to-login-button"
          >
            <ArrowLeft size={16} color="#888899" />
            <Text style={{ color: '#888899', fontSize: 15, fontWeight: '500' }}>
              Back to Sign In
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
