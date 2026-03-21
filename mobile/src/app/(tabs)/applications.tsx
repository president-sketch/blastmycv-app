import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, Calendar } from 'lucide-react-native';
import { Application } from '../../lib/types/blastmycv';

const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    jobId: 'j1',
    jobTitle: 'Senior React Native Developer',
    company: 'TechCorp UK',
    status: 'interview',
    appliedAt: '12 Mar 2026',
    updatedAt: '18 Mar 2026',
  },
  {
    id: '2',
    jobId: 'j2',
    jobTitle: 'Frontend Engineer',
    company: 'Digital Agency Ltd',
    status: 'reviewing',
    appliedAt: '10 Mar 2026',
    updatedAt: '15 Mar 2026',
  },
  {
    id: '3',
    jobId: 'j3',
    jobTitle: 'Full Stack Developer',
    company: 'StartupXYZ',
    status: 'offer',
    appliedAt: '5 Mar 2026',
    updatedAt: '20 Mar 2026',
  },
  {
    id: '4',
    jobId: 'j4',
    jobTitle: 'React Developer',
    company: 'Fintech Solutions',
    status: 'pending',
    appliedAt: '19 Mar 2026',
    updatedAt: '19 Mar 2026',
  },
  {
    id: '5',
    jobId: 'j5',
    jobTitle: 'Mobile Developer',
    company: 'HealthApp Co',
    status: 'rejected',
    appliedAt: '2 Mar 2026',
    updatedAt: '10 Mar 2026',
  },
  {
    id: '6',
    jobId: 'j6',
    jobTitle: 'JavaScript Engineer',
    company: 'Media Group PLC',
    status: 'reviewing',
    appliedAt: '14 Mar 2026',
    updatedAt: '16 Mar 2026',
  },
];

type StatusFilter = 'All' | Application['status'];

const STATUS_FILTERS: StatusFilter[] = ['All', 'pending', 'reviewing', 'interview', 'offer', 'rejected'];

const STATUS_CONFIG: Record<Application['status'], { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#888899', bg: '#88889922' },
  reviewing: { label: 'In Review', color: '#3B82F6', bg: '#3B82F622' },
  interview: { label: 'Interview', color: '#22C55E', bg: '#22C55E22' },
  offer: { label: 'Offer', color: '#FF6B35', bg: '#FF6B3522' },
  rejected: { label: 'Rejected', color: '#EF4444', bg: '#EF444422' },
};

const TIMELINE_STEPS: Application['status'][] = ['pending', 'reviewing', 'interview', 'offer'];

function StatusBadge({ status }: { status: Application['status'] }) {
  const config = STATUS_CONFIG[status];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: config.bg,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: config.color + '55',
      }}
    >
      <Text style={{ color: config.color, fontSize: 11, fontWeight: '700' }}>{config.label}</Text>
    </View>
  );
}

function TimelineDots({ status }: { status: Application['status'] }) {
  if (status === 'rejected') {
    return (
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 10 }}>
        {TIMELINE_STEPS.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === 0 ? 8 : 6,
              height: i === 0 ? 8 : 6,
              borderRadius: 4,
              backgroundColor: i === 0 ? '#EF4444' : '#2A2A40',
            }}
          />
        ))}
        <Text style={{ color: '#EF4444', fontSize: 10, marginLeft: 4 }}>Rejected</Text>
      </View>
    );
  }

  const currentIndex = TIMELINE_STEPS.indexOf(status);
  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 10 }}>
      {TIMELINE_STEPS.map((step, i) => {
        const isActive = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <View
            key={step}
            style={{
              width: isCurrent ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isActive ? '#FF6B35' : '#2A2A40',
            }}
          />
        );
      })}
    </View>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  return (
    <View
      style={{
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2A2A40',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Building2 size={13} color="#888899" />
            <Text style={{ fontSize: 12, color: '#888899', fontWeight: '500' }}>{application.company}</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 }}>
            {application.jobTitle}
          </Text>
          <StatusBadge status={application.status} />
        </View>
      </View>

      <TimelineDots status={application.status} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 }}>
        <Calendar size={12} color="#555566" />
        <Text style={{ fontSize: 11, color: '#555566' }}>Applied {application.appliedAt}</Text>
        {application.updatedAt !== application.appliedAt ? (
          <Text style={{ fontSize: 11, color: '#555566' }}>  Updated {application.updatedAt}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function ApplicationsScreen() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');

  const filtered = MOCK_APPLICATIONS.filter(
    (a) => activeFilter === 'All' || a.status === activeFilter
  );

  const total = MOCK_APPLICATIONS.length;
  const inReview = MOCK_APPLICATIONS.filter((a) => a.status === 'reviewing').length;
  const interviews = MOCK_APPLICATIONS.filter((a) => a.status === 'interview').length;

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#0A0A14' }}
      testID="applications-screen"
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 }}>
          My Applications
        </Text>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Total', value: total },
            { label: 'In Review', value: inReview },
            { label: 'Interviews', value: interviews },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                backgroundColor: '#1A1A2E',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderWidth: 1,
                borderColor: '#2A2A40',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Text style={{ color: '#FF6B35', fontSize: 13, fontWeight: '700' }}>{stat.value}</Text>
              <Text style={{ color: '#888899', fontSize: 12 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
        style={{ flexGrow: 0 }}
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          const label = filter === 'All' ? 'All' : STATUS_CONFIG[filter as Application['status']].label;
          const color = filter === 'All' ? '#FF6B35' : STATUS_CONFIG[filter as Application['status']].color;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isActive ? (filter === 'All' ? '#FF6B35' : color + '22') : '#1A1A2E',
                borderWidth: 1,
                borderColor: isActive ? color : '#2A2A40',
              }}
              testID={`app-filter-${filter}`}
            >
              <Text
                style={{
                  color: isActive ? (filter === 'All' ? '#FFFFFF' : color) : '#888899',
                  fontSize: 13,
                  fontWeight: isActive ? '700' : '400',
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Applications List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ApplicationCard application={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ color: '#888899', fontSize: 15 }}>No applications found</Text>
          </View>
        }
        testID="applications-list"
      />
    </SafeAreaView>
  );
}
