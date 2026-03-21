import { Tabs, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { Home, FileText, Zap, Package, User } from 'lucide-react-native';
import { useAuthStore } from '../../lib/state/auth-store';

function TabIcon({ focused, icon, label }: { focused: boolean; icon: React.ReactNode; label: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <View style={{ opacity: focused ? 1 : 0.4 }}>{icon}</View>
      <Text style={{ fontSize: 10, fontWeight: focused ? '600' : '400', color: focused ? '#FF6B35' : '#888899', marginTop: 3 }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0D0D1E', borderTopColor: '#1E1E30', borderTopWidth: 1, height: 80, paddingBottom: 16, paddingTop: 8 },
      tabBarShowLabel: false,
    }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={<Home size={22} color={focused ? '#FF6B35' : '#888899'} />} label="Home" /> }} />
      <Tabs.Screen name="cvs" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={<FileText size={22} color={focused ? '#FF6B35' : '#888899'} />} label="My CVs" /> }} />
      <Tabs.Screen name="blast" options={{ tabBarIcon: ({ focused }) => (
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: focused ? '#FF6B35' : '#1A1A2E', alignItems: 'center', justifyContent: 'center', marginBottom: 2, borderWidth: focused ? 0 : 1, borderColor: '#2A2A40' }}>
            <Zap size={24} color={focused ? '#FFFFFF' : '#888899'} fill={focused ? '#FFFFFF' : 'none'} />
          </View>
          <Text style={{ fontSize: 10, fontWeight: '600', color: focused ? '#FF6B35' : '#888899' }}>Blast</Text>
        </View>
      )}} />
      <Tabs.Screen name="orders" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={<Package size={22} color={focused ? '#FF6B35' : '#888899'} />} label="Orders" /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={<User size={22} color={focused ? '#FF6B35' : '#888899'} />} label="Profile" /> }} />
      <Tabs.Screen name="two" options={{ href: null }} />
      <Tabs.Screen name="jobs" options={{ href: null }} />
      <Tabs.Screen name="applications" options={{ href: null }} />
      <Tabs.Screen name="cv" options={{ href: null }} />
    </Tabs>
  );
}
