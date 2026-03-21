import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { Package, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react-native';
import { getOrders } from '../../lib/api/blastmycv-api';
import type { Order } from '../../lib/types/blastmycv';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  pending:    { color: '#F59E0B', label: 'Pending',    icon: <Clock size={13} color="#F59E0B" /> },
  processing: { color: '#3B82F6', label: 'Processing', icon: <Loader size={13} color="#3B82F6" /> },
  completed:  { color: '#22C55E', label: 'Completed',  icon: <CheckCircle size={13} color="#22C55E" /> },
  failed:     { color: '#EF4444', label: 'Failed',     icon: <AlertCircle size={13} color="#EF4444" /> },
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrdersScreen() {
  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const counts = {
    total: orders?.length ?? 0,
    completed: orders?.filter((o: Order) => o.status === 'completed').length ?? 0,
    processing: orders?.filter((o: Order) => o.status === 'processing' || o.status === 'pending').length ?? 0,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A14' }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>My Orders</Text>
          <Text style={{ color: '#888899', fontSize: 13, marginTop: 2 }}>Track your CV distribution orders</Text>
        </View>

        {/* Stats chips */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 }}>
          {[
            { label: 'Total', value: counts.total, color: '#FF6B35' },
            { label: 'Active', value: counts.processing, color: '#3B82F6' },
            { label: 'Done', value: counts.completed, color: '#22C55E' },
          ].map((chip) => (
            <View key={chip.label} style={{ backgroundColor: '#1A1A2E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#2A2A40', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: chip.color, fontSize: 16, fontWeight: '800' }}>{chip.value}</Text>
              <Text style={{ color: '#888899', fontSize: 12 }}>{chip.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF6B35" />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          testID="orders-screen"
        >
          {isLoading ? <ActivityIndicator color="#FF6B35" style={{ marginTop: 40 }} testID="loading-indicator" /> : null}

          {isError ? (
            <View style={{ alignItems: 'center', marginTop: 60 }} testID="error-view">
              <Text style={{ color: '#EF4444', fontSize: 15, marginBottom: 12 }}>Failed to load orders</Text>
              <TouchableOpacity onPress={() => refetch()} style={{ backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!isLoading && !isError && orders?.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Package size={48} color="#2A2A40" style={{ marginBottom: 16 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', marginBottom: 8 }}>No orders yet</Text>
              <Text style={{ color: '#888899', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>Purchase a package to start distributing your CV to employers.</Text>
            </View>
          ) : null}

          {orders?.map((order: Order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
            return (
              <View key={order.id} style={{ backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A40' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 3 }}>
                      {order.package?.name ?? `Order #${order.id}`}
                    </Text>
                    <Text style={{ color: '#888899', fontSize: 12 }}>
                      {order.targetCountries?.join(' · ') ?? '—'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: `${cfg.color}18`, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}>
                    {cfg.icon}
                    <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '600' }}>{cfg.label}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2A2A40' }}>
                  <Text style={{ color: '#888899', fontSize: 12 }}>{formatDate(order.createdAt)}</Text>
                  <Text style={{ color: '#FF6B35', fontSize: 15, fontWeight: '700' }}>${order.totalPrice}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
