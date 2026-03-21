import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, Upload, Plus, Clock } from 'lucide-react-native';
import { getCVs, uploadCV } from '../../lib/api/blastmycv-api';
import type { CV } from '../../lib/types/blastmycv';

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CVsScreen() {
  const [title, setTitle] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: cvs, isLoading, isError, refetch } = useQuery({
    queryKey: ['cvs'],
    queryFn: getCVs,
  });

  const uploadMutation = useMutation({
    mutationFn: () => uploadCV(selectedFile!, title || selectedFile!.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      setShowUpload(false);
      setSelectedFile(null);
      setTitle('');
      Alert.alert('Success', 'CV uploaded successfully!');
    },
    onError: (err: Error) => Alert.alert('Upload failed', err.message),
  });

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/pdf' });
      setTitle(asset.name.replace(/\.[^/.]+$/, ''));
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A14' }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>My CVs</Text>
            <Text style={{ color: '#888899', fontSize: 13, marginTop: 2 }}>{cvs?.length ?? 0} document{cvs?.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowUpload(!showUpload)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' }}
            testID="upload-cv-button"
          >
            <Plus size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Upload Panel */}
        {showUpload ? (
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A40' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 12 }}>Upload New CV</Text>

            <TouchableOpacity onPress={pickFile} style={{ borderWidth: 1.5, borderColor: selectedFile ? '#FF6B35' : '#2A2A40', borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 }}>
              <Upload size={24} color={selectedFile ? '#FF6B35' : '#666688'} />
              <Text style={{ color: selectedFile ? '#FF6B35' : '#666688', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                {selectedFile ? selectedFile.name : 'Tap to select PDF or Word document'}
              </Text>
            </TouchableOpacity>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="CV title (optional)"
              placeholderTextColor="#444466"
              style={{ backgroundColor: '#0D0D1E', borderRadius: 10, borderWidth: 1, borderColor: '#2A2A40', paddingHorizontal: 14, paddingVertical: 10, color: '#FFFFFF', fontSize: 14, marginBottom: 12 }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => { setShowUpload(false); setSelectedFile(null); setTitle(''); }} style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#2A2A40', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#888899', fontSize: 14, fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => uploadMutation.mutate()}
                disabled={!selectedFile || uploadMutation.isPending}
                style={{ flex: 2, height: 44, borderRadius: 10, backgroundColor: selectedFile ? '#FF6B35' : '#333344', alignItems: 'center', justifyContent: 'center' }}
                testID="confirm-upload-button"
              >
                {uploadMutation.isPending
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Upload CV</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF6B35" />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
          {isLoading ? <ActivityIndicator color="#FF6B35" style={{ marginTop: 40 }} testID="loading-indicator" /> : null}

          {isError ? (
            <View style={{ alignItems: 'center', marginTop: 60 }} testID="error-view">
              <Text style={{ color: '#EF4444', fontSize: 15, marginBottom: 12 }}>Failed to load CVs</Text>
              <TouchableOpacity onPress={() => refetch()} style={{ backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!isLoading && !isError && cvs?.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <FileText size={48} color="#2A2A40" style={{ marginBottom: 16 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', marginBottom: 8 }}>No CVs yet</Text>
              <Text style={{ color: '#888899', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>Upload your first CV to start blasting it to employers.</Text>
              <TouchableOpacity onPress={() => setShowUpload(true)} style={{ marginTop: 20, backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Upload CV</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {cvs?.map((cv: CV) => <CVCard key={cv.id} cv={cv} />)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function CVCard({ cv }: { cv: CV }) {
  return (
    <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A40', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(255,107,53,0.12)', alignItems: 'center', justifyContent: 'center' }}>
        <FileText size={22} color="#FF6B35" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>{cv.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Clock size={11} color="#888899" />
          <Text style={{ color: '#888899', fontSize: 12 }}>{formatDate(cv.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}
