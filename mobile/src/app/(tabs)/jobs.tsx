import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Clock, DollarSign } from 'lucide-react-native';
import { JobListing } from '../../lib/types/blastmycv';

const MOCK_JOBS: JobListing[] = [
  {
    id: '1',
    title: 'Senior React Native Developer',
    company: 'TechCorp UK',
    location: 'London, UK',
    type: 'full-time',
    salary: '£70k – £90k',
    description: 'Build amazing mobile experiences.',
    postedAt: '2d ago',
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    company: 'Digital Agency Ltd',
    location: 'Remote',
    type: 'remote',
    salary: '£55k – £70k',
    description: 'Work on cutting-edge web apps.',
    postedAt: '3d ago',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Manchester, UK',
    type: 'contract',
    salary: '£500/day',
    description: 'Join a fast-growing startup.',
    postedAt: '1d ago',
  },
  {
    id: '4',
    title: 'React Developer',
    company: 'Fintech Solutions',
    location: 'Edinburgh, UK',
    type: 'full-time',
    salary: '£60k – £80k',
    description: 'Build financial products.',
    postedAt: '5h ago',
  },
  {
    id: '5',
    title: 'Mobile Developer',
    company: 'HealthApp Co',
    location: 'Remote',
    type: 'remote',
    salary: '£65k – £85k',
    description: 'Help people live healthier.',
    postedAt: '1d ago',
  },
  {
    id: '6',
    title: 'JavaScript Engineer',
    company: 'Media Group PLC',
    location: 'Bristol, UK',
    type: 'part-time',
    description: 'Part-time role with flexibility.',
    postedAt: '4d ago',
  },
  {
    id: '7',
    title: 'Software Engineer',
    company: 'GovTech UK',
    location: 'Leeds, UK',
    type: 'full-time',
    salary: '£50k – £65k',
    description: 'Make a real difference.',
    postedAt: '2d ago',
  },
];

const TYPE_FILTERS = ['All', 'Remote', 'Full-time', 'Contract'] as const;
type FilterType = typeof TYPE_FILTERS[number];

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  remote: 'Remote',
};

const TYPE_COLORS: Record<string, string> = {
  'full-time': '#3B82F6',
  'part-time': '#8B5CF6',
  contract: '#F59E0B',
  remote: '#22C55E',
};

function JobCard({ job }: { job: JobListing }) {
  const typeColor = TYPE_COLORS[job.type] ?? '#888899';
  const typeLabel = TYPE_LABELS[job.type] ?? job.type;

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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 12, color: '#888899', marginBottom: 3, fontWeight: '500' }}>
            {job.company}
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#FF6B35', lineHeight: 22 }}>
            {job.title}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: pressed ? '#FF5520' : '#FF6B35',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 7,
            backgroundColor: pressed ? '#FF6B3522' : 'transparent',
          })}
          testID={`apply-button-${job.id}`}
        >
          <Text style={{ color: '#FF6B35', fontSize: 12, fontWeight: '700' }}>Apply Now</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MapPin size={13} color="#888899" />
          <Text style={{ fontSize: 12, color: '#888899' }}>{job.location}</Text>
        </View>
        {job.salary ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <DollarSign size={13} color="#888899" />
            <Text style={{ fontSize: 12, color: '#888899' }}>{job.salary}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Clock size={13} color="#555566" />
          <Text style={{ fontSize: 11, color: '#555566' }}>{job.postedAt}</Text>
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: typeColor + '22',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: typeColor + '55',
          }}
        >
          <Text style={{ color: typeColor, fontSize: 11, fontWeight: '600' }}>{typeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

export default function JobsScreen() {
  const [query, setQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesQuery =
      query.trim() === '' ||
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase());

    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Remote' && job.type === 'remote') ||
      (activeFilter === 'Full-time' && job.type === 'full-time') ||
      (activeFilter === 'Contract' && job.type === 'contract');

    return matchesQuery && matchesFilter;
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#0A0A14' }}
      testID="jobs-screen"
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 }}>
          Job Listings
        </Text>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1A1A2E',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#2A2A40',
            paddingHorizontal: 14,
            paddingVertical: 12,
            gap: 10,
          }}
        >
          <Search size={18} color="#888899" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search jobs or companies..."
            placeholderTextColor="#555566"
            style={{ flex: 1, color: '#FFFFFF', fontSize: 15 }}
            testID="job-search-input"
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={{ paddingLeft: 20, marginBottom: 8, flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TYPE_FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? '#FF6B35' : '#1A1A2E',
                  borderWidth: 1,
                  borderColor: isActive ? '#FF6B35' : '#2A2A40',
                }}
                testID={`filter-${filter}`}
              >
                <Text
                  style={{
                    color: isActive ? '#FFFFFF' : '#888899',
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '400',
                  }}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Job Count */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
        <Text style={{ color: '#555566', fontSize: 12 }}>
          {filteredJobs.length} {filteredJobs.length === 1 ? 'result' : 'results'}
        </Text>
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Search size={40} color="#2A2A40" />
            <Text style={{ color: '#888899', marginTop: 12, fontSize: 15 }}>No jobs found</Text>
            <Text style={{ color: '#555566', marginTop: 4, fontSize: 13 }}>Try a different search or filter</Text>
          </View>
        }
        testID="jobs-list"
      />
    </SafeAreaView>
  );
}
