import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/lib/api';

export default function Step2ReceiptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { officeId, receiptId } = useLocalSearchParams();
  const [receipt, setReceipt] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (receiptId) {
      fetch(`${API_URL}/api/market/receipts/detail/${receiptId}`)
        .then(r => r.json())
        .then(data => {
          setReceipt(data);
          setLoading(false);
        })
        .catch(e => {
          console.warn('Failed to load receipt', e);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [receiptId]);

  const handleContinue = () => {
    router.push({
      pathname: '/delivery/step3-info',
      params: { officeId, receiptId }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Purchase Receipt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Info */}
        <View style={styles.infoBox}>
          <LinearGradient colors={['rgba(124,58,237,0.15)', 'rgba(124,58,237,0.05)']} style={StyleSheet.absoluteFill} />
          <Feather name="send" size={16} color="#A78BFA" />
          <Text style={styles.infoText}>
            Receipt will be sent to <Text style={styles.infoTextBold}>ZAYREN Express</Text>
          </Text>
        </View>

        {/* Receipt Details Card */}
        {loading ? (
          <Text style={{ color: '#6B7280', marginVertical: 20, textAlign: 'center' }}>Loading receipt details...</Text>
        ) : receipt ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Receipt ID</Text>
              <Text style={styles.value}>{receipt.receipt_number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Shop</Text>
              <Text style={styles.value}>@{receipt.shop?.name?.replace(/\s+/g, '') || 'Shop'}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>Items ({receipt.total_items})</Text>
            {receipt.items?.map((item: any, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>₦{(item.price || 0).toLocaleString()}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Total Paid</Text>
              <Text style={styles.totalValue}>₦{(receipt.total_amount || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{new Date(receipt.date).toLocaleString()}</Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: '#EF4444', marginVertical: 20, textAlign: 'center' }}>Receipt not found</Text>
        )}

        {/* Attach Receipt Section */}
        {receipt && (
          <>
            <Text style={styles.attachTitle}>Attach Receipt</Text>
            <TouchableOpacity style={styles.attachBox} activeOpacity={0.8}>
              <View style={styles.pdfIconWrap}>
                <MaterialCommunityIcons name="file-pdf-box" size={28} color="#EF4444" />
              </View>
              <View style={styles.attachInfo}>
                <Text style={styles.attachFileName}>Receipt_{receipt.receipt_number}.pdf</Text>
                <Text style={styles.attachSub}>Ready to send to delivery office</Text>
              </View>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <LinearGradient 
            colors={['#7C3AED', '#A78BFA']} 
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
  headerTitle: { color: '#F5F3FF', fontSize: 16, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  infoBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 10, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)', overflow: 'hidden' },
  infoText: { color: '#D1D5DB', fontSize: 13 },
  infoTextBold: { color: '#F5F3FF', fontWeight: '700' },

  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#9CA3AF', fontSize: 13 },
  value: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 14 },
  
  sectionHeader: { color: '#9CA3AF', fontSize: 13, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemName: { flex: 1, color: '#D1D5DB', fontSize: 13 },
  itemQty: { width: 30, color: '#6B7280', fontSize: 13, textAlign: 'center' },
  itemPrice: { width: 70, color: '#F5F3FF', fontSize: 13, textAlign: 'right', fontWeight: '500' },
  
  totalValue: { color: '#F5F3FF', fontSize: 15, fontWeight: '800' },

  attachTitle: { color: '#9CA3AF', fontSize: 13, marginBottom: 10 },
  attachBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  pdfIconWrap: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' },
  attachInfo: { flex: 1, marginLeft: 12, gap: 2 },
  attachFileName: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  attachSub: { color: '#6B7280', fontSize: 11 },

  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  continueBtn: { borderRadius: 14, overflow: 'hidden' },
  continueBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
