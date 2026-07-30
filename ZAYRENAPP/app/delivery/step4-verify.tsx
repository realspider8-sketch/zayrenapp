import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Step4VerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleAccept = () => {
    router.push('/delivery/step5-payment');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Delivery Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subTitle}>Please confirm the details</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Customer</Text>
          <View style={styles.row}>
            <Text style={styles.value}>Arfat Danjummai</Text>
            <Text style={styles.valueDim}>0803 123 4567</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Delivery Address</Text>
          <Text style={styles.addressText}>42 Maple Avenue, Ikeja,{'\n'}Lagos State.</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Receipt</Text>
          <View style={styles.attachBox}>
            <View style={styles.pdfIconWrap}>
              <MaterialCommunityIcons name="file-pdf-box" size={28} color="#EF4444" />
            </View>
            <View style={styles.attachInfo}>
              <Text style={styles.attachFileName}>Receipt_ZAY-REC-001.pdf</Text>
              <Text style={styles.attachSub}>Tap to preview</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
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
            <Text style={styles.label}>Total Paid</Text>
            <Text style={styles.totalValue}>₦23,000</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => router.back()}>
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
          <Text style={styles.acceptBtnText}>Accept</Text>
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
  sectionLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { color: '#F5F3FF', fontSize: 14, fontWeight: '600' },
  valueDim: { color: '#D1D5DB', fontSize: 13 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  addressText: { color: '#F5F3FF', fontSize: 14, lineHeight: 20, fontWeight: '500' },

  attachBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  pdfIconWrap: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' },
  attachInfo: { flex: 1, marginLeft: 12, gap: 2 },
  attachFileName: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  attachSub: { color: '#6B7280', fontSize: 11 },

  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemName: { flex: 1, color: '#D1D5DB', fontSize: 13 },
  itemQty: { color: '#F5F3FF', fontSize: 13, fontWeight: '500' },

  label: { color: '#9CA3AF', fontSize: 14 },
  totalValue: { color: '#F5F3FF', fontSize: 16, fontWeight: '800' },

  footer: { flexDirection: 'row', padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 12 },
  rejectBtn: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  rejectBtnText: { color: '#D1D5DB', fontSize: 15, fontWeight: '600' },
  acceptBtn: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981' },
  acceptBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
