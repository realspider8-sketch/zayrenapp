import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';

const { width: W } = Dimensions.get('window');

// ─── Data ──────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Map DB statuses -> UI
const STATUS_TO_STEP: Record<string, number> = {
  PENDING: 0,
  WAITING_FOR_SHOP_VERIFICATION: 0,
  ACCEPTED: 1,
  PREPARING_FOR_PICKUP: 2,
  ITEMS_COLLECTED: 3,
  PICKED_UP: 3,
  IN_TRANSIT: 4,
  DELIVERED: 5,
};

const STATUS_TO_UI: Record<string, string> = {
  PENDING: 'pending',
  WAITING_FOR_SHOP_VERIFICATION: 'pending',
  ACCEPTED: 'accepted',
  PREPARING_FOR_PICKUP: 'preparing',
  ITEMS_COLLECTED: 'picked_up',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
};

const STEP_LABELS = [
  'Pending', 'Accepted', 'Preparing', 'Picked Up', 'In Transit', 'Delivered'
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: '#8B5CF6',
  preparing: '#3B82F6',
  picked_up: '#0EA5E9',
  in_transit: '#10B981',
  delivered: '#6B7280',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};


// ─── Product Thumbnail ──────────────────────────────────────────────────────

function ProductThumb({ gradient }: { gradient: [string, string] }) {
  return (
    <LinearGradient colors={gradient} style={styles.productThumb}>
      <Feather name="shopping-bag" size={22} color="rgba(255,255,255,0.6)" />
    </LinearGradient>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────

function Stepper({ steps, currentStep }: { steps: any[]; currentStep: number }) {
  return (
    <View style={styles.stepperWrap}>
      {/* Dots + connecting lines row */}
      <View style={styles.stepperDotsRow}>
        {steps.map((step, idx) => {
          const done   = idx < currentStep;
          const active = idx === currentStep;
          const future = idx > currentStep;
          return (
            <React.Fragment key={idx}>
              {/* Dot */}
              <View style={[
                styles.stepDot,
                done   && styles.stepDotDone,
                active && styles.stepDotActive,
                future && styles.stepDotFuture,
              ]}>
                {done && <Feather name="check" size={10} color="#fff" />}
                {active && (
                  <>
                    <MaterialCommunityIcons name="truck-delivery" size={13} color="#fff" />
                  </>
                )}
              </View>
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <View style={[styles.stepLine, (done || active) && idx < currentStep && styles.stepLineDone]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Labels + timestamps row */}
      <View style={styles.stepperLabelsRow}>
        {steps.map((step, idx) => {
          const done   = idx < currentStep;
          const active = idx === currentStep;
          return (
            <View key={idx} style={styles.stepLabelCol}>
              <Text style={[
                styles.stepLabel,
                done   && styles.stepLabelDone,
                active && styles.stepLabelActive,
              ]} numberOfLines={2}>
                {step.label}
              </Text>
              <Text style={[
                styles.stepTime,
                active && styles.stepTimeActive,
              ]}>
                {step.time}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Tracking Card ───────────────────────────────────────────────────────

function TrackingCard({ order }: { order: any }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (order.status === 'out_for_delivery') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const statusColor = STATUS_COLORS[order.status];

  return (
    <View style={styles.trackingCard}>
      <LinearGradient colors={['rgba(124,58,237,0.10)', 'transparent']} style={StyleSheet.absoluteFill} />

      {/* ── Row 1: Thumbnail + order info + status chip ── */}
      <View style={styles.cardTopRow}>
        <ProductThumb gradient={order.gradient} />
        <View style={styles.cardOrderInfo}>
          <Text style={styles.cardOrderId}>{order.id}</Text>
          <Text style={styles.cardItemName} numberOfLines={1}>{order.item}</Text>
          <Text style={styles.cardSeller}>{order.seller}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusColor + '20', borderColor: statusColor + '50' }]}>
          <MaterialCommunityIcons name="truck-delivery-outline" size={13} color={statusColor} />
          <Text style={[styles.statusChipText, { color: statusColor }]}>
            {STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      {/* ── ETA Bar (only for out_for_delivery) ── */}
      {order.status === 'out_for_delivery' && (
        <View style={styles.etaBar}>
          <View style={styles.etaLeft}>
            <Text style={styles.etaLabel}>Estimated arrival</Text>
            <View style={styles.etaValueRow}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.etaPulseDot} />
              </Animated.View>
              <Text style={styles.etaValue}>{order.eta}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.etaMapBtn}>
            <Feather name="map" size={18} color="#A78BFA" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Stepper ── */}
      <Stepper steps={order.steps} currentStep={order.currentStep} />

      {/* ── Rider + Delivery ID + View Details ── */}
      <View style={styles.cardBottomRow}>
        {/* Rider info */}
        {order.rider ? (
          <View style={styles.riderSection}>
            <LinearGradient colors={order.gradient} style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>
                {order.rider.split(' ').map((n) => n[0]).join('')}
              </Text>
            </LinearGradient>
            <View style={styles.riderInfo}>
              <Text style={styles.riderLabel}>Delivery Partner</Text>
              <View style={styles.riderNameRow}>
                <Text style={styles.riderName}>{order.rider}</Text>
                <Ionicons name="star" size={11} color="#F59E0B" />
                <Text style={styles.riderRating}>{order.riderRating}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.riderSection}>
            <View style={styles.riderAvatarPlaceholder}>
              <Feather name="user" size={18} color="#4B5563" />
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderLabel}>Delivery Partner</Text>
              <Text style={styles.riderName}>Assigning soon…</Text>
            </View>
          </View>
        )}

        {/* Call / chat (only when rider assigned) */}
        {order.rider && (
          <View style={styles.riderActions}>
            <TouchableOpacity style={styles.riderIconBtn}>
              <Feather name="phone" size={16} color="#A78BFA" />
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery ID */}
        <View style={styles.deliveryIdSection}>
          <Text style={styles.deliveryIdLabel}>Delivery ID</Text>
          <Text style={styles.deliveryIdValue}>{order.deliveryId}</Text>
        </View>

        {/* View Details */}
        <TouchableOpacity style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <View style={styles.viewDetailsIcon}>
            <Feather name="plus" size={12} color="#A78BFA" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Quick Action Tile ────────────────────────────────────────────────────

function QuickActionTile({ icon, label, sub }: { icon: any; label: string; sub: string }) {
  return (
    <TouchableOpacity style={styles.quickTile} activeOpacity={0.8}>
      <View style={styles.quickTileIcon}>
        <Feather name={icon} size={20} color="#A78BFA" />
      </View>
      <View>
        <Text style={styles.quickTileLabel}>{label}</Text>
        <Text style={styles.quickTileSub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Nearby Office Card ───────────────────────────────────────────────────

function OfficeCard({ office }: { office: any }) {
  const router = useRouter();
  return (
    <View style={styles.officeCard}>
      {/* Logo */}
      <LinearGradient colors={office.grad} style={styles.officeLogo}>
        <Text style={styles.officeLogoText}>{office.initials}</Text>
      </LinearGradient>

      {/* Info */}
      <View style={styles.officeInfo}>
        <View style={styles.officeNameRow}>
          <Text style={styles.officeName} numberOfLines={1}>{office.name}</Text>
          {office.verified && (
            <MaterialCommunityIcons name="check-decagram" size={14} color="#A78BFA" />
          )}
          {/* Tag */}
          {!!office.tag && (
            <View style={[styles.officeTag, { backgroundColor: office.tagBg }]}>
              <Text style={[styles.officeTagText, { color: office.tagColor }]}>{office.tag}</Text>
            </View>
          )}
        </View>

        <View style={styles.officeMetaRow}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={styles.officeMeta}>{office.rating}</Text>
          <Text style={styles.officeMetaDim}>({office.reviews})</Text>
          <Text style={styles.officeBullet}>•</Text>
          <Text style={styles.officeMeta}>{office.distance}</Text>
        </View>

        <View style={styles.officeMetaRow}>
          <Feather name="clock" size={11} color="#6B7280" />
          <Text style={styles.officeMetaDim}>{office.time}</Text>
          <Text style={styles.officeBullet}>•</Text>
          <MaterialCommunityIcons name="currency-ngn" size={11} color="#6B7280" />
          <Text style={styles.officeMetaDim}>{office.fee}</Text>
        </View>
      </View>

      {/* Select button */}
      <TouchableOpacity
        style={styles.selectOfficeBtn}
        onPress={() => router.push({
          pathname: '/delivery/step1-office',
          params: { preSelectedId: office.id }
        })}
      >
        <LinearGradient
          colors={['#7C3AED', '#A78BFA']}
          style={styles.selectOfficeBtnGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.selectOfficeBtnText}>Select Office</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── History Card ─────────────────────────────────────────────────────────

function HistoryCard({ order }: { order: any }) {
  const grad: [string, string] = order.gradient || ['#7C3AED', '#A78BFA'];
  return (
    <TouchableOpacity style={styles.historyCard} activeOpacity={0.85}>
      <LinearGradient colors={grad} style={styles.historyThumb}>
        <Feather name="package" size={20} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
      <View style={styles.historyInfo}>
        <Text style={styles.historyItem} numberOfLines={1}>{order.item}</Text>
        <Text style={styles.historySeller}>{order.seller}</Text>
        <Text style={styles.historyDate}>{order.date}</Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyPrice}>{order.price}</Text>
        <View style={styles.historyStatusBadge}>
          <Feather name="check-circle" size={11} color="#10B981" />
          <Text style={styles.historyStatusText}>Delivered</Text>
        </View>
        <TouchableOpacity style={styles.reorderBtn}>
          <Text style={styles.reorderBtnText}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────

export default function DeliveryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Live data state
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders]     = useState<any[]>([]);
  const [offices, setOffices]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [addressText, setAddressText] = useState('Fetching location...');

  const gradients: [string, string][] = [
    ['#7C3AED', '#A78BFA'],
    ['#1e40af', '#3B82F6'],
    ['#92400e', '#F97316'],
    ['#1e293b', '#475569'],
  ];
  const initialsMap = ['ZEX', 'CS', 'RG', 'PD'];

  const fetchOffices = async (lat?: number, lng?: number) => {
    try {
      let url = `${API_URL}/api/delivery/offices/nearby`;
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`;
      }
      let res = await fetch(url);
      let data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        // Seed the database
        res = await fetch(`${API_URL}/api/delivery/offices/seed`, { method: 'POST' });
        data = await res.json();
      }
      setOffices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Could not fetch offices:', e);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      
      // Get location
      let { status } = await Location.requestForegroundPermissionsAsync();
      let lat, lng;
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        lat = location.coords.latitude;
        lng = location.coords.longitude;
        
        let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          setAddressText(`${geocode[0].street || ''}, ${geocode[0].city || ''}`);
        } else {
          setAddressText('Location Access Granted');
        }
      } else {
        setAddressText('Location Permission Denied');
      }

      await fetchOffices(lat, lng);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        try {
          const [activeRes, historyRes] = await Promise.all([
            fetch(`${API_URL}/api/delivery/active/${session.user.id}`),
            fetch(`${API_URL}/api/delivery/history/${session.user.id}`)
          ]);
          
          if (activeRes.ok) {
            const actData = await activeRes.json();
            setActiveOrders(Array.isArray(actData) ? actData : []);
          }
          if (historyRes.ok) {
            const histData = await historyRes.json();
            setPastOrders(Array.isArray(histData) ? histData : []);
          }
        } catch (e) {
          console.error("Failed to fetch user delivery data:", e);
        }
      }
      setLoading(false);
    };
    loadAll();
  }, []);

  // Helpers to map DB order to UI card shape
  const mapRequestToOrder = (req: any, idx: number) => {
    const step = STATUS_TO_STEP[req.status] ?? 0;
    const steps = STEP_LABELS.map((label, i) => ({
      label,
      time: i <= step ? new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—:— —',
    }));
    return {
      id: `ZAY-${String(idx + 1).padStart(3, '0')}`,
      item: req.order?.items?.[0]?.product?.name ?? 'Order Item',
      seller: req.order?.shop?.name ?? 'Shop',
      status: STATUS_TO_UI[req.status] ?? 'confirmed',
      eta: req.delivery_office?.estimated_time ?? '—',
      gradient: gradients[idx % gradients.length] as [string, string],
      steps,
      currentStep: step,
      rider: req.delivery_partner?.name ?? null,
      riderRating: req.delivery_partner?.rating ?? null,
      deliveryId: `ZAY-${String(idx + 1).padStart(3, '0')}`,
      requestId: req.id,
      date: new Date(req.created_at).toLocaleDateString(),
      price: `₦${req.order?.total_amount?.toLocaleString() ?? 0}`,
    };
  };

  const displayActiveOrders = activeOrders.map(mapRequestToOrder);
  const displayPastOrders = pastOrders.map(mapRequestToOrder);
  const displayOffices = offices;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#100D22', '#0D0B1A']} style={StyleSheet.absoluteFill} />
      {/* Ambient glow */}
      <View style={styles.ambientGlow} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.headerTitle}>Delivery</Text>
          <Text style={styles.headerSub}>Fast. Reliable. Right to your door.</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="bell" size={20} color="#D1D5DB" />
            <View style={styles.headerBtnBadge}><Text style={styles.headerBtnBadgeText}>{displayActiveOrders.length}</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="map" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          activeOpacity={0.85}
        >
          {activeTab === 'active' && (
            <LinearGradient
              colors={['#7C3AED', '#A78BFA']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          )}
          <MaterialCommunityIcons name="truck-delivery-outline" size={16} color={activeTab === 'active' ? '#fff' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active Orders ({displayActiveOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          activeOpacity={0.85}
        >
          {activeTab === 'history' && (
            <LinearGradient
              colors={['#7C3AED', '#A78BFA']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          )}
          <Feather name="clock" size={16} color={activeTab === 'history' ? '#fff' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'active' ? (
          <>
            {/* ── Deliver-to / Find Office Bar ── */}
            <View style={styles.locationBar}>
              {/* Left: deliver to */}
              <View style={styles.locationLeft}>
                <View style={styles.locationIconWrap}>
                  <Feather name="map-pin" size={18} color="#A78BFA" />
                </View>
                <View>
                  <Text style={styles.locationTopLabel}>Deliver to</Text>
                  <Text style={styles.locationAddress}>{addressText}</Text>
                </View>
                <Feather name="chevron-down" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
              </View>

              {/* Divider */}
              <View style={styles.locationDivider} />

              {/* Right: find office */}
              <View style={styles.locationRight}>
                <View style={styles.locationIconWrap}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#A78BFA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationTopLabel}>Find Delivery Offices</Text>
                  <Text style={styles.locationHighlight}>Near You</Text>
                  <Text style={styles.locationSubLabel}>Choose the best & closest</Text>
                </View>
                <TouchableOpacity style={styles.chooseOfficeBtn} onPress={() => router.push('/delivery/step1-office')}>
                  <LinearGradient
                    colors={['#7C3AED', '#A78BFA']}
                    style={styles.chooseOfficeBtnGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.chooseOfficeBtnText}>Choose Office</Text>
                    <Feather name="arrow-right" size={14} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Active Tracking Cards ── */}
            {loading ? (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', fontSize: 14 }}>Loading orders...</Text>
              </View>
            ) : displayActiveOrders.length > 0 ? (
              displayActiveOrders.map((order, idx) => (
                <TrackingCard key={order.id || idx} order={order} />
              ))
            ) : null}

            {/* ── Quick Actions ── */}
            <Text style={styles.sectionTitle}>What would you like to do?</Text>
            <View style={styles.quickGrid}>
              <QuickActionTile icon="file-text" label="Share Receipt"    sub="with Office" />
              <QuickActionTile icon="map-pin"   label="Add / Update"     sub="My Location" />
              <QuickActionTile icon="credit-card" label="My Delivery"    sub="Payments" />
              <QuickActionTile icon="headphones" label="Contact Support" sub="24/7 Help" />
            </View>

            {/* ── Nearby Delivery Offices ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Delivery Offices</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {displayOffices.map((office, idx) => {
              const tagColors: Record<string, string> = { Fastest: '#10B981', Reliable: '#3B82F6', Affordable: '#F59E0B' };
              const tagBgs: Record<string, string> = { Fastest: 'rgba(16,185,129,0.18)', Reliable: 'rgba(59,130,246,0.18)', Affordable: 'rgba(245,158,11,0.18)' };
              const uiOffice = {
                ...office,
                id: office.id?.toString(),
                reviews: office.reviews_count ?? 0,
                distance: `${office.distance_km ?? '?'} km away`,
                time: office.estimated_time ?? '—',
                fee: `₦${(office.base_fee ?? 0).toLocaleString()}`,
                tag: office.tag ?? '',
                tagColor: tagColors[office.tag ?? ''] ?? '#9CA3AF',
                tagBg: tagBgs[office.tag ?? ''] ?? 'rgba(156,163,175,0.18)',
                initials: (office.name || 'XX').split(' ').map((w: string) => w[0]).join('').slice(0, 3),
                grad: gradients[idx % gradients.length] as [string, string],
                verified: true,
              };
              return <OfficeCard key={uiOffice.id} office={uiOffice} />;
            })}

            {/* Empty state only if no active orders and not loading */}
            {!loading && displayActiveOrders.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="truck-outline" size={64} color="#374151" />
                <Text style={styles.emptyTitle}>No active orders</Text>
                <Text style={styles.emptySubtitle}>Shop the Marketplace to get something delivered</Text>
                <TouchableOpacity style={styles.emptyBtn}>
                  <LinearGradient
                    colors={['#7C3AED', '#A78BFA']}
                    style={styles.emptyBtnGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.emptyBtnText}>Go to Marketplace</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Order History</Text>
            {displayPastOrders.length > 0 ? displayPastOrders.map((order: any) => (
              <HistoryCard key={order.id} order={order} />
            )) : (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <MaterialCommunityIcons name="history" size={48} color="#374151" />
                <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 10 }}>No delivery history yet</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const STEP_COUNT = 5;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1A' },
  ambientGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124,58,237,0.06)',
    top: -60,
    right: -80,
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110, gap: 14 },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitle: { color: '#F5F3FF', fontSize: 28, fontWeight: '800', letterSpacing: 0.2 },
  headerSub: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerBtnBadge: {
    position: 'absolute', top: 7, right: 7,
    width: 15, height: 15, borderRadius: 7.5,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  headerBtnBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },

  // ── Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 10, gap: 6, overflow: 'hidden',
  },
  tabActive: {},
  tabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  // ── Location Bar
  locationBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    gap: 12,
    alignItems: 'center',
  },
  locationLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 },
  locationIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
    marginTop: 2,
  },
  locationTopLabel: { color: '#6B7280', fontSize: 10, fontWeight: '500' },
  locationAddress: { color: '#F5F3FF', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  locationHighlight: { color: '#A78BFA', fontSize: 15, fontWeight: '800' },
  locationSubLabel: { color: '#6B7280', fontSize: 10 },
  locationDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
  locationRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1.1 },
  chooseOfficeBtn: { borderRadius: 12, overflow: 'hidden' },
  chooseOfficeBtnGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  chooseOfficeBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // ── Tracking Card
  trackingCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.18)',
    overflow: 'hidden',
    padding: 16,
    gap: 14,
  },

  // Row 1
  cardTopRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  productThumb: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardOrderInfo: { flex: 1, gap: 2 },
  cardOrderId: { color: '#A78BFA', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  cardItemName: { color: '#F5F3FF', fontSize: 15, fontWeight: '800', lineHeight: 20 },
  cardSeller: { color: '#A78BFA', fontSize: 11, fontWeight: '500' },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, flexShrink: 0,
  },
  statusChipText: { fontSize: 11, fontWeight: '700' },

  // ETA
  etaBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
  },
  etaLeft: { gap: 2 },
  etaLabel: { color: '#6B7280', fontSize: 10, fontWeight: '500' },
  etaValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  etaPulseDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#10B981',
  },
  etaValue: { color: '#F5F3FF', fontSize: 26, fontWeight: '800', lineHeight: 30 },
  etaMapBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(167,139,250,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },

  // Stepper
  stepperWrap: { gap: 8 },
  stepperDotsRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  stepDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#1F2937', borderWidth: 2, borderColor: '#374151',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1, flexShrink: 0,
  },
  stepDotDone:   { backgroundColor: '#7C3AED', borderColor: '#A78BFA' },
  stepDotActive: { backgroundColor: '#10B981', borderColor: '#34D399' },
  stepDotFuture: { backgroundColor: '#111827', borderColor: '#1F2937' },
  stepLine: {
    flex: 1, height: 2,
    backgroundColor: '#1F2937', marginHorizontal: -1,
  },
  stepLineDone: { backgroundColor: '#7C3AED' },
  stepperLabelsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  stepLabelCol: {
    flex: 1, alignItems: 'center', gap: 1,
  },
  stepLabel: { color: '#4B5563', fontSize: 8.5, fontWeight: '500', textAlign: 'center' },
  stepLabelDone: { color: '#9CA3AF' },
  stepLabelActive: { color: '#10B981', fontWeight: '800' },
  stepTime: { color: '#374151', fontSize: 8, textAlign: 'center', fontWeight: '500' },
  stepTimeActive: { color: '#10B981' },

  // Card bottom
  cardBottomRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  riderSection: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  riderAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  riderAvatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  riderAvatarPlaceholder: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  riderInfo: { gap: 1 },
  riderLabel: { color: '#6B7280', fontSize: 9, fontWeight: '500' },
  riderNameRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  riderName: { color: '#F5F3FF', fontSize: 12, fontWeight: '700' },
  riderRating: { color: '#F59E0B', fontSize: 11, fontWeight: '700' },
  riderActions: { gap: 5 },
  riderIconBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(167,139,250,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },
  deliveryIdSection: { alignItems: 'center', gap: 1 },
  deliveryIdLabel: { color: '#6B7280', fontSize: 9 },
  deliveryIdValue: { color: '#D1D5DB', fontSize: 12, fontWeight: '700' },
  viewDetailsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(167,139,250,0.1)',
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },
  viewDetailsText: { color: '#A78BFA', fontSize: 11, fontWeight: '700' },
  viewDetailsIcon: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(167,139,250,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Section titles
  sectionTitle: { color: '#F5F3FF', fontSize: 15, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  viewAllText: { color: '#A78BFA', fontSize: 13, fontWeight: '600' },

  // ── Quick Grid
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  quickTile: {
    width: (W - 42) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  quickTileIcon: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(124,58,237,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },
  quickTileLabel: { color: '#F5F3FF', fontSize: 12, fontWeight: '700' },
  quickTileSub: { color: '#6B7280', fontSize: 10, marginTop: 1 },

  // ── Office Card
  officeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  officeLogo: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  officeLogoText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  officeInfo: { flex: 1, gap: 4 },
  officeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  officeName: { color: '#F5F3FF', fontSize: 13, fontWeight: '700', flex: 1 },
  officeTag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  officeTagText: { fontSize: 10, fontWeight: '700' },
  officeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  officeMeta: { color: '#D1D5DB', fontSize: 11, fontWeight: '600' },
  officeMetaDim: { color: '#6B7280', fontSize: 11 },
  officeBullet: { color: '#374151', fontSize: 11 },
  selectOfficeBtn: { borderRadius: 12, overflow: 'hidden', flexShrink: 0 },
  selectOfficeBtnGrad: {
    paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center',
  },
  selectOfficeBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // ── History
  historyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  historyThumb: {
    width: 48, height: 48, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  historyInfo: { flex: 1, gap: 2 },
  historyItem: { color: '#F5F3FF', fontSize: 13, fontWeight: '700' },
  historySeller: { color: '#6B7280', fontSize: 10 },
  historyDate: { color: '#4B5563', fontSize: 10 },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyPrice: { color: '#A78BFA', fontSize: 14, fontWeight: '800' },
  historyStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  historyStatusText: { color: '#10B981', fontSize: 10, fontWeight: '600' },
  reorderBtn: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)',
  },
  reorderBtnText: { color: '#A78BFA', fontSize: 10, fontWeight: '700' },

  // ── Empty state
  emptyState: { alignItems: 'center', gap: 14, paddingTop: 60 },
  emptyTitle: { color: '#6B7280', fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: '#4B5563', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  emptyBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  emptyBtnGrad: { paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
