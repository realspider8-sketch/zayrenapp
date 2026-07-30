import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FAQ_CATEGORIES = [
  { id: 'account', label: 'Account', icon: 'user', color: '#A78BFA' },
  { id: 'marketplace', label: 'Marketplace', icon: 'shopping-bag', color: '#F59E0B' },
  { id: 'delivery', label: 'Delivery', icon: 'package', color: '#10B981' },
  { id: 'payments', label: 'Payments', icon: 'credit-card', color: '#3B82F6' },
  { id: 'safety', label: 'Safety', icon: 'shield', color: '#EF4444' },
  { id: 'creator', label: 'Creator', icon: 'star', color: '#EC4899' },
];

const FAQS = [
  {
    id: '1',
    q: 'How do I verify my account?',
    a: 'Go to Profile → Settings → Verification. Submit your ID and wait 24–48 hours. Verified accounts get a purple checkmark and priority support.',
    category: 'account',
  },
  {
    id: '2',
    q: 'How does Zayren Delivery work?',
    a: 'When you purchase from the Marketplace, sellers package and hand off to Zayren Express riders. You can track in real time in the Delivery tab.',
    category: 'delivery',
  },
  {
    id: '3',
    q: 'How do I sell on the Marketplace?',
    a: "Tap the + (Create) button → Listing. Fill in your product details, set a price, and publish. Items go live instantly for your followers and the public.",
    category: 'marketplace',
  },
  {
    id: '4',
    q: 'How do I earn as a creator?',
    a: 'Creators earn through: Marketplace sales, Tips from followers, Paid Stories, and Brand partnerships via the Creator Fund program.',
    category: 'creator',
  },
  {
    id: '5',
    q: 'What payment methods are accepted?',
    a: 'Zayren Pay, bank transfer, credit/debit cards, and crypto (USDT/ETH). All transactions are encrypted and protected.',
    category: 'payments',
  },
  {
    id: '6',
    q: 'How do I report harmful content?',
    a: 'Tap the ··· menu on any post → Report. Our moderation team reviews within 24 hours. Emergency issues are escalated immediately.',
    category: 'safety',
  },
];

const SUPPORT_OPTIONS = [
  { id: 'chat', label: 'Live Chat', desc: 'Chat with support now', icon: 'message-circle', color: '#A78BFA', available: true },
  { id: 'email', label: 'Email Support', desc: 'Reply in 2–4 hours', icon: 'mail', color: '#10B981', available: true },
  { id: 'call', label: 'Phone Call', desc: 'Schedule a callback', icon: 'phone', color: '#F59E0B', available: false },
  { id: 'video', label: 'Video Support', desc: 'Screen sharing help', icon: 'video', color: '#3B82F6', available: false },
];

