import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';


export default function Step7TrackingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { requestId } = useLocalSearchParams();
  const [requestData, setRequestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      fetch(`${API_URL}/api/delivery/request/${requestId}`)
        .then(res => res.json())
        .then(data => {
          setRequestData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch tracking data", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [requestId]);

  const handleLiveLocation = () => {
    router.push({
      pathname: '/delivery/step8-completed',
      params: { requestId }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Loading tracking details...</Text>
      </View>
    );
  }

  const items = requestData?.order?.items || [];
  const rider = requestData?.delivery_partner;
  const deliveryId = requestId ? `ZAY-${requestId.toString().slice(0, 4).toUpperCase()}` : 'ZAY-001';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Out for Delivery</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subTitle}>Your rider is on the way</Text>

        {rider ? (
          <View style={styles.riderCard}>
            <View style={styles.riderAvatar}>
              <Feather name="user" size={24} color="#A78BFA" />
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>{rider.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{rider.rating}</Text>
              </View>
            </View>
            <View style={styles.riderActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Feather name="phone" size={16} color="#D1D5DB" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.riderCard}>
            <Text style={{ color: '#D1D5DB' }}>Assigning a delivery partner soon...</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery ID</Text>
            <Text style={styles.value}>{deliveryId}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Items ({items.length})</Text>
          {items.map((it: any) => (
            <View style={styles.itemRow} key={it.id}>
              <Text style={styles.itemName} numberOfLines={1}>{it.product?.name || 'Item'}</Text>
              <Text style={styles.itemQty}>x{it.quantity}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Estimated Arrival</Text>
            <Text style={styles.timeValue}>{requestData?.delivery_office?.estimated_time || 'Calculating...'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.liveBtn} onPress={handleLiveLocation}>
          <LinearGradient 
            colors={['#7C3AED', '#A78BFA']} 
            style={styles.liveBtnGrad} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.liveBtnText}>View Live Location</Text>
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
  headerTitle: { color: '#F5F3FF', fontSize: 16, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  subTitle: { color: '#9CA3AF', fontSize: 13, marginBottom: 20 },
  
  riderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },
  riderAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(124,58,237,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  riderInfo: { flex: 1 },
  riderName: { color: '#F5F3FF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#D1D5DB', fontSize: 13 },
  riderActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  card: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#9CA3AF', fontSize: 13 },
  value: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  
  sectionLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemName: { flex: 1, color: '#D1D5DB', fontSize: 13 },
  itemQty: { color: '#F5F3FF', fontSize: 13, fontWeight: '500' },

  timeValue: { color: '#F5F3FF', fontSize: 14, fontWeight: '700' },

  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  liveBtn: { borderRadius: 14, overflow: 'hidden' },
  liveBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  liveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
