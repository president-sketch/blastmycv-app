import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Briefcase,
  Eye,
  Crosshair,
  Calendar,
  CheckCircle,
  UserCheck,
  Sparkles,
  FileEdit,
  Search,
} from 'lucide-react-native';
import { useAuthStore } from '../../lib/state/auth-store';

const stats = {
  applications: 12,
  profileViews: 89,
  jobMatches: 34,
  interviews: 2,
};

const recentActivity = [
  { id: '1', icon: 'apply', title: 'Applied to Senior Developer', company: 'TechCorp UK', time: '2h ago' },
  { id: '2', icon: 'view', title: 'Profile viewed', company: 'Digital Agency Ltd', time: '5h ago' },
  { id: '3', icon: 'match', title: 'New job match', company: 'StartupXYZ', time: '1d ago' },
];

function ActivityDot({ icon }: { icon: string }) {
  const colors: Record<string, string> = {
    apply: '#FF6B35',
    view: '#3B82F6',
    match: '#22C55E',
  };
  const color = colors[icon] ?? '#888899';
  const IconComponent = icon === 'apply' ? CheckCircle : icon === 'view' ? UserCheck : Sparkles;
  return (
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: color + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconComponent size={18} color={color} />
    </View>
  );
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? user?.name?.split(' ')[0] ?? 'there';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#0A0A14' }}
      testID="dashboard-screen"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 }}>
            blastmy<Text style={{ color: '#FF6B35' }}>CV</Text>
          </Text>
          <Pressable
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#1A1A2E',
              borderWidth: 1,
              borderColor: '#2A2A40',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            testID="notification-bell"
          >
            <Bell size={18} color="#888899" />
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 }}>
            {getGreeting()}, {firstName}!
          </Text>
          <Text style={{ fontSize: 14, color: '#888899' }}>Your career at a glance</Text>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#1A1A2E',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#2A2A40',
                padding: 16,
              }}
            >
              <Briefcase size={22} color="#FF6B35" />
              <Text style={{ fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginTop: 10, marginBottom: 2 }}>
                {stats.applications}
              </Text>
              <Text style={{ fontSize: 12, color: '#888899' }}>Applications</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#1A1A2E',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#2A2A40',
                padding: 16,
              }}
            >
              <Eye size={22} color="#FF6B35" />
              <Text style={{ fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginTop: 10, marginBottom: 2 }}>
                {stats.profileViews}
              </Text>
              <Text style={{ fontSize: 12, color: '#888899' }}>Profile Views</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#1A1A2E',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#2A2A40',
                padding: 16,
              }}
            >
              <Crosshair size={22} color="#FF6B35" />
              <Text style={{ fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginTop: 10, marginBottom: 2 }}>
                {stats.jobMatches}
              </Text>
              <Text style={{ fontSize: 12, color: '#888899' }}>Job Matches</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#1A1A2E',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#2A2A40',
                padding: 16,
              }}
            >
              <Calendar size={22} color="#FF6B35" />
              <Text style={{ fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginTop: 10, marginBottom: 2 }}>
                {stats.interviews}
              </Text>
              <Text style={{ fontSize: 12, color: '#888899' }}>Interviews</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 }}>
            Recent Activity
          </Text>
          <View
            style={{
              backgroundColor: '#1A1A2E',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#2A2A40',
              overflow: 'hidden',
            }}
          >
            {recentActivity.map((item, index) => (
              <View key={item.id}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    gap: 12,
                  }}
                >
                  <ActivityDot icon={item.icon} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#888899' }}>{item.company}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#555566' }}>{item.time}</Text>
                </View>
                {index < recentActivity.length - 1 ? (
                  <View style={{ height: 1, backgroundColor: '#2A2A40', marginHorizontal: 16 }} />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? '#FF5520' : '#FF6B35',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              })}
              testID="update-cv-button"
            >
              <FileEdit size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Update CV</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? '#FF6B3522' : '#FF6B3515',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: '#FF6B3560',
              })}
              testID="browse-jobs-button"
            >
              <Search size={18} color="#FF6B35" />
              <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 15 }}>Browse Jobs</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
