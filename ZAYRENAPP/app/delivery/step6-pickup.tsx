import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Step6PickupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleConfirm = () => {
    router.push('/delivery/step7-tracking');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subTitle}>Confirm item collection from shop</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt ID</Text>
            <Text style={styles.value}>ZAY-REC-001</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Shop</Text>
            <Text style={styles.value}>@Amara.Creates</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Items (2)</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>Neon Hoodie — Limited</Text>
            <Text style={styles.itemQty}>x1</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>Gourmet Spice Set</Text>
            <Text style={styles.itemQty}>x2</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Total Items</Text>
            <Text style={styles.value}>3</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pickup Time</Text>
            <Text style={styles.value}>19 July, 2026 • 2:30 PM</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.signatureHeader}>
            <Text style={styles.sectionLabel}>Shop Signature</Text>
            <TouchableOpacity>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signatureBox}>
            <Text style={[styles.mockSignature, { transform: [{ rotate: '-5deg' }] }]}>Amara.C</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirm Pickup</Text>
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
  
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#9CA3AF', fontSize: 13 },
  value: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  
  sectionLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemName: { flex: 1, color: '#D1D5DB', fontSize: 13 },
  itemQty: { color: '#F5F3FF', fontSize: 13, fontWeight: '500' },

  signatureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  clearText: { color: '#A78BFA', fontSize: 12, fontWeight: '500' },
  signatureBox: { height: 80, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  mockSignature: { color: '#F5F3FF', fontSize: 32, fontFamily: 'serif', fontStyle: 'italic', opacity: 0.8 },

  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  confirmBtn: { borderRadius: 14, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
