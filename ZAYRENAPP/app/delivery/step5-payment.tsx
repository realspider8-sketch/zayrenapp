import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Step5PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePay = () => {
    router.push('/delivery/step6-pickup');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subTitle}>Your delivery has been verified</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Office</Text>
            <Text style={styles.value}>ZAYREN Express</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>1.4 km</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Fee</Text>
            <Text style={styles.feeValue}>₦2,000</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Time</Text>
            <Text style={styles.value}>35 – 45 min</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Pickup</Text>
          <Text style={styles.shopName}>@Amara.Creates Shop</Text>
          <Text style={styles.addressText}>24b, Allen Avenue, Ikeja</Text>

          <View style={{ height: 16 }} />

          <Text style={styles.sectionLabel}>Delivery To</Text>
          <Text style={styles.addressText}>42 Maple Avenue, Ikeja,{'\n'}Lagos State.</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
          <LinearGradient 
            colors={['#7C3AED', '#A78BFA']} 
            style={styles.payBtnGrad} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.payBtnText}>Pay ₦2,000</Text>
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
  
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  label: { color: '#9CA3AF', fontSize: 13 },
  value: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  feeValue: { color: '#F5F3FF', fontSize: 14, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  
  sectionLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 6 },
  shopName: { color: '#F5F3FF', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  addressText: { color: '#D1D5DB', fontSize: 13, lineHeight: 18 },

  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  payBtn: { borderRadius: 14, overflow: 'hidden' },
  payBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
