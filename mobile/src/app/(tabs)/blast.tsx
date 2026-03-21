import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Check, Star, Zap, Globe, ChevronRight } from 'lucide-react-native';
import { getPackages } from '../../lib/api/blastmycv-api';
import type { Package } from '../../lib/types/blastmycv';

export default function BlastScreen() {
  const { data: packages, isLoading, isError, refetch } = useQuery({
    queryKey: ['packages'],
    queryFn: getPackages,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A14' }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Blast My CV</Text>
          <Text style={{ color: '#888899', fontSize: 13, marginTop: 2 }}>Choose your distribution package</Text>
        </View>

        {/* Hero banner */}
        <LinearGradient
          colors={['#FF6B35', '#CC4A1A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 20, borderRadius: 18, padding: 20, marginBottom: 24 }}
        >
          <Zap size={28} color="#FFFFFF" style={{ marginBottom: 10 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>
            Get Noticed by Top Employers
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20 }}>
            Blast your CV directly to thousands of hiring managers across the region.
          </Text>
        </LinearGradient>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} testID="loading-indicator">
            <ActivityIndicator color="#FF6B35" size="large" />
            <Text style={{ color: '#888899', marginTop: 12, fontSize: 14 }}>Loading packages...</Text>
          </View>
        ) : null}

        {isError ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }} testID="error-view">
            <Text style={{ color: '#FF6B35', fontSize: 40, marginBottom: 12 }}>!</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', marginBottom: 8 }}>
              Failed to load packages
            </Text>
            <Text style={{ color: '#888899', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              Please check your connection and try again.
            </Text>
            <Pressable
              onPress={() => refetch()}
              testID="retry-button"
              style={{ backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !isError && packages ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            testID="packages-list"
          >
            {packages.map((pkg: Package) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <View
      testID={`package-card-${pkg.id}`}
      style={{
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: pkg.isPopular ? 1.5 : 1,
        borderColor: pkg.isPopular ? '#FF6B35' : '#2A2A40',
        backgroundColor: '#1A1A2E',
      }}
    >
      {pkg.isPopular ? (
        <LinearGradient
          colors={['#FF6B35', '#CC4A1A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 5 }}
        >
          <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>MOST POPULAR</Text>
        </LinearGradient>
      ) : null}

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 4 }}>{pkg.name}</Text>
            <Text style={{ color: '#888899', fontSize: 13, lineHeight: 18 }}>{pkg.description}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#FF6B35', fontSize: 24, fontWeight: '800' }}>${pkg.price}</Text>
            <Text style={{ color: '#888899', fontSize: 11 }}>one-time</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16, gap: 8 }}>
          <Globe size={15} color="#FF6B35" />
          <Text style={{ color: '#FF6B35', fontSize: 13, fontWeight: '600' }}>{pkg.employersReached} employers reached</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {pkg.countries.map((country) => (
            <View key={country} style={{ backgroundColor: '#0D0D1E', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#2A2A40' }}>
              <Text style={{ color: '#AAAACC', fontSize: 12 }}>{country}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: 8, marginBottom: 20 }}>
          {pkg.features.map((feature) => (
            <View key={feature} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,107,53,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} color="#FF6B35" />
              </View>
              <Text style={{ color: '#CCCCDD', fontSize: 13 }}>{feature}</Text>
            </View>
          ))}
        </View>

        <Pressable
          testID={`select-package-${pkg.id}`}
          style={{ borderRadius: 14, overflow: 'hidden' }}
        >
          {pkg.isPopular ? (
            <LinearGradient
              colors={['#FF6B35', '#CC4A1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Select Package</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: '#FF6B35', gap: 8 }}>
              <Text style={{ color: '#FF6B35', fontSize: 15, fontWeight: '600' }}>Select Package</Text>
              <ChevronRight size={18} color="#FF6B35" />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
