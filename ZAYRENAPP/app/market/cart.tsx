import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const { width: W } = Dimensions.get('window');
import { API_URL } from '@/lib/api';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        fetchCart(session.user.id);
      }
    });
  }, []);

  const fetchCart = async (uid: string) => {
    try {
      const res = await fetch(`${API_URL}/api/market/cart/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.warn('Failed to fetch cart', e);
    }
  };

  const updateQuantity = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    // Optimistic update
    setItems(items.map(it => it.id === itemId ? { ...it, quantity: Math.max(0, newQty) } : it).filter(it => it.quantity > 0));

    try {
      await fetch(`${API_URL}/api/market/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (userId) fetchCart(userId);
    } catch (e) {
      console.warn('Update quantity failed', e);
    }
  };

  const total = items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

  const handleCheckout = async () => {
    if (!userId) return;
    setIsCheckingOut(true);
    try {
      // 1. Create Pending Payment
      const payRes = await fetch(`${API_URL}/api/market/payments/${userId}`, { method: 'POST' });
      if (!payRes.ok) throw new Error(await payRes.text());
      const payment = await payRes.json();

      // 2. Verify Payment (simulated successful callback)
      const verifyRes = await fetch(`${API_URL}/api/market/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: payment.id })
      });
      if (!verifyRes.ok) throw new Error(await verifyRes.text());
      const receipt = await verifyRes.json();

      setIsCheckingOut(false);
      router.push({
        pathname: '/market/receipt',
        params: { receiptId: receipt.id }
      });
    } catch (e: any) {
      console.error('Checkout failed:', e);
      alert('Checkout failed: ' + e.message);
      setIsCheckingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Basket</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {items.map((item) => {
          const product = item.product || {};
          const grad = product.gradient || ['#1a0533', '#3b0764'];
          return (
            <View key={item.id} style={styles.cartItemCard}>
              <LinearGradient colors={grad} style={styles.itemThumb}>
                <Feather name="shopping-bag" size={20} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{product.name || 'Item'}</Text>
                <Text style={styles.itemShop}>{product.shop?.name || 'Shop'}</Text>
                <Text style={styles.itemPrice}>₦{(product.price || 0).toLocaleString()}</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity, -1)}>
                  <Feather name="minus" size={14} color="#A78BFA" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity, 1)}>
                  <Feather name="plus" size={14} color="#A78BFA" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="shopping-cart" size={48} color="#4B5563" />
            <Text style={styles.emptyTitle}>Your basket is empty</Text>
          </View>
        )}
      </ScrollView>

      {/* Checkout Footer */}
      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₦{total.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} disabled={isCheckingOut}>
            <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.checkoutBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.checkoutBtnText}>{isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}</Text>
              {!isCheckingOut && <Feather name="arrow-right" size={18} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F5F3FF', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, gap: 15 },
  cartItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', gap: 12 },
  itemThumb: { width: 60, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { color: '#F5F3FF', fontSize: 15, fontWeight: '700' },
  itemShop: { color: '#9CA3AF', fontSize: 12 },
  itemPrice: { color: '#A78BFA', fontSize: 14, fontWeight: '800', marginTop: 4 },
  quantityControls: { alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(167,139,250,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  qtyText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 15 },
  emptyTitle: { color: '#6B7280', fontSize: 16 },
  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  totalAmount: { color: '#F5F3FF', fontSize: 24, fontWeight: '800' },
  checkoutBtn: { borderRadius: 14, overflow: 'hidden' },
  checkoutBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
