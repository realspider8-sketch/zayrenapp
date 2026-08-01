import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { API_URL } from '@/lib/api';

const GRAD_MAP: [string, string][] = [
  ['#7C3AED', '#A78BFA'],
  ['#1e40af', '#3B82F6'],
  ['#92400e', '#F97316'],
  ['#1e293b', '#475569'],
];

export default function Step1OfficeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { preSelectedId, receiptId } = useLocalSearchParams();

  const [offices, setOffices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(
    typeof preSelectedId === 'string' ? preSelectedId : null
  );

  useEffect(() => {
    const fetchOffices = async () => {
      setLoading(true);
      try {
        let res = await fetch(`${API_URL}/api/delivery/offices`);
        let data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          res = await fetch(`${API_URL}/api/delivery/offices/seed`, { method: 'POST' });
          data = await res.json();
        }
        setOffices(Array.isArray(data) ? data : []);
      } catch (e) {
        // Fallback
        setOffices([
          { id: '1', name: 'ZAYREN Express', distance_km: 1.2, rating: 4.8, reviews_count: 230, estimated_time: '25–40 min', base_fee: 2000 },
          { id: '2', name: 'City Swift Logistics', distance_km: 1.8, rating: 4.6, reviews_count: 178, estimated_time: '30–45 min', base_fee: 2200 },
          { id: '3', name: 'RapidGo Delivery', distance_km: 2.3, rating: 4.5, reviews_count: 156, estimated_time: '35–50 min', base_fee: 2500 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffices();
  }, []);

  const handleContinue = () => {
    if (selectedOffice) {
      router.push({
        pathname: '/delivery/step2-receipt',
        params: { officeId: selectedOffice, receiptId }
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Office</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color="#6B7280" />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search delivery office..."
          placeholderTextColor="#4B5563"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Near you</Text>
        <TouchableOpacity style={styles.currentLocationRow}>
          <Feather name="map-pin" size={14} color="#A78BFA" />
          <Text style={styles.currentLocationText}>Use my current location</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280' }}>Loading offices...</Text>
          </View>
        ) : offices.map((office, idx) => {
          const grad = GRAD_MAP[idx % GRAD_MAP.length];
          const initials = (office.name || 'XX').split(' ').map((w: string) => w[0]).join('').slice(0, 3);
          return (
          <TouchableOpacity 
            key={office.id} 
            style={[styles.officeCard, selectedOffice === office.id && styles.officeCardActive]}
            onPress={() => setSelectedOffice(office.id)}
          >
            {selectedOffice === office.id && (
              <LinearGradient colors={['rgba(124,58,237,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
            )}
            
            <View style={styles.officeTopRow}>
              <LinearGradient colors={grad} style={styles.officeLogo}>
                <Text style={styles.officeLogoText}>{initials}</Text>
              </LinearGradient>
              
              <View style={styles.officeInfo}>
                <Text style={styles.officeName}>{office.name}</Text>
                <Text style={styles.officeDistance}>{office.distance_km} km away</Text>
                
                <View style={styles.officeMetaRow}>
                  <Ionicons name="star" size={11} color="#F59E0B" />
                  <Text style={styles.officeMetaText}>{office.rating} ({office.reviews_count})</Text>
                  <Text style={styles.bullet}>•</Text>
                  <Feather name="clock" size={11} color="#6B7280" />
                  <Text style={styles.officeMetaText}>{office.estimated_time}</Text>
                </View>
              </View>

              <View style={styles.officeRight}>
                {selectedOffice === office.id && (
                  <View style={styles.checkBadge}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                )}
                <Text style={styles.officeFee}>₦{(office.base_fee ?? 0).toLocaleString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity 
          style={[styles.continueBtn, !selectedOffice && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedOffice}
        >
          <LinearGradient 
            colors={selectedOffice ? ['#7C3AED', '#A78BFA'] : ['#374151', '#4B5563']} 
            style={styles.continueBtnGrad} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F5F3FF', fontSize: 18, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, color: '#F5F3FF', fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { color: '#6B7280', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  currentLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  currentLocationText: { color: '#A78BFA', fontSize: 14, fontWeight: '500' },
  officeCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  officeCardActive: { borderColor: '#7C3AED' },
  officeTopRow: { flexDirection: 'row', alignItems: 'center' },
  officeLogo: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  officeLogoText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  officeInfo: { flex: 1, marginLeft: 12, gap: 4 },
  officeName: { color: '#F5F3FF', fontSize: 15, fontWeight: '700' },
  officeDistance: { color: '#9CA3AF', fontSize: 12 },
  officeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  officeMetaText: { color: '#6B7280', fontSize: 11 },
  bullet: { color: '#4B5563', fontSize: 11 },
  officeRight: { alignItems: 'flex-end', justifyContent: 'space-between', height: 48 },
  checkBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  officeFee: { color: '#F5F3FF', fontSize: 14, fontWeight: '700', marginTop: 'auto' },
  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  continueBtn: { borderRadius: 14, overflow: 'hidden' },
  continueBtnDisabled: { opacity: 0.7 },
  continueBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
