import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

// ─── Data ──────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { id: 'all',     label: 'All',     icon: 'layers',          badge: 0 },
  { id: 'unread',  label: 'Unread',  icon: 'mail',            badge: 0 },
  { id: 'groups',  label: 'Groups',  icon: 'users',           badge: 0 },
  { id: 'orders',  label: 'Orders',  icon: 'shopping-bag',    badge: 0 },
];

// ─── Story Bubble ────────────────────────────────────────────────────────

function StoryBubble({ user }: { user: any }) {
  return (
    <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
      <View style={styles.storyRingWrap}>
        {/* Gradient ring */}
        <LinearGradient
          colors={user.online ? user.grad : ['#374151', '#374151']}
          style={styles.storyRing}
        >
          <View style={styles.storyRingInner}>
            <LinearGradient colors={user.grad} style={styles.storyAvatar}>
              {user.isBot ? (
                <MaterialCommunityIcons name="robot-outline" size={22} color="#fff" />
              ) : (
                <Text style={styles.storyInitials}>{user.initials}</Text>
              )}
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Online dot */}
        {user.online && <View style={styles.storyOnlineDot} />}

        {/* "New" badge for ZayBot */}
        {user.hasNew && (
          <View style={styles.storyNewBadge}>
            <Text style={styles.storyNewText}>New</Text>
          </View>
        )}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{user.name}</Text>
    </TouchableOpacity>
  );
}

// ─── Conversation Row ─────────────────────────────────────────────────────

