import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Tab Icon Component ──────────────────────────────────────────────────

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      {focused && <View style={styles.tabActiveDot} />}
      {icon}
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

// ─── Chat Tab (special elevated pill matching screenshot) ─────────────────

function ChatTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.chatTabWrap}>
      <View style={[styles.chatTabPill, focused && styles.chatTabPillActive]}>
        {focused ? (
          <LinearGradient
            colors={['rgba(124,58,237,0.35)', 'rgba(167,139,250,0.2)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : null}
        <Feather
          name="message-circle"
          size={22}
          color={focused ? '#A78BFA' : '#6B7280'}
        />
        <Text style={[styles.chatTabLabel, focused && styles.chatTabLabelActive]}>
          Chat
        </Text>
      </View>
    </View>
  );
}

// ─── Post FAB (center plus button) ───────────────────────────────────────

function PostTabIcon() {
  return (
    <View style={styles.postButton}>
      <Feather name="plus" size={26} color="#fff" />
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, styles.tabBarBg]} />
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={22}
                  color={focused ? '#A78BFA' : '#6B7280'}
                />
              }
              label="Home"
              focused={focused}
            />
          ),
        }}
      />

      {/* Market */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Market',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={
                <Feather
                  name="shopping-bag"
                  size={22}
                  color={focused ? '#A78BFA' : '#6B7280'}
                />
              }
              label="Market"
              focused={focused}
            />
          ),
        }}
      />

      {/* Chat — elevated pill */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={
                <Ionicons
                  name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                  size={22}
                  color={focused ? '#A78BFA' : '#6B7280'}
                />
              }
              label="Chat"
              focused={focused}
            />
          ),
        }}
      />

      {/* Post — FAB */}
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: () => <PostTabIcon />,
        }}
      />

      {/* Delivery */}
      <Tabs.Screen
        name="delivery"
        options={{
          title: 'Delivery',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={
                <MaterialCommunityIcons
                  name={focused ? 'truck-delivery' : 'truck-delivery-outline'}
                  size={22}
                  color={focused ? '#A78BFA' : '#6B7280'}
                />
              }
              label="Delivery"
              focused={focused}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={22}
                  color={focused ? '#A78BFA' : '#6B7280'}
                />
              }
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />

      {/* Help */}
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={
                <Feather
                  name="help-circle"
                  size={22}
                  color={focused ? '#A78BFA' : '#6B7280'}
                />
              }
              label="Help"
              focused={focused}
            />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Tab bar shell
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    height: Platform.OS === 'ios' ? 90 : 74,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tabBarBg: {
    backgroundColor: 'rgba(9, 8, 20, 0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(167, 139, 250, 0.12)',
    // Frosted shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  // Standard tab item
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 3,
    minWidth: 40,
  },
  tabItemFocused: {},
  tabActiveDot: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A78BFA',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  tabLabelFocused: {
    color: '#A78BFA',
    fontWeight: '700',
  },

  // Chat pill (elevated, rounded pill — matches screenshot)
  chatTabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
  },
  chatTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chatTabPillActive: {
    borderColor: 'rgba(167,139,250,0.35)',
  },
  chatTabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  chatTabLabelActive: {
    color: '#A78BFA',
    fontWeight: '800',
  },

  // Post FAB
  postButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 10,
  },
});
