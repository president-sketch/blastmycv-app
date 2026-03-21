import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Edit3,
  Lock,
  Bell,
  Briefcase,
  FileText,
  Shield,
  HelpCircle,
  MessageSquare,
  Info,
  ChevronRight,
  LogOut,
  AlertTriangle,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../lib/state/auth-store';
import { logoutUser, getUserProfile } from '../../lib/api/blastmycv-api';

const SETTINGS_SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: 'edit-profile', icon: Edit3, label: 'Edit Profile', color: '#3B82F6' },
      { id: 'change-password', icon: Lock, label: 'Change Password', color: '#8B5CF6' },
      { id: 'notifications', icon: Bell, label: 'Notifications', color: '#F59E0B' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'job-preferences', icon: Briefcase, label: 'Job Preferences', color: '#22C55E' },
      { id: 'cv-settings', icon: FileText, label: 'CV Settings', color: '#FF6B35' },
      { id: 'privacy', icon: Shield, label: 'Privacy', color: '#6366F1' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help-center', icon: HelpCircle, label: 'Help Center', color: '#14B8A6' },
      { id: 'contact-support', icon: MessageSquare, label: 'Contact Support', color: '#EC4899' },
      { id: 'about', icon: Info, label: 'About', color: '#888899' },
    ],
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user?.name ?? 'User';
  const userEmail = profile?.email ?? user?.email ?? '';
  const userHeadline = profile?.jobTitle ?? user?.headline ?? '';
  const userLocation = profile?.currentLocation ?? user?.location ?? '';
  const initials = getInitials(userName);

  const handleSettingPress = (_label: string) => {
    // TODO: navigate to respective setting screen
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await logoutUser();
    logout();
  };

  return (
    <>
      {/* Sign Out Confirmation Modal */}
      <Modal visible={showSignOutModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: '#1A1A2E', borderRadius: 20, padding: 28, width: '100%', borderWidth: 1, borderColor: '#2A2A40', alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(239,68,68,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <AlertTriangle size={26} color="#EF4444" />
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Sign Out?</Text>
            <Text style={{ color: '#888899', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>You'll need to sign in again to access your account.</Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Pressable onPress={() => setShowSignOutModal(false)} style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#2A2A40', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSignOut} disabled={signingOut} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}>
                {signingOut ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Sign Out</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#0A0A14' }} testID="profile-screen">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#FFFFFF' }}>Profile</Text>
          </View>

        {/* Profile Header Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View
            style={{
              backgroundColor: '#1A1A2E',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#2A2A40',
              padding: 24,
              alignItems: 'center',
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FF6B3530',
                borderWidth: 3,
                borderColor: '#FF6B35',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#FF6B35' }}>{initials}</Text>
            </View>

            <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 }}>
              {userName}
            </Text>
            <Text style={{ fontSize: 13, color: '#888899', marginBottom: 4 }}>{userEmail}</Text>
            <Text style={{ fontSize: 13, color: '#FF6B35', fontWeight: '500', marginBottom: 18 }}>
              {userHeadline}
            </Text>

            <Pressable
              onPress={() => handleSettingPress('Edit Profile')}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#FF5520' : '#FF6B35',
                borderRadius: 12,
                paddingHorizontal: 28,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
              })}
              testID="edit-profile-button"
            >
              <Edit3 size={15} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={{ paddingHorizontal: 20, marginBottom: 22 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#555566', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {section.title}
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
              {section.items.map((item, index) => {
                const IconComp = item.icon;
                return (
                  <View key={item.id}>
                    <Pressable
                      onPress={() => handleSettingPress(item.label)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        gap: 14,
                        backgroundColor: pressed ? '#22223A' : 'transparent',
                      })}
                      testID={`setting-${item.id}`}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: item.color + '22',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: item.color + '44',
                        }}
                      >
                        <IconComp size={16} color={item.color} />
                      </View>
                      <Text style={{ flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: '500' }}>
                        {item.label}
                      </Text>
                      <ChevronRight size={16} color="#555566" />
                    </Pressable>
                    {index < section.items.length - 1 ? (
                      <View style={{ height: 1, backgroundColor: '#2A2A40', marginLeft: 66 }} />
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 20 }}>
          <Pressable
            onPress={() => setShowSignOutModal(true)}
            style={({ pressed }) => ({
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              borderWidth: 1,
              borderColor: pressed ? '#EF4444' : '#EF444440',
              backgroundColor: pressed ? '#EF444415' : 'transparent',
            })}
            testID="sign-out-button"
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600' }}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}
