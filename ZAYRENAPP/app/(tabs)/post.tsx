import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../lib/api';

const POST_TYPES = [
  { id: 'post', label: 'Post', icon: 'align-left', desc: 'Share a thought, link, or update', color: '#A78BFA' },
  { id: 'story', label: 'Story', icon: 'book-open', desc: '24-hour visual story', color: '#F59E0B' },
  { id: 'reel', label: 'Reel', icon: 'video', desc: 'Short video up to 90 seconds', color: '#EF4444' },
  { id: 'listing', label: 'Listing', icon: 'shopping-bag', desc: 'Sell in the marketplace', color: '#10B981' },
  { id: 'live', label: 'Go Live', icon: 'radio', desc: 'Start a live broadcast now', color: '#EC4899' },
  { id: 'poll', label: 'Poll', icon: 'bar-chart-2', desc: 'Ask your audience anything', color: '#3B82F6' },
];

const AUDIENCES = [
  { id: 'public', label: 'Public', icon: 'globe', desc: 'Everyone' },
  { id: 'followers', label: 'Followers', icon: 'users', desc: 'Followers only' },
  { id: 'close', label: 'Close Friends', icon: 'heart', desc: 'Select friends' },
  { id: 'me', label: 'Only Me', icon: 'lock', desc: 'Private draft' },
];

