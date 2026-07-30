import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';

const SETTINGS_SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: 'personal_info', icon: 'user', label: 'Personal Information' },
      { id: 'security', icon: 'shield', label: 'Password & Security' },
    ]
  },
  {
    title: 'Content & Display',
    items: [
      { id: 'notifications', icon: 'bell', label: 'Notifications' },
      { id: 'privacy', icon: 'lock', label: 'Privacy' },
      { id: 'dark_mode', icon: 'moon', label: 'Dark Mode' },
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'help', icon: 'help-circle', label: 'Help Center' },
      { id: 'about', icon: 'info', label: 'About' },
    ]
  }
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('zayren_is_authenticated');
              await SecureStore.deleteItemAsync('zayren_user_id');
              if (typeof global.setIsAuthenticatedGlobal === 'function') {
                global.setIsAuthenticatedGlobal(false);
              }
              await supabase.auth.signOut();
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {SETTINGS_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => router.push(`/settings/${item.id}` as any)}
                  style={[
                    styles.itemRow, 
                    itemIndex < section.items.length - 1 && styles.itemBorder
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.iconWrapper}>
                      <Feather name={item.icon as any} size={20} color="#D1D5DB" />
                    </View>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Zayren App v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 50 },
  section: { marginBottom: 24 },
  sectionTitle: { 
    color: '#9CA3AF', 
    fontSize: 13, 
    fontWeight: '600', 
    marginBottom: 8, 
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  }
});
