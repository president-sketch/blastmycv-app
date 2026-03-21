import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Globe,
  ChevronRight,
  Download,
  Share2,
  Edit3,
} from 'lucide-react-native';
import { useAuthStore } from '../../lib/state/auth-store';

const CV_SECTIONS = [
  {
    id: 'personal',
    icon: User,
    title: 'Personal Info',
    subtitle: 'Name, contact, location',
    color: '#3B82F6',
  },
  {
    id: 'experience',
    icon: Briefcase,
    title: 'Work Experience',
    subtitle: '3 entries',
    color: '#FF6B35',
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: 'Education',
    subtitle: '2 entries',
    color: '#8B5CF6',
  },
  {
    id: 'skills',
    icon: Zap,
    title: 'Skills',
    subtitle: '12 skills added',
    color: '#22C55E',
  },
  {
    id: 'languages',
    icon: Globe,
    title: 'Languages',
    subtitle: '2 languages',
    color: '#F59E0B',
  },
];

const COMPLETENESS = 75;

export default function CVScreen() {
  const user = useAuthStore((s) => s.user);
  const userName = user?.name ?? 'Your Name';
  const headline = user?.headline ?? 'Software Developer';

  const handleSection = (title: string) => {
    Alert.alert(title, `Edit your ${title.toLowerCase()} section.`, [{ text: 'OK' }]);
  };

  const handleDownload = () => {
    Alert.alert('Download PDF', 'Your CV is being prepared for download.', [{ text: 'OK' }]);
  };

  const handleShare = () => {
    Alert.alert('Share CV Link', 'A shareable link to your CV has been copied.', [{ text: 'OK' }]);
  };

  const handleEdit = () => {
    Alert.alert('Edit CV', 'CV editor coming soon.', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#0A0A14' }}
      testID="cv-screen"
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
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#FFFFFF' }}>My CV</Text>
          <Pressable onPress={handleEdit} testID="cv-edit-button">
            <Text style={{ color: '#FF6B35', fontSize: 16, fontWeight: '600' }}>Edit</Text>
          </Pressable>
        </View>

        {/* CV Preview Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: '#1A1A2E',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#2A2A40',
              padding: 20,
            }}
          >
            {/* Preview header stripe */}
            <View
              style={{
                backgroundColor: '#FF6B3518',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#FF6B3530',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 3 }}>
                {userName}
              </Text>
              <Text style={{ fontSize: 14, color: '#FF6B35', fontWeight: '500' }}>{headline}</Text>
            </View>

            {/* Completeness */}
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 13, color: '#888899' }}>CV Completeness</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#FF6B35' }}>
                  {COMPLETENESS}%
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: '#2A2A40',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${COMPLETENESS}%`,
                    backgroundColor: '#FF6B35',
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text style={{ fontSize: 11, color: '#555566', marginTop: 6 }}>
                Add more details to improve your visibility
              </Text>
            </View>
          </View>
        </View>

        {/* CV Sections */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 }}>
            Sections
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
            {CV_SECTIONS.map((section, index) => {
              const IconComp = section.icon;
              return (
                <View key={section.id}>
                  <Pressable
                    onPress={() => handleSection(section.title)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      gap: 14,
                      backgroundColor: pressed ? '#22223A' : 'transparent',
                    })}
                    testID={`cv-section-${section.id}`}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: section.color + '22',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: section.color + '44',
                      }}
                    >
                      <IconComp size={18} color={section.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 }}>
                        {section.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#888899' }}>{section.subtitle}</Text>
                    </View>
                    <ChevronRight size={18} color="#555566" />
                  </Pressable>
                  {index < CV_SECTIONS.length - 1 ? (
                    <View style={{ height: 1, backgroundColor: '#2A2A40', marginLeft: 70 }} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Pressable
            onPress={handleDownload}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#FF5520' : '#FF6B35',
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            })}
            testID="download-pdf-button"
          >
            <Download size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Download PDF</Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#FF6B3522' : 'transparent',
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderWidth: 1,
              borderColor: '#2A2A40',
            })}
            testID="share-cv-button"
          >
            <Share2 size={18} color="#888899" />
            <Text style={{ color: '#888899', fontSize: 16, fontWeight: '600' }}>Share CV Link</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
