import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Step8CompletedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [rating, setRating] = useState(5);

  const handleHome = () => {
    router.navigate('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Completed</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successHeader}>
          <Text style={styles.subTitle}>Thank you for using ZAYREN Delivery</Text>
          <View style={styles.checkCircle}>
            <Feather name="check" size={40} color="#fff" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery ID</Text>
            <Text style={styles.value}>ZAY-001</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivered To</Text>
            <Text style={styles.value}>Arfat Danjummai</Text>
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
            <Text style={styles.label}>Delivery Fee</Text>
            <Text style={styles.value}>₦2,000</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivered Time</Text>
            <Text style={styles.valueDim}>19 July, 2026 • 3:05 PM</Text>
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Rate your experience</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={32} 
                  color={star <= rating ? "#A78BFA" : "#4B5563"} 
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingFeedback}>
            {rating === 5 ? 'Excellent!' : rating >= 4 ? 'Good!' : rating >= 3 ? 'Okay' : 'Poor'}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.homeBtn} onPress={handleHome}>
          <LinearGradient 
            colors={['#7C3AED', '#A78BFA']} 
            style={styles.homeBtnGrad} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
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
  
  successHeader: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  subTitle: { color: '#9CA3AF', fontSize: 13, marginBottom: 20 },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 4 } },

  card: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { color: '#9CA3AF', fontSize: 13 },
  value: { color: '#F5F3FF', fontSize: 14, fontWeight: '600' },
  valueDim: { color: '#D1D5DB', fontSize: 13 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  
  sectionLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemName: { flex: 1, color: '#D1D5DB', fontSize: 13 },
  itemQty: { color: '#F5F3FF', fontSize: 13, fontWeight: '500' },

  ratingSection: { alignItems: 'center' },
  ratingLabel: { color: '#D1D5DB', fontSize: 14, marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  ratingFeedback: { color: '#A78BFA', fontSize: 15, fontWeight: '600' },

  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  homeBtn: { borderRadius: 14, overflow: 'hidden' },
  homeBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
