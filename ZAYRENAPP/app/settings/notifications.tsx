import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where You Receive Them</Text>
          <View style={styles.formGroup}>
            <View style={styles.inputRow}>
              <View style={styles.labelRow}>
                <Feather name="bell" size={20} color="#D1D5DB" />
                <Text style={styles.label}>Push Notifications</Text>
              </View>
              <Switch 
                value={pushEnabled} 
                onValueChange={setPushEnabled} 
                trackColor={{ false: '#374151', true: '#A78BFA' }}
                thumbColor={'#fff'}
              />
            </View>
            <View style={styles.separator} />

            <View style={styles.inputRow}>
              <View style={styles.labelRow}>
                <Feather name="mail" size={20} color="#D1D5DB" />
                <Text style={styles.label}>Email</Text>
              </View>
              <Switch 
                value={emailEnabled} 
                onValueChange={setEmailEnabled} 
                trackColor={{ false: '#374151', true: '#A78BFA' }}
                thumbColor={'#fff'}
              />
            </View>
            <View style={styles.separator} />

            <View style={styles.inputRow}>
              <View style={styles.labelRow}>
                <Feather name="message-square" size={20} color="#D1D5DB" />
                <Text style={styles.label}>SMS</Text>
              </View>
              <Switch 
                value={smsEnabled} 
                onValueChange={setSmsEnabled} 
                trackColor={{ false: '#374151', true: '#A78BFA' }}
                thumbColor={'#fff'}
              />
            </View>
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
});
