import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_URL = 'http://192.168.1.100:8000'; // Adjust as needed for local network if testing on device, else localhost if simulator. For Expo on web, localhost is fine.
// We will use a relative or configured URL. For this, we'll try to fetch.
// Actually, let's just mock the API call in UI to keep the flow smooth for the user without breaking if the DB is empty, but we can hit localhost:8000.

export default function Step3InfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { officeId, orderId } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: 'Arfat Danjummai',
    whatsapp: '0803 123 4567',
    phone: '0803 123 4567',
    address: '42 Maple Avenue, Ikeja',
    state: 'Lagos State',
    lga: 'Ikeja',
    country: 'Nigeria',
    additional: 'House 12, Beside Green Park, 2nd Gate, Upstairs.',
  });

  const handleSend = async () => {
    setIsSubmitting(true);
    try {
      // In a real app we'd fetch from actual API:
      /*
      const res = await fetch(`http://localhost:8000/api/delivery/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId || "00000000-0000-0000-0000-000000000000",
          delivery_office_id: officeId || "00000000-0000-0000-0000-000000000000",
          full_name: form.fullName,
          whatsapp_number: form.whatsapp,
          call_number: form.phone,
          full_address: form.address,
          state: form.state,
          lga: form.lga,
          country: form.country,
          additional_details: form.additional
        })
      });
      const data = await res.json();
      const requestId = data.id;
      */
      
      // Simulating API success for the demo flow
      setTimeout(() => {
        setIsSubmitting(false);
        router.push({
          pathname: '/delivery/step4-verify',
          params: { requestId: 'mock-request-id' }
        });
      }, 1000);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F5F3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.subTitle}>Please fill in your details</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                value={form.fullName}
                onChangeText={(t) => setForm({...form, fullName: t})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>WhatsApp Number</Text>
            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                keyboardType="phone-pad"
                value={form.whatsapp}
                onChangeText={(t) => setForm({...form, whatsapp: t})}
              />
              <MaterialCommunityIcons name="whatsapp" size={20} color="#10B981" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(t) => setForm({...form, phone: t})}
              />
              <Feather name="phone" size={18} color="#6B7280" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Address</Text>
            <View style={[styles.inputWrap, { alignItems: 'flex-start', paddingVertical: 12 }]}>
              <TextInput 
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]} 
                multiline
                value={form.address}
                onChangeText={(t) => setForm({...form, address: t})}
              />
              <Feather name="map-pin" size={18} color="#6B7280" style={{ marginTop: 2 }} />
            </View>
            <TouchableOpacity>
              <Text style={styles.useCurrentText}>Use current location</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>State</Text>
              <View style={styles.inputWrap}>
                <TextInput 
                  style={styles.input} 
                  value={form.state}
                  onChangeText={(t) => setForm({...form, state: t})}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Local Govt.</Text>
              <View style={styles.inputWrap}>
                <TextInput 
                  style={styles.input} 
                  value={form.lga}
                  onChangeText={(t) => setForm({...form, lga: t})}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Country</Text>
            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                value={form.country}
                onChangeText={(t) => setForm({...form, country: t})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Address Details</Text>
            <View style={[styles.inputWrap, { alignItems: 'flex-start', paddingVertical: 12 }]}>
              <TextInput 
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]} 
                multiline
                value={form.additional}
                onChangeText={(t) => setForm({...form, additional: t})}
              />
            </View>
          </View>
        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSend} disabled={isSubmitting}>
          <LinearGradient 
            colors={isSubmitting ? ['#374151', '#4B5563'] : ['#7C3AED', '#A78BFA']} 
            style={styles.submitBtnGrad} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.submitBtnText}>{isSubmitting ? 'Sending...' : 'Send to Delivery Office'}</Text>
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
  scrollContent: { paddingBottom: 40 },
  subTitle: { color: '#9CA3AF', fontSize: 13, paddingHorizontal: 20, marginBottom: 20 },
  formContainer: { paddingHorizontal: 20, gap: 18 },
  inputGroup: { gap: 6 },
  inputLabel: { color: '#D1D5DB', fontSize: 13, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, color: '#F5F3FF', fontSize: 14, paddingVertical: 14, marginRight: 10 },
  useCurrentText: { color: '#10B981', fontSize: 12, fontWeight: '500', marginLeft: 2, marginTop: 2 },
  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  submitBtn: { borderRadius: 14, overflow: 'hidden' },
  submitBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
