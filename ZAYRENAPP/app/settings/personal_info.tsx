import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function PersonalInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Provide your personal information, even if the account is used for a business, a pet or something else. This won't be part of your public profile.
        </Text>

        <View style={styles.formGroup}>
          <TouchableOpacity style={styles.inputRow}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value}>user@example.com</Text>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />

          <TouchableOpacity style={styles.inputRow}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value}>+1 234 567 890</Text>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />

          <TouchableOpacity style={styles.inputRow}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value}>01 Jan 1990</Text>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </View>
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
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  description: { color: '#9CA3AF', fontSize: 13, lineHeight: 20, padding: 20 },
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
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  value: { color: '#9CA3AF', fontSize: 15 },
});
