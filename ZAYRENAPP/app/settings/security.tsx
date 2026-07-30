import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password & Security</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login & Recovery</Text>
          <View style={styles.formGroup}>
            <TouchableOpacity style={styles.inputRow}>
              <View style={styles.labelRow}>
                <Feather name="key" size={20} color="#D1D5DB" />
                <Text style={styles.label}>Change Password</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.separator} />

            <TouchableOpacity style={styles.inputRow}>
              <View style={styles.labelRow}>
                <Feather name="smartphone" size={20} color="#D1D5DB" />
                <Text style={styles.label}>Two-Factor Authentication</Text>
              </View>
              <View style={styles.valueRow}>
                <Text style={styles.valueActive}>On</Text>
                <Feather name="chevron-right" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Checks</Text>
          <View style={styles.formGroup}>
            <TouchableOpacity style={styles.inputRow}>
              <View style={styles.labelRow}>
                <Feather name="activity" size={20} color="#D1D5DB" />
                <Text style={styles.label}>Login Activity</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.inputRow}>
              <View style={styles.labelRow}>
                <Feather name="mail" size={20} color="#D1D5DB" />
                <Text style={styles.label}>Emails from Zayren</Text>
              </View>
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
  section: { marginTop: 24 },
  sectionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginLeft: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  formGroup: { 
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, minHeight: 60,
  },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 48 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { color: '#F3F4F6', fontSize: 15 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  valueActive: { color: '#10B981', fontSize: 15, fontWeight: '600' },
});
