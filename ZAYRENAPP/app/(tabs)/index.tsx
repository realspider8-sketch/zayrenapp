import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  ViewToken,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { supabase } from '@/lib/supabase';
import { CommentsModal } from '@/components/CommentsModal';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────
const TRENDING_TAGS = ['#ZayrenVibes', '#Marketplace', '#TechTalk', '#Explore', '#Creators', '#Live'];

const formatPost = (backendPost: any) => {
  return {
    id: backendPost.id,
    user: backendPost.user?.name || 'Unknown',
    handle: `@${backendPost.user?.username || 'user'}`,
    avatarGradient: ['#F59E0B', '#EF4444'] as [string, string],
    initials: (backendPost.user?.name || 'U').slice(0, 2).toUpperCase(),
    time: backendPost.created_at ? new Date(backendPost.created_at).toLocaleDateString() : 'Just now',
    content: backendPost.content || '',
    tags: [],
    likes: backendPost.likes_count || 0,
    comments: backendPost.comments_count || 0,
    shares: backendPost.shares_count || 0,
    reposts: 0,
    liked: backendPost.is_liked_by_me || false,
    type: backendPost.post_type || 'post',
    mediaItems: backendPost.media_items || [],
    pinColor: '#F59E0B',
  };
};

// ─── Components ────────────────────────────────────────────────────────────

function AvatarCircle({
  gradient,
  initials,
  size = 46,
  fontSize = 16,
}: {
  gradient: [string, string];
  initials: string;
  size?: number;
  fontSize?: number;
}) {
  return (
    <LinearGradient colors={gradient} style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarInitials, { fontSize }]}>{initials}</Text>
    </LinearGradient>
  );
}

function StoryBubble({ item, currentUser }: { item: any; currentUser?: any }) {
  const router = useRouter();
  if (item.isAdd) {
    return (
      <TouchableOpacity style={styles.storyItem} activeOpacity={0.8} onPress={() => router.push('/create-story')}>
        <View style={{ position: 'relative' }}>
          {currentUser ? (
             <LinearGradient colors={['#1E1B4B', '#2D1B69']} style={styles.storyAddCircle}>
               <AvatarCircle gradient={['#7C3AED', '#A78BFA']} initials={currentUser.initials} size={66} fontSize={20} />
             </LinearGradient>
          ) : (
            <LinearGradient colors={['#1E1B4B', '#2D1B69']} style={styles.storyAddCircle}>
              <View style={styles.storyAddInner}>
                <Feather name="plus" size={22} color="#A78BFA" />
              </View>
            </LinearGradient>
          )}
          <View style={styles.storyAddBadge}>
            <Feather name="plus" size={12} color="#fff" />
          </View>
        </View>
        <Text style={styles.storyName}>Your Story</Text>
      </TouchableOpacity>
    );
  }
  const gradColors = (item as any).gradient as [string, string];
  const seen = (item as any).seen as boolean;
  return (
    <TouchableOpacity style={styles.storyItem} activeOpacity={0.8} onPress={() => router.push(`/story/${item.id}` as any)}>
      <LinearGradient
        colors={seen ? ['#374151', '#374151'] : gradColors}
        style={[styles.storyRing, seen && styles.storyRingSeen]}
      >
        <View style={styles.storyInnerBorder}>
          <LinearGradient colors={['#18162A', '#18162A']} style={styles.storyAvatarBg}>
            <AvatarCircle gradient={gradColors} initials={item.name!.slice(0, 2).toUpperCase()} size={50} fontSize={16} />
          </LinearGradient>
        </View>
      </LinearGradient>
      <Text style={styles.storyName}>{item.name}</Text>
    </TouchableOpacity>
  );
}

// ─── TikTok-Style Post Card ───────────────────────────────────────────────

const TIKTOK_CARD_H = SCREEN_WIDTH * 1.42; // ~16:9 portrait ratio per card

const BG_GRADIENTS: Record<string, [string, string]> = {
  text:     ['#1a0f2e', '#0d1a2e'],
  delivery: ['#0a1f15', '#0d1a2e'],
};