function ConversationRow({ item }: { item: any }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress}>
      <Animated.View style={[styles.convRow, { transform: [{ scale: scaleAnim }] }]}>
        {/* Avatar */}
        <View style={styles.convAvatarWrap}>
          <LinearGradient colors={item.grad} style={styles.convAvatar}>
            {item.isGroup ? (
              <Feather name="users" size={22} color="#fff" />
            ) : item.isSupport ? (
              <Text style={styles.convAvatarText}>Z</Text>
            ) : (
              <Text style={styles.convAvatarText}>{item.initials}</Text>
            )}
          </LinearGradient>
          {item.online && <View style={styles.convOnlineDot} />}
        </View>

        {/* Text */}
        <View style={styles.convBody}>
          <View style={styles.convTopRow}>
            <View style={styles.convNameRow}>
              <Text style={[styles.convName, item.unread > 0 && styles.convNameBold]}>
                {item.name}
              </Text>
              {item.verified && (
                <MaterialCommunityIcons name="check-decagram" size={14} color="#A78BFA" />
              )}
            </View>
            <Text style={[styles.convTime, item.unread > 0 && styles.convTimeBold]}>
              {item.time}
            </Text>
          </View>

          <View style={styles.convBottomRow}>
            <Text
              style={[styles.convLastMsg, item.unread > 0 && styles.convLastMsgBold]}
              numberOfLines={1}
            >
              {item.lastMsg}
            </Text>
            {item.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread}</Text>
              </View>
            ) : (
              <View style={styles.unreadDotSmall} />
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

import { API_URL } from '@/lib/api';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        let url = `${API_URL}/api/users`;
        if (search.trim().length > 0) {
          url = `${API_URL}/api/users/search?q=${encodeURIComponent(search.trim())}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        
        // Map API response to UI expected shape
        const mapped = data.map((u: any, idx: number) => {
          const gradients = [
            ['#F59E0B', '#EF4444'], ['#8B5CF6', '#EC4899'], 
            ['#7C3AED', '#A78BFA'], ['#10B981', '#3B82F6'],
            ['#F97316', '#EAB308'], ['#06B6D4', '#7C3AED'],
          ];
          const grad = gradients[idx % gradients.length];
          const initial = u.name ? u.name.charAt(0).toUpperCase() : '?';
          
          return {
            id: u.id,
            name: u.name || u.username,
            online: u.online || false,
            grad,
            initials: initial,
            hasImage: !!u.profile_pic,
            lastMsg: 'Tap to start chatting...',
            time: 'now',
            unread: u.unread || 0,
            verified: u.is_verified || false,
            isGroup: false,
            isSupport: u.role === 'ADMIN',
            isBot: false,
            hasNew: u.hasNew || false
          };
        });
        setUsers(mapped);
      } catch (err) {
        console.warn("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const filtered = users.filter((c) => {
    if (activeFilter === 'unread') return c.unread > 0;
    if (activeFilter === 'groups') return c.isGroup;
    if (activeFilter === 'orders') return c.isSupport;
    return true;
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#110E22', '#0D0B1A']} style={StyleSheet.absoluteFill} />
      <View style={styles.ambientGlow} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          {/* ZAYREN Logo */}
          <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.logoMark}>
            <Text style={styles.logoMarkText}>Z</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>ZAYREN</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="camera-outline" size={22} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, styles.headerBtnAccent]}>
            <Feather name="plus" size={20} color="#fff" />
            <View style={styles.headerBtnDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        stickyHeaderIndices={[1]}
      >
        {/* ── Search ── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats, people, groups..."
              placeholderTextColor="#4B5563"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterIconBtn}>
            <Feather name="sliders" size={18} color="#A78BFA" />
          </TouchableOpacity>
        </View>

        {/* ── Filter tabs (sticky) ── */}
        <View style={styles.filterTabsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsRow}
          >
            {FILTER_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveFilter(tab.id)}
                style={[styles.filterTab, activeFilter === tab.id && styles.filterTabActive]}
                activeOpacity={0.8}
              >
                {activeFilter === tab.id && (
                  <LinearGradient
                    colors={['#7C3AED', '#A78BFA']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                )}
                <Feather
                  name={tab.icon as any}
                  size={13}
                  color={activeFilter === tab.id ? '#fff' : '#6B7280'}
                />
                <Text style={[styles.filterTabText, activeFilter === tab.id && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
                {tab.badge > 0 && (
                  <View style={[styles.filterBadge, activeFilter === tab.id && styles.filterBadgeActive]}>
                    <Text style={[styles.filterBadgeText, activeFilter === tab.id && styles.filterBadgeTextActive]}>
                      {tab.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Story row ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesScroll}
          contentContainerStyle={styles.storiesContainer}
        >
          {/* Your Note */}
          <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
            <View style={styles.storyRingWrap}>
              <View style={styles.yourNoteCircle}>
                <LinearGradient
                  colors={['rgba(124,58,237,0.3)', 'rgba(167,139,250,0.15)']}
                  style={styles.yourNoteInner}
                >
                  <Feather name="plus" size={24} color="#A78BFA" />
                </LinearGradient>
              </View>
            </View>
            <Text style={styles.storyName}>Your note</Text>
          </TouchableOpacity>

          {users.map((user) => (
            <StoryBubble key={user.id} user={user} />
          ))}
        </ScrollView>

        {/* ── Conversations ── */}
        <View style={styles.convList}>
          {filtered.map((item) => (
            <ConversationRow key={item.id} item={item} />
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="message-circle" size={52} color="#1F2937" />
              <Text style={styles.emptyTitle}>No conversations</Text>
              <Text style={styles.emptySubtitle}>Start a new chat or adjust your filters</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── FAB: New chat ── */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 90 }]}>
        <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.fabGrad}>
          <Feather name="message-square" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 62;
const STORY_AVATAR_SIZE = 58;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1A' },
  ambientGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(124,58,237,0.07)',
    top: -60,
    right: -60,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  logoMarkText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerTitle: {
    color: '#F5F3FF', fontSize: 20, fontWeight: '800', letterSpacing: 2,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerBtnAccent: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderColor: 'rgba(124,58,237,0.4)',
  },
  headerBtnDot: {
    position: 'absolute',
    top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#A78BFA',
    borderWidth: 1.5, borderColor: '#0D0B1A',
  },

  // ── Search
  searchSection: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  searchInput: { flex: 1, color: '#D1D5DB', fontSize: 14 },
  filterIconBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(167,139,250,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },

  // ── Filter tabs (sticky)
  filterTabsWrap: {
    backgroundColor: '#0D0B1A',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filterTabsRow: { paddingHorizontal: 14, gap: 8, paddingVertical: 6 },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 22, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  filterTabActive: { borderColor: '#7C3AED' },
  filterTabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  filterTabTextActive: { color: '#fff', fontWeight: '700' },
  filterBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.25)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.4)',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filterBadgeText: { color: '#A78BFA', fontSize: 11, fontWeight: '800' },
  filterBadgeTextActive: { color: '#fff' },

  // ── Stories
  storiesScroll: { marginTop: 14 },
  storiesContainer: { paddingHorizontal: 16, gap: 16, paddingBottom: 8 },
  storyItem: { alignItems: 'center', gap: 6, width: 68 },
  storyRingWrap: { position: 'relative' },
  storyRing: {
    width: 70, height: 70, borderRadius: 35,
    padding: 2.5, alignItems: 'center', justifyContent: 'center',
  },
  storyRingInner: {
    width: '100%', height: '100%', borderRadius: 32,
    backgroundColor: '#0D0B1A',
    padding: 2, alignItems: 'center', justifyContent: 'center',
  },
  storyAvatar: {
    width: '100%', height: '100%', borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  storyInitials: { color: '#fff', fontSize: 18, fontWeight: '800' },
  storyOnlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2.5, borderColor: '#0D0B1A',
  },
  storyNewBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#7C3AED', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1.5, borderColor: '#0D0B1A',
  },
  storyNewText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  storyName: { color: '#9CA3AF', fontSize: 11, fontWeight: '500', textAlign: 'center' },
  yourNoteCircle: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 2, borderColor: 'rgba(167,139,250,0.3)',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  yourNoteInner: {
    width: 62, height: 62, borderRadius: 31,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Conversation List
  convList: { paddingTop: 6 },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },

  // Avatar
  convAvatarWrap: { position: 'relative', flexShrink: 0 },
  convAvatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  convAvatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  convOnlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2.5, borderColor: '#0D0B1A',
  },

  // Body
  convBody: { flex: 1, gap: 4 },
  convTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  convName: { color: '#D1D5DB', fontSize: 16, fontWeight: '500' },
  convNameBold: { color: '#F5F3FF', fontWeight: '700' },
  convTime: { color: '#4B5563', fontSize: 12, fontWeight: '500', flexShrink: 0 },
  convTimeBold: { color: '#9CA3AF' },
  convBottomRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 8,
  },
  convLastMsg: { color: '#6B7280', fontSize: 14, flex: 1 },
  convLastMsgBold: { color: '#D1D5DB', fontWeight: '600' },

  // Badges
  unreadBadge: {
    minWidth: 22, height: 22, borderRadius: 11,
    backgroundColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5, flexShrink: 0,
  },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  unreadDotSmall: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(167,139,250,0.35)',
    flexShrink: 0,
  },

  // Empty
  emptyState: { alignItems: 'center', gap: 12, paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: '#374151', fontSize: 17, fontWeight: '700' },
  emptySubtitle: { color: '#1F2937', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // FAB
  fab: {
    position: 'absolute', right: 20,
    width: 56, height: 56, borderRadius: 18,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  fabGrad: {
    width: '100%', height: '100%', borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
});
