import { Tabs, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { Home, Briefcase, FileText, User, Search } from 'lucide-react-native';
import { useAuthStore } from '../../lib/state/auth-store';

interface TabIconProps {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
}

function TabIcon({ focused, icon, label }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <View style={{ opacity: focused ? 1 : 0.45 }}>{icon}</View>
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '600' : '400',
          color: focused ? '#FF6B35' : '#888899',
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0D1E',
          borderTopColor: '#1E1E30',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<Home size={22} color={focused ? '#FF6B35' : '#888899'} />}
              label="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<Search size={22} color={focused ? '#FF6B35' : '#888899'} />}
              label="Jobs"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<Briefcase size={22} color={focused ? '#FF6B35' : '#888899'} />}
              label="Applied"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cv"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<FileText size={22} color={focused ? '#FF6B35' : '#888899'} />}
              label="My CV"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<User size={22} color={focused ? '#FF6B35' : '#888899'} />}
              label="Profile"
            />
          ),
        }}
      />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
