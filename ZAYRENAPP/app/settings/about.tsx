import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <Text style={styles.appName}>ZAYREN</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.formGroup}>
            <TouchableOpacity style={styles.inputRow}>
              <Text style={styles.label}>Data Policy</Text>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.separator} />

            <TouchableOpacity style={styles.inputRow}>
              <Text style={styles.label}>Terms of Use</Text>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.separator} />

            <TouchableOpacity style={styles.inputRow}>
              <Text style={styles.label}>Open Source Libraries</Text>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  appName: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 4 },
  version: { color: '#6B7280', fontSize: 14, marginTop: 8 },
  section: { marginTop: 24 },
  formGroup: { 
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, minHeight: 60,
  },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 16 },
  label: { color: '#F3F4F6', fontSize: 15 },
});
