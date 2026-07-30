import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../lib/api';

const { width, height } = Dimensions.get('window');

export default function CreateStoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [mediaItem, setMediaItem] = useState<{uri: string, type: string, size?: number} | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('zayren_user_id').then(id => {
      setUserId(id);
    });
  }, []);

  const pickMedia = async (mediaType: 'Images' | 'Videos' | 'All' = 'All') => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'All' ? ImagePicker.MediaTypeOptions.All : (mediaType === 'Images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos),
        allowsEditing: true, // Let users crop nicely for story
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaItem({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          size: asset.fileSize || 0
        });
      }
    } catch (e) {
      console.log('Error picking media:', e);
    }
  };

  const uploadMediaFile = async () => {
    if (!userId || !mediaItem) return null;
    
    const formData = new FormData();
    const filename = mediaItem.uri.split('/').pop() || (mediaItem.type === 'video' ? 'video.mp4' : 'image.jpg');
    const mimeType = mediaItem.type === 'video' ? 'video/mp4' : 'image/jpeg';
    
    formData.append('file', {
      uri: mediaItem.uri,
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

    return await res.json();
  };

  const handlePublish = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }
    
    if (text.trim().length === 0 && !mediaItem) {
      Alert.alert('Error', 'Cannot publish an empty story.');
      return;
    }

    setIsPublishing(true);

    try {
      let uploadedMediaUrl = null;
      let uploadedMediaType = null;
      
      if (mediaItem) {
        const result = await uploadMediaFile();
        if (result) {
           uploadedMediaUrl = result.media_url;
           uploadedMediaType = result.media_type;
        }
      }

      const postPayload = {
        text: text.trim(),
        media_url: uploadedMediaUrl,
        media_type: uploadedMediaType,
      };

      const res = await fetch(`${API_URL}/api/stories`, {
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

      router.push('/');
      
    } catch (error: any) {
      console.error(error);
      Alert.alert('Publish Failed', error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (text.trim().length > 0 || mediaItem) {
      Alert.alert('Discard Story?', 'If you go back now, your story will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        
        {/* Background Layer */}
        {mediaItem ? (
          <Image source={{ uri: mediaItem.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#7C3AED', '#EC4899', '#F59E0B']} style={StyleSheet.absoluteFill} />
        )}
        
        {/* Dark overlay for better text visibility */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />

        {/* Top Controls */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
            <Feather name="x" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.rightControls}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => pickMedia('Images')}>
               <Feather name="image" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => pickMedia('Videos')}>
               <Feather name="video" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Text Input */}
        <View style={styles.centerContent}>
          <TextInput
            style={styles.textInput}
            placeholder={mediaItem ? "Tap to add text..." : "Type your story..."}
            placeholderTextColor="rgba(255,255,255,0.7)"
            multiline
            value={text}
            onChangeText={setText}
            autoFocus={!mediaItem}
            editable={!isPublishing}
          />
        </View>

        {/* Bottom Bar */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
           <TouchableOpacity 
             style={[styles.publishBtn, (text.length === 0 && !mediaItem) && {opacity: 0.5}]} 
             disabled={isPublishing || (text.length === 0 && !mediaItem)}
             onPress={handlePublish}
           >
             <LinearGradient colors={['#10B981', '#059669']} style={styles.publishBtnGrad}>
               {isPublishing ? (
                 <ActivityIndicator color="#fff" size="small" />
               ) : (
                 <>
                   <Text style={styles.publishText}>Your Story</Text>
                   <Feather name="chevron-right" size={20} color="#fff" />
                 </>
               )}
             </LinearGradient>
           </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textInput: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  publishBtn: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  publishBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  publishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});
