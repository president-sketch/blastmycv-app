import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bell, Package, Send, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getNotifications } from '../lib/api/blastmycv-api';
import type { Notification } from '../lib/types/blastmycv';

function timeAgo(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  order:      <Package size={18} color="#FF6B35" />,
  submission: <Send size={18} color="#3B82F6" />,
  system:     <Info size={18} color="#F59E0B" />,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const unreadCount = data?.filter((n: Notification) => !n.isRead).length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A14' }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}>
          <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center', marginRight: 14 }} testID="back-button">
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>Notifications</Text>
            {data ? <Text style={{ color: '#888899', fontSize: 12, marginTop: 1 }}>{unreadCount} unread</Text> : null}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF6B35" />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          testID="notifications-screen"
        >
          {isLoading ? <ActivityIndicator color="#FF6B35" style={{ marginTop: 40 }} testID="loading-indicator" /> : null}

          {isError ? (
            <View style={{ alignItems: 'center', marginTop: 60 }} testID="error-view">
              <Text style={{ color: '#EF4444', fontSize: 15, marginBottom: 12 }}>Failed to load notifications</Text>
              <TouchableOpacity onPress={() => refetch()} style={{ backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!isLoading && !isError && data?.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Bell size={48} color="#2A2A40" style={{ marginBottom: 16 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', marginBottom: 8 }}>No notifications</Text>
              <Text style={{ color: '#888899', fontSize: 14, textAlign: 'center' }}>You're all caught up!</Text>
            </View>
          ) : null}

          {data?.map((notif: Notification) => (
            <View key={notif.id} style={{
              backgroundColor: notif.isRead ? '#1A1A2E' : '#1E1A2E',
              borderRadius: 14, padding: 14, marginBottom: 10,
              borderWidth: 1, borderColor: notif.isRead ? '#2A2A40' : '#3A2A50',
              flexDirection: 'row', gap: 12,
            }}>
              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#0D0D1E', alignItems: 'center', justifyContent: 'center' }}>
                {TYPE_ICON[notif.type] ?? <Bell size={18} color="#888899" />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 }}>{notif.title}</Text>
                  <Text style={{ color: '#666688', fontSize: 11 }}>{timeAgo(notif.createdAt)}</Text>
                </View>
                <Text style={{ color: '#888899', fontSize: 13, lineHeight: 18 }}>{notif.message}</Text>
              </View>
              {notif.isRead ? null : <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FF6B35', position: 'absolute', top: 14, right: 14 }} />}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