function FAQItem({ faq }: { faq: (typeof FAQS)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.faqItem, open && styles.faqItemOpen]}
      onPress={() => setOpen((v) => !v)}
      activeOpacity={0.85}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.q}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </View>
      {open && (
        <Text style={styles.faqAnswer}>{faq.a}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredFaqs = FAQS.filter(
    (faq) =>
      (!activeCategory || faq.category === activeCategory) &&
      (search === '' || faq.q.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.headerTitle}>Help Center</Text>
          <Text style={styles.headerSub}>We're here to help you 24/7</Text>
        </View>
        <View style={styles.supportBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.supportBadgeText}>Online</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero banner */}
        <LinearGradient
          colors={['rgba(124,58,237,0.2)', 'rgba(167,139,250,0.08)', 'transparent']}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>How can we help you today?</Text>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help articles..."
              placeholderTextColor="#4B5563"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </LinearGradient>

        {/* Contact options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.supportGrid}>
            {SUPPORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.supportCard, !opt.available && styles.supportCardDisabled]}
                activeOpacity={opt.available ? 0.85 : 1}
              >
                <LinearGradient
                  colors={opt.available ? [opt.color + '18', opt.color + '06'] : ['rgba(255,255,255,0.02)', 'transparent']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.supportIcon, { backgroundColor: opt.color + (opt.available ? '20' : '08'), borderColor: opt.color + (opt.available ? '40' : '15') }]}>
                  <Feather name={opt.icon as any} size={20} color={opt.available ? opt.color : '#374151'} />
                </View>
                <Text style={[styles.supportLabel, !opt.available && styles.supportLabelDisabled]}>{opt.label}</Text>
                <Text style={styles.supportDesc}>{opt.desc}</Text>
                {!opt.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                )}
                {opt.available && (
                  <View style={[styles.availableBadge, { backgroundColor: opt.color + '20' }]}>
                    <Text style={[styles.availableBadgeText, { color: opt.color }]}>Active</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Topic</Text>
          <View style={styles.categoryGrid}>
            {FAQ_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                style={[styles.categoryCard, activeCategory === cat.id && { borderColor: cat.color + '60' }]}
              >
                {activeCategory === cat.id && (
                  <LinearGradient colors={[cat.color + '18', cat.color + '06']} style={StyleSheet.absoluteFill} />
                )}
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15', borderColor: cat.color + '30' }]}>
                  <Feather name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <Text style={[styles.categoryLabel, activeCategory === cat.id && { color: cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {activeCategory
                ? `${FAQ_CATEGORIES.find((c) => c.id === activeCategory)?.label} FAQs`
                : 'Frequently Asked'}
            </Text>
            {activeCategory && (
              <TouchableOpacity onPress={() => setActiveCategory(null)}>
                <Text style={styles.clearFilter}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => <FAQItem key={faq.id} faq={faq} />)
          ) : (
            <View style={styles.emptyState}>
              <Feather name="help-circle" size={40} color="#374151" />
              <Text style={styles.emptyText}>No articles found</Text>
            </View>
          )}
        </View>

        {/* Status card */}
        <View style={styles.section}>
          <LinearGradient colors={['rgba(16,185,129,0.12)', 'rgba(16,185,129,0.04)']} style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusGreenDot} />
              <Text style={styles.statusTitle}>All systems operational</Text>
            </View>
            <Text style={styles.statusSub}>Zayren App · Marketplace · Delivery · Payments are all running normally.</Text>
            <TouchableOpacity style={styles.statusLink}>
              <Feather name="external-link" size={12} color="#10B981" />
              <Text style={styles.statusLinkText}>View status page</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { color: '#F5F3FF', fontSize: 26, fontWeight: '800' },
  headerSub: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  supportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10B981' },
  supportBadgeText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  heroBanner: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    gap: 14,
  },
  heroTitle: { color: '#F5F3FF', fontSize: 18, fontWeight: '800', lineHeight: 26 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  searchInput: { flex: 1, color: '#D1D5DB', fontSize: 13 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clearFilter: { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  supportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  supportCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    gap: 6,
    overflow: 'hidden',
  },
  supportCardDisabled: { opacity: 0.6 },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  supportLabel: { color: '#F5F3FF', fontSize: 14, fontWeight: '700' },
  supportLabelDisabled: { color: '#4B5563' },
  supportDesc: { color: '#4B5563', fontSize: 10, lineHeight: 15 },
  comingSoonBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  comingSoonText: { color: '#4B5563', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  availableBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  availableBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '30%',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    gap: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  categoryLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  faqItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    marginBottom: 10,
  },
  faqItemOpen: { borderColor: 'rgba(167,139,250,0.2)' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  faqQuestion: { color: '#F5F3FF', fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 22 },
  faqAnswer: { color: '#9CA3AF', fontSize: 13, lineHeight: 22, marginTop: 12 },
  emptyState: { alignItems: 'center', gap: 10, paddingTop: 40 },
  emptyText: { color: '#374151', fontSize: 14, fontWeight: '600' },
  statusCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    gap: 8,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusGreenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statusTitle: { color: '#10B981', fontSize: 14, fontWeight: '700' },
  statusSub: { color: '#4B5563', fontSize: 12, lineHeight: 20 },
  statusLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  statusLinkText: { color: '#10B981', fontSize: 11, fontWeight: '600' },
});
