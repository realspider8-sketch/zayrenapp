import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function DarkModeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [theme, setTheme] = useState('dark');

  const themes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System Default' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dark Mode</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.formGroup}>
            {themes.map((t, index) => (
              <React.Fragment key={t.id}>
                <TouchableOpacity 
                  style={styles.inputRow}
                  onPress={() => setTheme(t.id)}
                >
                  <Text style={styles.label}>{t.label}</Text>
                  <View style={[styles.radioCircle, theme === t.id && styles.radioActive]}>
                    {theme === t.id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
                {index < themes.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
          <Text style={styles.helperText}>
            If you choose System Default, Zayren will automatically adjust your appearance based on your device's system settings.
          </Text>
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
  radioCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#6B7280',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#A78BFA' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#A78BFA' },
  helperText: { color: '#6B7280', fontSize: 12, paddingHorizontal: 16, paddingTop: 12, lineHeight: 18 },
});
