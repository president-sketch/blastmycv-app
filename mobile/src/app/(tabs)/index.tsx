import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Bell, Package, FileText, Zap, ChevronRight, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react-native';
import { useAuthStore } from '../../lib/state/auth-store';
import { getOrders, getNotifications, getCVs } from '../../lib/api/blastmycv-api';
import type { Order, Notification } from '../../lib/types/blastmycv';

const STATUS_COLOR: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  completed: '#22C55E',
  failed: '#EF4444',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock size={14} color="#F59E0B" />,
  processing: <Loader size={14} color="#3B82F6" />,
  completed: <CheckCircle size={14} color="#22C55E" />,
  failed: <AlertCircle size={14} color="#EF4444" />,
};

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const { data: notifications, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const { data: cvs, refetch: refetchCVs } = useQuery({
    queryKey: ['cvs'],
    queryFn: getCVs,
  });

  const unread = notifications?.filter((n: Notification) => !n.isRead).length ?? 0;
  const recentOrders = orders?.slice(0, 3) ?? [];
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';

  function onRefresh() {
    refetchOrders();
    refetchNotifs();
    refetchCVs();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A14' }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={ordersLoading} onRefresh={onRefresh} tintColor="#FF6B35" />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Welcome back,</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2 }}>
                <Text style={{ color: '#FFFFFF' }}>blastmy</Text>
                <Text style={{ color: '#FF6B35' }}>CV</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A40' }}
              testID="notification-bell"
            >
              <Bell size={20} color="#FFFFFF" />
              {unread > 0 ? (
                <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B35' }} />
              ) : null}
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>
              Hello, {firstName}! 👋
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginTop: 4 }}>
              Ready to blast your CV today?
            </Text>
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 28 }}>
            <StatCard label="Orders" value={orders?.length ?? 0} icon={<Package size={18} color="#FF6B35" />} loading={ordersLoading} />
            <StatCard label="CVs" value={cvs?.length ?? 0} icon={<FileText size={18} color="#3B82F6" />} />
            <StatCard label="Alerts" value={unread} icon={<Bell size={18} color="#F59E0B" />} />
          </View>

          {/* Blast CTA */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/blast')} activeOpacity={0.9} style={{ marginHorizontal: 20, marginBottom: 28 }} testID="blast-cv-button">
            <LinearGradient
              colors={['#FF6B35', '#CC4A1A']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center' }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginBottom: 4 }}>🚀 Blast My CV</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Reach 15,000+ employers across the region</Text>
              </View>
              <ChevronRight size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Recent Orders */}
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text style={{ color: '#FF6B35', fontSize: 13, fontWeight: '500' }}>See all</Text>
              </TouchableOpacity>
            </View>

            {ordersLoading ? <ActivityIndicator color="#FF6B35" style={{ marginTop: 20 }} testID="loading-indicator" /> : null}

            {!ordersLoading && recentOrders.length === 0 ? (
              <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A40' }}>
                <Package size={32} color="#444466" style={{ marginBottom: 10 }} />
                <Text style={{ color: '#888899', fontSize: 14, textAlign: 'center' }}>No orders yet. Start by blasting your CV!</Text>
              </View>
            ) : null}

            {recentOrders.map((order: Order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatCard({ label, value, icon, loading }: { label: string; value: number; icon: React.ReactNode; loading?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A40' }}>
      {icon}
      {loading ? (
        <ActivityIndicator color="#FF6B35" size="small" style={{ marginTop: 6 }} />
      ) : (
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 6 }}>{value}</Text>
      )}
      <Text style={{ color: '#888899', fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function OrderRow({ order }: { order: Order }) {
  const color = STATUS_COLOR[order.status] ?? '#888899';
  return (
    <View style={{ backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A40', flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
          {order.package?.name ?? `Order #${order.id}`}
        </Text>
        <Text style={{ color: '#888899', fontSize: 12 }}>
          {order.targetCountries?.join(', ') ?? '—'}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${color}18`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
          {STATUS_ICON[order.status]}
          <Text style={{ color, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>{order.status}</Text>
        </View>
        <Text style={{ color: '#FF6B35', fontSize: 13, fontWeight: '700' }}>${order.totalPrice}</Text>
      </View>
    </View>
  );
}