export default function PostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('post');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('public');
  const [mediaItems, setMediaItems] = useState<{uri: string, type: string, size?: number}[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const charLimit = 500;
  const remaining = charLimit - content.length;

  useEffect(() => {
    SecureStore.getItemAsync('zayren_user_id').then(id => {
      setUserId(id);
    });
  }, []);

  const pickMedia = async (mediaType: 'Images' | 'Videos' | 'All' = 'All') => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'All' ? ImagePicker.MediaTypeOptions.All : (mediaType === 'Images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos),
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newItems = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          size: asset.fileSize || 0
        }));
        setMediaItems(prev => [...prev, ...newItems]);
      }
    } catch (e) {
      console.log('Error picking media:', e);
    }
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMediaFile = async (item: {uri: string, type: string, size?: number}) => {
    if (!userId) throw new Error('Not authenticated');
    
    const formData = new FormData();
    const filename = item.uri.split('/').pop() || (item.type === 'video' ? 'video.mp4' : 'image.jpg');
    const mimeType = item.type === 'video' ? 'video/mp4' : 'image/jpeg';
    
    formData.append('file', {
      uri: item.uri,
      type: mimeType,
      name: filename,
    } as any);

    const res = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${userId}`
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to upload media: ${err}`);
    }

    const data = await res.json();
    return data; // { status: "success", media_url: string, media_type: string, size_bytes: int }
  };

  const handlePublish = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }
    
    if (content.trim().length === 0 && mediaItems.length === 0) {
      Alert.alert('Error', 'Cannot publish an empty post.');
      return;
    }

    setIsPublishing(true);

    try {
      const uploadedMedia = [];
      
      // 1. Upload media if any
      for (const item of mediaItems) {
        const result = await uploadMediaFile(item);
        uploadedMedia.push({
          media_url: result.media_url,
          media_type: result.media_type,
          size_bytes: result.size_bytes
        });
      }

      // 2. Create Post
      const postPayload = {
        content: content.trim(),
        post_type: selectedType,
        audience: audience,
        media_items: uploadedMedia
      };

      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify(postPayload)
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      // Success
      setContent('');
      setMediaItems([]);
      router.push('/');
      
    } catch (error: any) {
      console.error(error);
      Alert.alert('Publish Failed', error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
        <View style={styles.ambientGlow} />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn} disabled={isPublishing}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create</Text>
          <TouchableOpacity
            style={[styles.publishBtn, (content.length === 0 && mediaItems.length === 0) && styles.publishBtnDisabled]}
            disabled={content.length === 0 && mediaItems.length === 0 || isPublishing}
            onPress={handlePublish}
          >
            <LinearGradient
              colors={(content.length > 0 || mediaItems.length > 0) ? ['#7C3AED', '#A78BFA'] : ['#1F2937', '#1F2937']}
              style={styles.publishBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isPublishing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.publishText, (content.length === 0 && mediaItems.length === 0) && styles.publishTextDisabled]}>Publish</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Post type selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Type</Text>
            <View style={styles.typeGrid}>
              {POST_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  style={[styles.typeCard, selectedType === type.id && { borderColor: type.color + '60' }]}
                  activeOpacity={0.85}
                  disabled={isPublishing}
                >
                  {selectedType === type.id && (
                    <LinearGradient
                      colors={[type.color + '18', type.color + '06']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <View style={[styles.typeIcon, { backgroundColor: type.color + '15', borderColor: type.color + '30' }]}>
                    <Feather name={type.icon as any} size={18} color={type.color} />
                  </View>
                  <Text style={[styles.typeLabel, selectedType === type.id && { color: type.color }]}>{type.label}</Text>
                  <Text style={styles.typeDesc}>{type.desc}</Text>
                  {selectedType === type.id && (
                    <View style={[styles.typeCheck, { backgroundColor: type.color }]}>
                      <Feather name="check" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* User row + text input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Content</Text>
            <View style={styles.composeCard}>
              <View style={styles.composeHeader}>
                <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.composeAvatar}>
                  <Text style={styles.composeAvatarText}>Z</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.composeUsername}>You</Text>
                  <Text style={styles.composeHandle}>@your.handle</Text>
                </View>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="What's on your mind? Share a vibe, story, or drop..."
                placeholderTextColor="#4B5563"
                multiline
                value={content}
                onChangeText={(t) => setContent(t.slice(0, charLimit))}
                autoFocus={false}
                editable={!isPublishing}
              />
              
              {/* Selected Media Preview */}
              {mediaItems.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaPreviewContainer}>
                  {mediaItems.map((item, index) => (
                    <View key={index} style={styles.mediaPreviewItem}>
                      <Image source={{ uri: item.uri }} style={styles.mediaPreviewImage} />
                      {item.type === 'video' && (
                         <View style={styles.videoIndicator}>
                           <Feather name="video" size={16} color="#fff" />
                         </View>
                      )}
                      <TouchableOpacity style={styles.mediaRemoveBtn} onPress={() => removeMedia(index)} disabled={isPublishing}>
                        <Feather name="x" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.charCountRow}>
                <View style={styles.mediaButtons}>
                  <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('Images')} disabled={isPublishing}>
                    <Feather name="image" size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('Videos')} disabled={isPublishing}>
                    <Feather name="video" size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaBtn} disabled={isPublishing}>
                    <Feather name="map-pin" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.charCount, remaining < 50 && styles.charCountWarn, remaining < 0 && styles.charCountError]}>
                  {remaining}
                </Text>
              </View>
            </View>
          </View>

          {/* Audience */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audience</Text>
            <View style={styles.audienceGrid}>
              {AUDIENCES.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setAudience(a.id)}
                  style={[styles.audienceCard, audience === a.id && styles.audienceCardActive]}
                  disabled={isPublishing}
                >
                  {audience === a.id && (
                    <LinearGradient colors={['rgba(124,58,237,0.2)', 'rgba(167,139,250,0.08)']} style={StyleSheet.absoluteFill} />
                  )}
                  <Feather name={a.icon as any} size={18} color={audience === a.id ? '#A78BFA' : '#6B7280'} />
                  <Text style={[styles.audienceLabel, audience === a.id && styles.audienceLabelActive]}>{a.label}</Text>
                  <Text style={styles.audienceDesc}>{a.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1A' },
  ambientGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(124,58,237,0.08)',
    top: -50,
    right: -50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cancelBtn: { paddingHorizontal: 4, paddingVertical: 6 },
  cancelText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#F5F3FF', fontSize: 16, fontWeight: '800' },
  publishBtn: { borderRadius: 10, overflow: 'hidden' },
  publishBtnDisabled: { opacity: 0.5 },
  publishBtnGrad: { paddingHorizontal: 18, paddingVertical: 8 },
  publishText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  publishTextDisabled: { color: '#6B7280' },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    gap: 6,
    overflow: 'hidden',
  },
  typeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  typeLabel: { color: '#F5F3FF', fontSize: 14, fontWeight: '700' },
  typeDesc: { color: '#4B5563', fontSize: 10, lineHeight: 14 },
  typeCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  composeCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
  },
  composeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  composeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  composeUsername: { color: '#F5F3FF', fontSize: 14, fontWeight: '700' },
  composeHandle: { color: '#6B7280', fontSize: 11 },
  textInput: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  mediaPreviewContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  mediaPreviewItem: {
    marginRight: 10,
    position: 'relative',
  },
  mediaPreviewImage: {
    width: 100,
    height: 140,
    borderRadius: 12,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 6,
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
  },
  mediaButtons: { flexDirection: 'row', gap: 6 },
  mediaBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  charCount: { color: '#6B7280', fontSize: 13, fontWeight: '700' },
  charCountWarn: { color: '#F59E0B' },
  charCountError: { color: '#EF4444' },

  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  audienceCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    gap: 6,
    overflow: 'hidden',
  },
  audienceCardActive: { borderColor: 'rgba(167,139,250,0.4)' },
  audienceLabel: { color: '#F5F3FF', fontSize: 13, fontWeight: '700' },
  audienceLabelActive: { color: '#A78BFA' },
  audienceDesc: { color: '#4B5563', fontSize: 10 },
});
