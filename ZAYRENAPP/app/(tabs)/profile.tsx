import React, { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { API_URL } from '@/lib/api';

const { width: W } = Dimensions.get('window');

const ACHIEVEMENTS = [
  { id: '1', label: 'First Post', icon: 'edit-3', color: '#A78BFA', earned: true },
  { id: '2', label: 'Marketplace Pro', icon: 'shopping-bag', color: '#F59E0B', earned: true },
  { id: '3', label: '1K Club', icon: 'award', color: '#EF4444', earned: true },
  { id: '4', label: 'Top Seller', icon: 'star', color: '#10B981', earned: false },
  { id: '5', label: 'Verified', icon: 'shield', color: '#3B82F6', earned: false },
  { id: '6', label: 'Live Host', icon: 'radio', color: '#EC4899', earned: false },
];

const POSTS_GRID = [
  { id: '1', gradient: ['#7C3AED', '#A78BFA'] as [string, string] },
  { id: '2', gradient: ['#F59E0B', '#EF4444'] as [string, string] },
  { id: '3', gradient: ['#10B981', '#3B82F6'] as [string, string] },
  { id: '4', gradient: ['#F97316', '#EAB308'] as [string, string] },
  { id: '5', gradient: ['#8B5CF6', '#EC4899'] as [string, string] },
  { id: '6', gradient: ['#06B6D4', '#7C3AED'] as [string, string] },
  { id: '7', gradient: ['#EC4899', '#F97316'] as [string, string] },
  { id: '8', gradient: ['#EF4444', '#F97316'] as [string, string] },
  { id: '9', gradient: ['#A78BFA', '#06B6D4'] as [string, string] },
];

const PROFILE_TABS = ['Posts', 'Reels', 'Listings', 'Liked'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Posts');
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const CELL = (W - 4) / 3;

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let userId = await SecureStore.getItemAsync('zayren_user_id');
      let localName = await SecureStore.getItemAsync('zayren_user_name');
      let localUsername = await SecureStore.getItemAsync('zayren_user_username');
      
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
            userId = user.id;
            await SecureStore.setItemAsync('zayren_user_id', userId);
        }
      }

      if (!userId) {
        // If we don't have an ID but somehow got here, we are in a bad state. Force logout.
        await SecureStore.deleteItemAsync('zayren_is_authenticated');
        if (typeof global.setIsAuthenticatedGlobal === 'function') {
            global.setIsAuthenticatedGlobal(false);
        }
        await supabase.auth.signOut();
        throw new Error('Not logged in. Redirecting...');
      }

      // Try fetching from backend API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
      
      let fetchedData = null;
      try {
        const res = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          fetchedData = await res.json();
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.log('[Profile] Backend unreachable or timeout. Using fallback Supabase data.');
      }

      if (fetchedData) {
          setUserData(fetchedData);
      } else {
          // Fallback: Fetch basic user info from Supabase auth directly
          const { data: { user } } = await supabase.auth.getUser();
          setUserData({
              id: userId,
              name: user?.user_metadata?.name || localName || 'Zayren User',
              username: user?.user_metadata?.username || localUsername || 'zayren_user',
              bio: user?.user_metadata?.bio || 'No bio provided yet.',
              location: user?.user_metadata?.location || 'Planet Earth',
              stats: { followers_count: 0, following_count: 0, posts_count: 0, sales_total_cents: 0 }
          });
      }

    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching user data');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  const displayName = userData?.name || 'Zayren User';
  const handle = userData?.username ? `@${userData.username}` : '@zayren.user';
  const initial = displayName.charAt(0).toUpperCase();
  const bio = userData?.bio || 'No bio provided.';
  const location = userData?.location || 'Location not set';
  const profilePic = userData?.profile_pic;
  const coverPic = userData?.cover_photo || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop';
  const joinDate = userData?.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Joined July 2026';

  const calculateCompletion = () => {
    let score = 0;
    if (userData?.name) score += 20;
    if (userData?.username) score += 20;
    if (userData?.bio) score += 20;
    if (userData?.location) score += 20;
    if (userData?.profile_pic) score += 20;
    return score;
  };
  const completionPercent = calculateCompletion();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
        <Text style={{ color: '#ef4444', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={fetchUser}>
          <Text style={styles.editBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dynamicStats = [
    { label: 'Followers', value: userData?.stats?.followers_count || '0', icon: 'users', color: '#A78BFA' },
    { label: 'Following', value: userData?.stats?.following_count || '0', icon: 'user-plus', color: '#10B981' },
    { label: 'Posts', value: userData?.stats?.posts_count || '0', icon: 'grid', color: '#F59E0B' },
    { label: 'Sold', value: userData?.stats?.sales_total_cents ? `$${(userData.stats.sales_total_cents / 100).toFixed(2)}` : '$0', icon: 'trending-up', color: '#EC4899' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cover + Header */}
        <View style={{ height: 160 }}>
          <Image source={{ uri: coverPic }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
          <View style={styles.coverPattern} />
          <View style={[styles.topBarButtons, { paddingTop: insets.top + 8 }]}>
            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 8 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>
                {userData?.username || 'Profile'}
              </Text>
            </View>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.topBarBtn} onPress={() => router.push('/dev-tools')}>
                <Feather name="tool" size={20} color="#D1D5DB" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.topBarBtn} onPress={() => router.push('/settings')}>
                <Feather name="menu" size={24} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Avatar + Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </LinearGradient>
              )}
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={9} color="#fff" />
              </View>
            </View>
            <View style={styles.editBtnWrapper}>
              <TouchableOpacity style={styles.messageBtn}>
                <Feather name="message-circle" size={15} color="#fff" />
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn}>
                <Feather name="share-2" size={16} color="#A78BFA" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.displayName}>{displayName}</Text>
          <View style={styles.handleRow}>
            <Text style={styles.handle}>{handle} · Creator & Seller</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>4.9</Text>
              <Text style={styles.reviewsText}>(128 reviews)</Text>
            </View>
          </View>

          {/* Profile Completion Bar */}
          <View style={styles.completionContainer}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionLabel}>Profile Completion</Text>
              <Text style={styles.completionPercent}>{completionPercent}%</Text>
            </View>
            <View style={styles.completionBarBG}>
              <LinearGradient 
                colors={['#7C3AED', '#00FCFF']} 
                start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                style={[styles.completionBarFill, { width: `${completionPercent}%` }]} 
              />
            </View>
          </View>

          <Text style={styles.bio}>{bio}</Text>

          <View style={styles.bioLinks}>
            <TouchableOpacity style={styles.bioLink}>
              <Feather name="link" size={12} color="#A78BFA" />
              <Text style={styles.bioLinkText}>zayren.app/me</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bioLink}>
              <Feather name="map-pin" size={12} color="#6B7280" />
              <Text style={styles.bioLinkTextGray}>{location}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bioLink}>
              <Feather name="calendar" size={12} color="#6B7280" />
              <Text style={styles.bioLinkTextGray}>{joinDate}</Text>
            </TouchableOpacity>
          </View>

          {/* About Me & Skills */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitleLeft}>About Me</Text>
            <Text style={styles.aboutText}>{userData?.about || "I am a digital creator passionate about crafting next-generation digital experiences."}</Text>
            
            <View style={styles.skillsRow}>
              {['Digital Art', 'Tech Enthusiast', 'Web3', 'Design'].map((skill) => (
                <View key={skill} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {dynamicStats.map((stat) => (
            <TouchableOpacity key={stat.label} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Feather name={stat.icon as any} size={14} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsRow}>
            {ACHIEVEMENTS.map((badge) => (
              <View key={badge.id} style={[styles.badge, !badge.earned && styles.badgeLocked]}>
                <View style={[styles.badgeIcon, { 
                  backgroundColor: badge.earned ? badge.color + '25' : '#1F2937', 
                  borderColor: badge.earned ? badge.color + '50' : '#374151' 
                }]}>
                  <Feather name={badge.icon as any} size={20} color={badge.earned ? badge.color : '#6B7280'} />
                </View>
                <Text style={[styles.badgeLabel, !badge.earned && styles.badgeLabelLocked]}>{badge.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {PROFILE_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.profileTab, activeTab === tab && styles.profileTabActive]}
            >
              <Text style={[styles.profileTabText, activeTab === tab && styles.profileTabTextActive]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.profileTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts grid */}
        {activeTab === 'Posts' && (
          <View style={styles.postsGrid}>
            {POSTS_GRID.map((post, idx) => (
              <TouchableOpacity key={post.id} activeOpacity={0.85}>
                <LinearGradient colors={post.gradient} style={[styles.gridCell, { width: CELL, height: CELL }]}>
                  <Feather name="image" size={24} color="rgba(255,255,255,0.3)" />
                  {idx === 0 && (
                    <View style={styles.pinnedBadge}>
                      <Feather name="bookmark" size={10} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab !== 'Posts' && (
          <View style={styles.emptyTab}>
            <Feather name="inbox" size={40} color="#374151" />
            <Text style={styles.emptyTabText}>No {activeTab.toLowerCase()} yet</Text>
          </View>
        )}
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1A' },
  coverPattern: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.15,
  },
  topBarButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topBarRight: { flexDirection: 'row', gap: 8 },
  topBarBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { paddingHorizontal: 16, marginTop: -24 },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0D0B1A',
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  verifiedBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D0B1A',
  },
  editBtnWrapper: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingBottom: 6 },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
  },
  messageBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  editBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
    backgroundColor: 'rgba(167,139,250,0.08)',
  },
  editBtnText: { color: '#A78BFA', fontSize: 13, fontWeight: '700' },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
    backgroundColor: 'rgba(167,139,250,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: { color: '#F5F3FF', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  handleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  handle: { color: '#6B7280', fontSize: 12, fontWeight: '500' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#F5F3FF', fontSize: 12, fontWeight: '700' },
  reviewsText: { color: '#9CA3AF', fontSize: 11 },
  completionContainer: { marginBottom: 16 },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  completionLabel: { color: '#D1D5DB', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  completionPercent: { color: '#00FCFF', fontSize: 11, fontWeight: '700' },
  completionBarBG: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  completionBarFill: { height: '100%', borderRadius: 3 },
  bio: { color: '#D1D5DB', fontSize: 13, lineHeight: 21, marginBottom: 12 },
  bioLinks: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginBottom: 16 },
  bioLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bioLinkText: { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  bioLinkTextGray: { color: '#6B7280', fontSize: 12 },
  aboutSection: { marginTop: 4, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  sectionTitleLeft: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  aboutText: { color: '#9CA3AF', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  skillText: { color: '#D1D5DB', fontSize: 11, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
  },
  statItem: { alignItems: 'center', gap: 6, flex: 1 },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: '#F5F3FF', fontSize: 16, fontWeight: '800' },
  statLabel: { color: '#6B7280', fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  achievementsSection: { marginTop: 14 },
  sectionTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase', paddingHorizontal: 16 },
  achievementsRow: { paddingHorizontal: 16, gap: 12 },
  badge: { alignItems: 'center', gap: 6, width: 68 },
  badgeLocked: { opacity: 0.45 },
  badgeIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  badgeLabel: { color: '#D1D5DB', fontSize: 9, fontWeight: '600', textAlign: 'center' },
  badgeLabelLocked: { color: '#4B5563' },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginTop: 16,
  },
  profileTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  profileTabActive: {},
  profileTabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  profileTabTextActive: { color: '#F5F3FF', fontWeight: '700' },
  profileTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: '#A78BFA',
    borderRadius: 1,
  },
  postsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gridCell: { alignItems: 'center', justifyContent: 'center' },
  pinnedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTab: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyTabText: { color: '#374151', fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
});