function TikTokPostCard({ 
  post, 
  onLike,
  onComment,
  onShare
}: { 
  post: any; 
  onLike: (id: string, currentlyLiked: boolean) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onLike(post.id, post.liked);
  };

  const bgGrad = BG_GRADIENTS[post.type] ?? BG_GRADIENTS.text;

  return (
    <View style={styles.tikTokCard}>
      {/* Full background gradient */}
      <LinearGradient
        colors={bgGrad}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Render first media item as background if available */}
      {post.mediaItems && post.mediaItems.length > 0 && post.mediaItems[0].media_type === 'image' && (
        <Image
          source={{ uri: `${API_URL}${post.mediaItems[0].media_url}` }}
          style={[StyleSheet.absoluteFill, { opacity: 0.85 }]}
          resizeMode="cover"
        />
      )}
      
      {post.mediaItems && post.mediaItems.length > 0 && post.mediaItems[0].media_type === 'video' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
            <Feather name="play-circle" size={48} color="rgba(255,255,255,0.6)" />
            <Text style={{color: '#fff', marginTop: 10}}>Video playback coming soon</Text>
        </View>
      )}

      {/* Ambient glow from avatar color */}
      <View style={[styles.tikTokGlow, { backgroundColor: post.pinColor + '18' }]} />

      {/* ── Right Action Column (TikTok style) ── */}
      <View style={styles.tikTokActions}>
        {/* Avatar with follow + */}
        <View style={styles.tikTokAvatarWrap}>
          <View style={styles.tikTokAvatarRing}>
            <AvatarCircle gradient={post.avatarGradient} initials={post.initials} size={46} />
          </View>
          <View style={[styles.tikTokFollowDot, { backgroundColor: post.pinColor }]}>
            <Feather name="plus" size={10} color="#fff" />
          </View>
        </View>

        {/* Like */}
        <TouchableOpacity style={styles.tikTokActionBtn} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={30}
              color={post.liked ? '#EF4444' : '#fff'}
            />
          </Animated.View>
          <Text style={styles.tikTokActionCount}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.tikTokActionBtn} onPress={() => onComment(post.id)}>
          <Feather name="message-circle" size={28} color="#fff" />
          <Text style={styles.tikTokActionCount}>{post.comments}</Text>
        </TouchableOpacity>

        {/* Repost */}
        <TouchableOpacity style={styles.tikTokActionBtn}>
          <Feather name="repeat" size={26} color="#fff" />
          <Text style={styles.tikTokActionCount}>{post.reposts}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.tikTokActionBtn} onPress={() => onShare(post.id)}>
          <Feather name="send" size={26} color="#fff" />
          <Text style={styles.tikTokActionCount}>{post.shares}</Text>
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity style={styles.tikTokActionBtn} onPress={() => setBookmarked(b => !b)}>
          <Feather name="bookmark" size={26} color={bookmarked ? '#A78BFA' : '#fff'} />
        </TouchableOpacity>

        {/* More */}
        <TouchableOpacity style={styles.tikTokActionBtn}>
          <Feather name="more-horizontal" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* ── Bottom Content overlay ── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.82)']}
        style={styles.tikTokBottomGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* User info */}
        <View style={styles.tikTokUserRow}>
          <AvatarCircle gradient={post.avatarGradient} initials={post.initials} size={36} />
          <View>
            <View style={styles.tikTokUserNameRow}>
              <Text style={styles.tikTokUserName}>{post.user}</Text>
              <View style={[styles.tikTokVerifiedDot, { backgroundColor: post.pinColor }]} />
            </View>
            <Text style={styles.tikTokHandle}>{post.handle} · {post.time}</Text>
          </View>
        </View>

        {/* Post content */}
        <Text style={styles.tikTokContent} numberOfLines={3}>{post.content}</Text>

        {/* Tags */}
        <View style={styles.tikTokTagsRow}>
          {post.tags.map((tag) => (
            <TouchableOpacity key={tag}>
              <Text style={[styles.tikTokTag, { color: post.pinColor }]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Delivery badge */}
        {post.type === 'delivery' && (
          <View style={styles.tikTokDeliveryBadge}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={14} color="#10B981" />
            <Text style={styles.tikTokDeliveryText}>Delivered via Zayren Express · 18 min</Text>
          </View>
        )}

        {/* Music / vibe bar */}
        <View style={styles.tikTokMusicBar}>
          <Feather name="music" size={12} color="#A78BFA" />
          <Text style={styles.tikTokMusicText} numberOfLines={1}>
            Zayren Vibes — Original Sound
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function TrendingCreatorCard({ creator }: { creator: any }) {
  return (
    <TouchableOpacity style={styles.creatorCard} activeOpacity={0.85}>
      <LinearGradient colors={['rgba(167,139,250,0.08)', 'rgba(124,58,237,0.06)']} style={styles.creatorCardInner}>
        <AvatarCircle gradient={creator.gradient} initials={creator.initials} size={52} />
        <Text style={styles.creatorName}>{creator.name}</Text>
        <Text style={styles.creatorHandle}>{creator.handle}</Text>
        <Text style={styles.creatorFollowers}>{creator.followers}</Text>
        <TouchableOpacity style={styles.followBtn}>
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [activeTag, setActiveTag] = useState('#ZayrenVibes');
  const scrollY = useRef(new Animated.Value(0)).current;

  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([{ id: '0', isAdd: true, name: 'Your Story' }]);
  const [trendingCreators, setTrendingCreators] = useState<any[]>([]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    setPostsError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${API_URL}/api/posts`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.map(formatPost));
    } catch (err: any) {
      setPostsError(err.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchStories = async () => {
    try {
      const token = await SecureStore.getItemAsync('zayren_user_id');
      const res = await fetch(`${API_URL}/api/stories`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) return;
      const data = await res.json();
      
      const usersMap = new Map();
      data.forEach((story: any) => {
        if (!usersMap.has(story.user_id)) {
           usersMap.set(story.user_id, {
             id: story.id,
             isAdd: false,
             name: story.user?.name || 'User',
             seen: story.has_viewed,
             gradient: ['#F59E0B', '#EF4444'],
           });
        } else {
           if (!story.has_viewed) {
              usersMap.get(story.user_id).seen = false;
              usersMap.get(story.user_id).id = story.id; // prefer unseen story
           }
        }
      });
      
      const formattedStories = Array.from(usersMap.values());
      setStories([{ id: '0', isAdd: true, name: 'Your Story' }, ...formattedStories]);
    } catch (err) {
      console.log('fetch stories error', err);
    }
  };

  React.useEffect(() => {
    fetchPosts();
    fetchStories();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({
          name: user.user_metadata?.name || 'User',
          initials: (user.user_metadata?.name || 'U').slice(0, 2).toUpperCase(),
        });
      }
    });
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleLike = async (id: string, currentlyLiked: boolean) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !currentlyLiked, likes: p.likes + (currentlyLiked ? -1 : 1) } : p))
    );
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await fetch(`${API_URL}/api/posts/${id}/like`, {
        method: currentlyLiked ? 'DELETE' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      // Revert if error
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, liked: currentlyLiked, likes: p.likes + (currentlyLiked ? 1 : -1) } : p))
      );
    }
  };

  const handleShare = async (id: string) => {
    // Optimistic
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p))
    );
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await fetch(`${API_URL}/api/posts/${id}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
       // revert
       setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, shares: p.shares - 1 } : p))
       );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient background glow */}
      <LinearGradient
        colors={['#0D0B1A', '#130E26', '#0D0B1A']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.ambientGlow1} />
      <View style={styles.ambientGlow2} />

      {/* Sticky header */}
      <Animated.View
        style={[styles.stickyHeader, { paddingTop: insets.top + 8, opacity: headerOpacity }]}
        pointerEvents="none"
      />

      {/* Real top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.topBarLeft}>
          <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.logoMark}>
            <Text style={styles.logoMarkText}>Z</Text>
          </LinearGradient>
          <View>
            <Text style={styles.appName}>ZAYREN</Text>
            <Text style={styles.appTagline}>Connect · Create · Commerce</Text>
          </View>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topBarBtn}>
            <Feather name="bell" size={20} color="#D1D5DB" />
            <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>5</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarBtn} onPress={() => router.push('/(tabs)/chat' as any)}>
            <Feather name="message-square" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ── Stories ── */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContainer}>
            {stories.map((s) => <StoryBubble key={s.id} item={s} currentUser={currentUser} />)}
          </ScrollView>
        </View>

        {/* ── Trending tags ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          contentContainerStyle={styles.tagsContainer}
        >
          {TRENDING_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => setActiveTag(tag)}
              style={[styles.tagChip, activeTag === tag && styles.tagChipActive]}
            >
              {activeTag === tag && (
                <LinearGradient colors={['#7C3AED', '#A78BFA']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              )}
              <Text style={[styles.tagChipText, activeTag === tag && styles.tagChipTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── User Story (Feature Banner) ── */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(124,58,237,0.25)', 'rgba(167,139,250,0.08)', 'transparent']}
            style={styles.userStoryBanner}
          >
            <View style={styles.userStoryContent}>
              <View style={styles.userStoryLeft}>
                <View style={styles.liveChip}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>USER STORY</Text>
                </View>
                <Text style={styles.userStoryTitle}>Share Your Moment</Text>
                <Text style={styles.userStorySubtitle}>Your story reaches 1,400+ followers in real time. Go live, post, or share a vibe.</Text>
                <TouchableOpacity style={styles.userStoryBtn}>
                  <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.userStoryBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Feather name="zap" size={13} color="#fff" />
                    <Text style={styles.userStoryBtnText}>Create Story</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={styles.userStoryRight}>
                <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.userStoryOrb}>
                  <Feather name="book-open" size={32} color="rgba(255,255,255,0.9)" />
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Feed posts — TikTok Style ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>For You</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tikTokFeedContainer}>
            {loadingPosts ? (
              <ActivityIndicator size="large" color="#A78BFA" style={{ margin: 40 }} />
            ) : postsError ? (
              <Text style={{ color: '#EF4444', textAlign: 'center', padding: 20 }}>{postsError}</Text>
            ) : posts.length === 0 ? (
              <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>No posts yet.</Text>
            ) : (
              posts.map((post) => (
                <TikTokPostCard 
                  key={post.id} 
                  post={post} 
                  onLike={handleLike} 
                  onComment={setActiveCommentPostId}
                  onShare={handleShare}
                />
              ))
            )}
          </View>
        </View>

        {/* ── Trending Creators ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Rising Creators</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.creatorsRow}>
            {trendingCreators.map((c) => <TrendingCreatorCard key={c.id} creator={c} />)}
          </ScrollView>
        </View>

        {/* ── Quick access tiles ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {[
              { label: 'Marketplace', icon: 'shopping-bag', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', route: '/(tabs)/marketplace' },
              { label: 'Live Chat', icon: 'message-circle', color: '#10B981', bg: 'rgba(16,185,129,0.12)', route: '/(tabs)/chat' },
              { label: 'Delivery', icon: 'package', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', route: '/(tabs)/delivery' },
              { label: 'Help', icon: 'help-circle', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', route: '/(tabs)/help' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.quickTile, { backgroundColor: item.bg }]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.quickTileIcon, { borderColor: item.color + '40' }]}>
                  <Feather name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={[styles.quickTileLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Platform banner ── */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#1E1B4B', '#2D1B69', '#1E1B4B']}
            style={styles.platformBanner}
          >
            <Text style={styles.platformBannerTitle}>More than a social app.</Text>
            <Text style={styles.platformBannerSub}>
              Zayren combines the best of social media, e-commerce, messaging, and delivery — all in one place.
            </Text>
            <View style={styles.platformIcons}>
              {[
                { icon: 'instagram', label: 'Social' },
                { icon: 'shopping-cart', label: 'Commerce' },
                { icon: 'message-circle', label: 'Messaging' },
                { icon: 'package', label: 'Delivery' },
              ].map((p) => (
                <View key={p.label} style={styles.platformIconItem}>
                  <View style={styles.platformIconCircle}>
                    <Feather name={p.icon as any} size={18} color="#A78BFA" />
                  </View>
                  <Text style={styles.platformIconLabel}>{p.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>
      </Animated.ScrollView>
      <CommentsModal 
        visible={!!activeCommentPostId} 
        postId={activeCommentPostId} 
        onClose={() => setActiveCommentPostId(null)} 
        onCommentAdded={() => {
           if (activeCommentPostId) {
             setPosts(prev => prev.map(p => p.id === activeCommentPostId ? { ...p, comments: p.comments + 1 } : p));
           }
        }}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B1A',
  },
  ambientGlow1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    top: -80,
    right: -80,
  },
  ambientGlow2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    top: 200,
    left: -80,
  },

  // Top bar
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(13,11,26,0.95)',
    zIndex: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appName: {
    color: '#F5F3FF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  appTagline: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 6,
  },
  topBarBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },

  // Section
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F5F3FF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionMore: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
  },

  // Stories
  storiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    gap: 6,
  },
  storyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 2.5,
  },
  storyRingSeen: {
    opacity: 0.4,
  },
  storyInnerBorder: {
    flex: 1,
    borderRadius: 33,
    padding: 2,
    backgroundColor: '#0D0B1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatarBg: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAddCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderStyle: 'dashed',
  },
  storyAddInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyName: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '500',
    maxWidth: 70,
    textAlign: 'center',
  },
  storyAddBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D0B1A',
  },
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: '700',
  },

  // Tags
  tagsScroll: {
    marginBottom: 4,
  },
  tagsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 6,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  tagChipActive: {
    borderColor: '#7C3AED',
  },
  tagChipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  tagChipTextActive: {
    color: '#fff',
  },

  // User Story Banner
  userStoryBanner: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    padding: 20,
  },
  userStoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStoryLeft: {
    flex: 1,
    gap: 10,
  },
  userStoryRight: {
    marginLeft: 16,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A78BFA',
  },
  liveText: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  userStoryTitle: {
    color: '#F5F3FF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  userStorySubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  userStoryBtn: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    overflow: 'hidden',
  },
  userStoryBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  userStoryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  userStoryOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },

  // ── TikTok Post Styles ─────────────────────────────────────────────────
  tikTokFeedContainer: {
    gap: 10,
    paddingHorizontal: 16,
  },
  tikTokCard: {
    width: '100%',
    height: SCREEN_WIDTH * 1.42,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 2,
    justifyContent: 'flex-end',
  },
  tikTokGlow: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
  },
  tikTokActions: {
    position: 'absolute',
    right: 12,
    bottom: 130,
    alignItems: 'center',
    gap: 18,
    zIndex: 10,
  },
  tikTokAvatarWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  tikTokAvatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tikTokFollowDot: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0D0B1A',
  },
  tikTokActionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  tikTokActionCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tikTokBottomGrad: {
    paddingHorizontal: 14,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 8,
  },
  tikTokUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  tikTokUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tikTokUserName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tikTokVerifiedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tikTokHandle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 1,
  },
  tikTokContent: {
    color: '#F5F3FF',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tikTokTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tikTokTag: {
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tikTokDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
    alignSelf: 'flex-start',
  },
  tikTokDeliveryText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  tikTokMusicBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  tikTokMusicText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    flex: 1,
  },

  // Trending creators
  creatorsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  creatorCard: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
  },
  creatorCardInner: {
    alignItems: 'center',
    padding: 16,
    gap: 6,
  },
  creatorName: {
    color: '#F5F3FF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  creatorHandle: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '500',
  },
  creatorFollowers: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
  },
  followBtn: {
    marginTop: 4,
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1,
    borderColor: '#7C3AED',
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderRadius: 20,
  },
  followBtnText: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '700',
  },

  // Quick grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },
  quickTile: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 16,
    padding: 18,
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  quickTileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  quickTileLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Platform banner
  platformBanner: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 22,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  platformBannerTitle: {
    color: '#F5F3FF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  platformBannerSub: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 18,
  },
  platformIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platformIconItem: {
    alignItems: 'center',
    gap: 6,
  },
  platformIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(167,139,250,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  platformIconLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
  },
});
