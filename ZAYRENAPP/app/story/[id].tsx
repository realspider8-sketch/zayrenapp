import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../lib/api';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SecureStore.getItemAsync('zayren_user_id').then(id => {
      setUserId(id);
    });
  }, []);

  const fetchStory = async () => {
    try {
      const token = await SecureStore.getItemAsync('zayren_user_id'); // We use user_id as token for now in dev
      const res = await fetch(`${API_URL}/api/stories/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Story not found or expired');
      const data = await res.json();
      setStory(data);
      
      // Record view if we aren't the author
      if (token && data.user_id !== token) {
        fetch(`${API_URL}/api/stories/${id}/view`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(e => console.log('View recording failed', e));
      }
      
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStory();
    }
  }, [id]);

  useEffect(() => {
    if (story && !loading && !error) {
      // Start progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: STORY_DURATION,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          router.back();
        }
      });
    }
  }, [story, loading, error]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (error || !story) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Story not found'}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = userId === story.user_id;

  return (
    <View style={styles.container}>
      {/* Background Media */}
      {story.media_url ? (
        <Image 
          source={{ uri: `${API_URL}${story.media_url}` }} 
          style={StyleSheet.absoluteFill} 
          resizeMode="cover" 
        />
      ) : (
        <LinearGradient colors={['#7C3AED', '#EC4899', '#F59E0B']} style={StyleSheet.absoluteFill} />
      )}
      
      {/* Dark overlay */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />

      {/* Text Content */}
      {story.text && (
        <View style={styles.textContainer}>
          <Text style={styles.storyText}>{story.text}</Text>
        </View>
      )}

      {/* Top UI */}
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={[styles.topOverlay, { paddingTop: insets.top + 10 }]}>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
              ]} 
            />
          </View>
        </View>

        {/* User Info Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <LinearGradient colors={['#F59E0B', '#EF4444']} style={styles.avatar}>
               <Text style={styles.avatarText}>{(story.user?.name || 'U').slice(0, 2).toUpperCase()}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.userName}>{story.user?.name}</Text>
              <Text style={styles.timeText}>
                {new Date(story.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bottom UI - Views (If owner) */}
      {isOwner && (
        <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.viewsBtn}>
            <Feather name="eye" size={20} color="#fff" />
            <Text style={styles.viewsText}>{story.views?.length || 0} Views</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#F59E0B',
    fontSize: 16,
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  timeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  iconBtn: {
    padding: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  storyText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  viewsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  }
});
