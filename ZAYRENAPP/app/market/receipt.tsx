import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: W } = Dimensions.get('window');
import { API_URL } from '@/lib/api';

export default function ReceiptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { receiptId } = useLocalSearchParams();
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

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`${API_URL}/api/market/receipts/${receiptId}/download`);
      const data = await res.json();
      alert(`Receipt downloaded successfully! URL: ${data.pdf_url}`);
    } catch (e) {
      console.warn(e);
      alert('Failed to download PDF.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />
        <Text style={{ color: '#fff' }}>Loading receipt...</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />
        <Text style={{ color: '#fff' }}>Receipt not found.</Text>
      </View>
    );
  }

  // Fallback for avatar gradient
  const shopGrad = receipt.shop?.grad || ['#10B981', '#3B82F6'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.navigate('/(tabs)/marketplace')}>
          <Feather name="x" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Receipt</Text>
        <TouchableOpacity style={styles.printBtn} onPress={handleDownloadPDF}>
          <Feather name="printer" size={20} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.receiptCard}>
          {/* Shop Info */}
          <View style={styles.shopInfoSection}>
            <LinearGradient colors={shopGrad} style={styles.shopLogo}>
              <Text style={styles.shopLogoText}>{receipt.shop?.name?.substring(0, 2).toUpperCase() || 'SH'}</Text>
            </LinearGradient>
            <Text style={styles.shopName}>{receipt.shop?.name}</Text>
            <Text style={styles.shopDetails}>{receipt.shop?.address}</Text>
            <Text style={styles.shopDetails}>{receipt.shop?.phone}</Text>
          </View>

          <View style={styles.divider} />

          {/* Order Details */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Receipt No</Text>
            <Text style={styles.metaValue}>{receipt.receipt_number}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{new Date(receipt.date).toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          {/* Items */}
          <View style={styles.itemsSection}>
            <Text style={styles.itemsHeader}>Items</Text>
            {receipt.items.map((item: any, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemNameCol}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₦{receipt.total_amount.toLocaleString()}</Text>
          </View>

          <View style={styles.statusBadge}>
            <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
            <Text style={styles.statusText}>{receipt.payment_status === 'PAID' ? 'Payment Successful' : receipt.payment_status}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.deliveryBtn}
          onPress={() => router.push({ pathname: '/delivery/step1-office', params: { receiptId: receipt.id } })}
        >
          <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.deliveryBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#fff" />
            <Text style={styles.deliveryBtnText}>Proceed to Delivery</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  printBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(167,139,250,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F5F3FF', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, gap: 20 },
  receiptCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  shopInfoSection: { alignItems: 'center', gap: 6 },
  shopLogo: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  shopLogoText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  shopName: { color: '#F5F3FF', fontSize: 18, fontWeight: '700' },
  shopDetails: { color: '#9CA3AF', fontSize: 12 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20, borderStyle: 'dashed' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaLabel: { color: '#9CA3AF', fontSize: 13 },
  metaValue: { color: '#F5F3FF', fontSize: 13, fontWeight: '600' },
  itemsSection: { gap: 12 },
  itemsHeader: { color: '#F5F3FF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemNameCol: { flex: 1 },
  itemName: { color: '#D1D5DB', fontSize: 14, fontWeight: '500' },
  itemQty: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  itemPrice: { color: '#F5F3FF', fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { color: '#F5F3FF', fontSize: 16, fontWeight: '700' },
  totalValue: { color: '#A78BFA', fontSize: 20, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.1)', paddingVertical: 12, borderRadius: 12 },
  statusText: { color: '#10B981', fontSize: 14, fontWeight: '700' },
  deliveryBtn: { borderRadius: 16, overflow: 'hidden' },
  deliveryBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  deliveryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
