import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: W } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🔲' },
  { id: 'fashion', label: 'Fashion', icon: '👕' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'phones', label: 'Phones', icon: '📞' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'home', label: 'Home', icon: '🛋️' },
  { id: 'food', label: 'Food', icon: '🍔' },
];

const FEATURED_SHOPS = [
  {
    id: '1',
    shopName: 'StepUp Kicks',
    tagline: 'New Arrivals 🔥\nCheck out our new collection',
    verified: true,
    likes: '1.2K',
    comments: '96',
    shares: '125',
    gradient: ['#1a1a2e', '#2d1b69'] as [string, string],
    accentColor: '#7C3AED',
    initials: 'SK',
    avatarGrad: ['#7C3AED', '#A78BFA'] as [string, string],
    hasVideo: false,
  },
  {
    id: '2',
    shopName: 'Amara Fashion Store',
    tagline: "Latest collection is out 💚\nGrab yours now",
    verified: true,
    likes: '987',
    comments: '64',
    shares: '87',
    gradient: ['#0d2818', '#14532d'] as [string, string],
    accentColor: '#10B981',
    initials: 'AF',
    avatarGrad: ['#10B981', '#3B82F6'] as [string, string],
    hasVideo: true,
  },
  {
    id: '3',
    shopName: 'Tech Palace',
    tagline: 'Smart life, easy life ⚡\nBest gadgets for you',
    verified: true,
    likes: '756',
    comments: '43',
    shares: '56',
    gradient: ['#0f172a', '#1e3a5f'] as [string, string],
    accentColor: '#3B82F6',
    initials: 'TP',
    avatarGrad: ['#3B82F6', '#06B6D4'] as [string, string],
    hasVideo: false,
  },
  {
    id: '4',
    shopName: 'Royal Threads',
    tagline: "Quality never goes out\nof style ✨",
    verified: true,
    likes: '643',
    comments: '38',
    shares: '41',
    gradient: ['#2d1800', '#78350f'] as [string, string],
    accentColor: '#F59E0B',
    initials: 'RT',
    avatarGrad: ['#F59E0B', '#EF4444'] as [string, string],
    hasVideo: true,
  },
];

// Removed mock PRODUCTS

const TRENDING_SHOPS = [
  { id: '1', name: 'Amara Fashion Store', followers: '12.4K', rating: 4.8, initials: 'AM', grad: ['#F59E0B', '#EF4444'] as [string, string], shopNumber: '#001' },
  { id: '2', name: 'Tech Palace', followers: '8.7K', rating: 4.9, initials: 'TP', grad: ['#3B82F6', '#06B6D4'] as [string, string], shopNumber: '#003' },
  { id: '3', name: 'StepUp Kicks', followers: '6.2K', rating: 4.7, initials: 'SK', grad: ['#7C3AED', '#A78BFA'] as [string, string], shopNumber: '#001' },
  { id: '4', name: 'Royal Threads', followers: '5.8K', rating: 4.8, initials: 'RT', grad: ['#EC4899', '#F97316'] as [string, string], shopNumber: '#004' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function FeaturedShopCard({ shop }: { shop: typeof FEATURED_SHOPS[0] }) {
  const [followed, setFollowed] = useState(false);
  return (
    <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
      <LinearGradient colors={shop.gradient} style={StyleSheet.absoluteFill} />

      {/* AD badge */}
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>Ad</Text>
      </View>

      {/* Stats top-right */}
      <View style={styles.featuredStats}>
        <View style={styles.featuredStatRow}>
          <Ionicons name="heart" size={13} color="#fff" />
          <Text style={styles.featuredStatText}>{shop.likes}</Text>
        </View>
        <View style={styles.featuredStatRow}>
          <Feather name="message-circle" size={13} color="#fff" />
          <Text style={styles.featuredStatText}>{shop.comments}</Text>
        </View>
        <View style={styles.featuredStatRow}>
          <Feather name="share-2" size={12} color="#fff" />
          <Text style={styles.featuredStatText}>{shop.shares}</Text>
        </View>
      </View>

      {/* Play button for video shops */}
      {shop.hasVideo && (
        <View style={styles.featuredPlayBtn}>
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']} style={styles.featuredPlayInner}>
            <Feather name="play" size={18} color="#fff" />
          </LinearGradient>
        </View>
      )}

      {/* Center icon/avatar */}
      {!shop.hasVideo && (
        <LinearGradient colors={shop.avatarGrad} style={styles.featuredCenterAvatar}>
          <Text style={styles.featuredCenterInitials}>{shop.initials}</Text>
        </LinearGradient>
      )}

      {/* Bottom info */}
      <View style={styles.featuredBottom}>
        {/* Shop avatar row */}
        <View style={styles.featuredShopRow}>
          <LinearGradient colors={shop.avatarGrad} style={styles.featuredShopAvatar}>
            <Text style={styles.featuredShopAvatarText}>{shop.initials}</Text>
          </LinearGradient>
          <View style={styles.featuredShopNameWrap}>
            <View style={styles.featuredShopNameRow}>
              <Text style={styles.featuredShopName} numberOfLines={1}>{shop.shopName}</Text>
              {shop.verified && (
                <MaterialCommunityIcons name="check-decagram" size={13} color={shop.accentColor} />
              )}
            </View>
          </View>
        </View>
        <Text style={styles.featuredTagline} numberOfLines={2}>{shop.tagline}</Text>
        <TouchableOpacity
          style={[styles.followShopBtn, followed && styles.followShopBtnActive]}
          onPress={() => setFollowed(f => !f)}
        >
          <Text style={styles.followShopBtnText}>{followed ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function ProductCard({ product, onAddToCart }: { product: any, onAddToCart: (id: string) => void }) {
  const [wishlisted, setWishlisted] = useState(false);
  const isLight = product.isLight || false;
  // Fallback gradient logic for server products
  const grad = product.gradient || ['#1a1a1a', '#2d2d2d'];

  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.88}>
      {/* Image area */}
      <View style={styles.productImageArea}>
        <LinearGradient
          colors={grad}
          style={StyleSheet.absoluteFill}
        />
        {/* Badge */}
        {product.badge && (
          <View style={[styles.productBadge, { backgroundColor: product.badgeColor || '#EF4444' }]}>
            <Text style={styles.productBadgeText}>{product.badge}</Text>
          </View>
        )}
        {/* Wishlist */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => setWishlisted(w => !w)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={16}
            color={wishlisted ? '#EF4444' : 'rgba(255,255,255,0.7)'}
          />
        </TouchableOpacity>
        {/* Center icon */}
        <View style={styles.productCenterIcon}>
          <Feather name="shopping-bag" size={34} color={isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)'} />
        </View>
      </View>
      {/* Info area */}
      <View style={styles.productInfoArea}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        
        {/* Shop info */}
        <View style={styles.productSellerRow}>
          <Text style={styles.productSeller} numberOfLines={1}>{product.shop?.name || product.shopName || 'Shop'}</Text>
          <MaterialCommunityIcons name="check-decagram" size={11} color="#A78BFA" />
        </View>

        {/* Rating & Stock */}
        <View style={styles.productMetaRow}>
          <View style={styles.productRatingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.productRating}>{product.rating || 4.8}</Text>
          </View>
          <Text style={styles.productAvailable}>{product.stock_quantity !== undefined ? product.stock_quantity : product.available || 0} left</Text>
        </View>

        {/* Price & Add */}
        <View style={styles.productBottomRow}>
          <View>
            <Text style={styles.productPrice}>₦{(product.price || 0).toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.addToCartBtn} onPress={() => onAddToCart(product.id)}>
            <LinearGradient
              colors={['#7C3AED', '#A78BFA']}
              style={styles.addToCartGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Feather name="shopping-cart" size={12} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TrendingShopCard({ shop }: { shop: typeof TRENDING_SHOPS[0] }) {
  const [followed, setFollowed] = useState(false);
  return (
    <View style={styles.trendingShopCard}>
      <LinearGradient colors={shop.grad} style={styles.trendingShopAvatar}>
        <Text style={styles.trendingShopAvatarText}>{shop.initials}</Text>
      </LinearGradient>
      <View style={styles.trendingShopInfo}>
        <Text style={styles.trendingShopName} numberOfLines={1}>{shop.name}</Text>
        <Text style={styles.trendingShopFollowers}>{shop.followers} followers</Text>
        <View style={styles.trendingShopRatingRow}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={styles.trendingShopRating}>{shop.rating}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.trendingFollowBtn, followed && styles.trendingFollowBtnActive]}
        onPress={() => setFollowed(f => !f)}
      >
        <Text style={[styles.trendingFollowBtnText, followed && styles.trendingFollowBtnTextActive]}>
          {followed ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────

import { supabase } from '../../lib/supabase';

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    });

    fetch(`${API_URL}/api/market/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Failed to fetch products", err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!userId) {
      alert("Please login first");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/market/cart/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      if (res.ok) {
        alert("Added to cart!");
      } else {
        alert("Failed to add to cart");
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const filtered = products.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory || !p.category
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.appBrand}>ZAYREN</Text>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <Text style={styles.headerSub}>Discover • Shop • Support creators</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/market/cart')}>
            <Feather name="shopping-cart" size={20} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Feather name="message-circle" size={20} color="#D1D5DB" />
            <View style={styles.msgBadge}><Text style={styles.msgBadgeText}>•</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, shops or creators..."
              placeholderTextColor="#4B5563"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Feather name="sliders" size={18} color="#A78BFA" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
            >
              {activeCategory === cat.id && (
                <LinearGradient
                  colors={['#7C3AED', '#A78BFA']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              )}
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, activeCategory === cat.id && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Featured Shop Videos ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Featured Shop Videos</Text>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See all</Text>
              <Feather name="chevron-right" size={14} color="#A78BFA" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {FEATURED_SHOPS.map((shop) => (
              <FeaturedShopCard key={shop.id} shop={shop} />
            ))}
          </ScrollView>
        </View>

        {/* ── Recommended Products ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Products</Text>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See all</Text>
              <Feather name="chevron-right" size={14} color="#A78BFA" />
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {loading ? (
              <Text style={{ color: '#6B7280', padding: 20 }}>Loading products...</Text>
            ) : filtered.length > 0 ? (
              filtered.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))
            ) : (
              <Text style={{ color: '#6B7280', padding: 20 }}>No products found</Text>
            )}
          </View>
        </View>

        {/* ── Trending Shops ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Shops</Text>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See all</Text>
              <Feather name="chevron-right" size={14} color="#A78BFA" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingShopsScroll}
          >
            {TRENDING_SHOPS.map((shop) => (
              <TrendingShopCard key={shop.id} shop={shop} />
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const CARD_W = (W - 48) / 2;
const FEATURED_W = W * 0.44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  appBrand: { color: '#7C3AED', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 2 },
  headerTitle: { color: '#F5F3FF', fontSize: 26, fontWeight: '800', letterSpacing: 0.2 },
  headerSub: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  cartBadge: {
    position: 'absolute', top: 7, right: 7,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  msgBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#A78BFA', alignItems: 'center', justifyContent: 'center',
  },
  msgBadgeText: { color: '#fff', fontSize: 6, fontWeight: '800' },

  // Search
  searchWrapper: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  searchInput: { flex: 1, color: '#D1D5DB', fontSize: 13 },
  filterBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(167,139,250,0.1)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },

  // Categories
  categoriesScroll: { marginBottom: 8 },
  categoriesContainer: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  categoryChipActive: { borderColor: '#7C3AED' },
  categoryIcon: { fontSize: 13 },
  categoryLabel: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  categoryLabelActive: { color: '#fff' },

  // Sections
  sectionWrapper: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { color: '#F5F3FF', fontSize: 16, fontWeight: '700' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { color: '#A78BFA', fontSize: 13, fontWeight: '600' },

  // Featured shop cards
  featuredScroll: { paddingHorizontal: 16, gap: 12 },
  featuredCard: {
    width: FEATURED_W,
    height: FEATURED_W * 1.55,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
  },
  adBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, zIndex: 2,
  },
  adBadgeText: { color: '#D1D5DB', fontSize: 10, fontWeight: '700' },
  featuredStats: {
    position: 'absolute', top: 10, right: 10,
    alignItems: 'center', gap: 8, zIndex: 2,
  },
  featuredStatRow: { alignItems: 'center', gap: 2 },
  featuredStatText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  featuredPlayBtn: {
    position: 'absolute', top: '40%', left: '50%',
    marginLeft: -20, marginTop: -20, zIndex: 2,
  },
  featuredPlayInner: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  featuredCenterAvatar: {
    position: 'absolute', top: '35%', left: '50%',
    marginLeft: -26, marginTop: -26,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  featuredCenterInitials: { color: '#fff', fontSize: 18, fontWeight: '800' },
  featuredBottom: {
    padding: 10, gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(10px)',
  },
  featuredShopRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  featuredShopAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  featuredShopAvatarText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  featuredShopNameWrap: { flex: 1 },
  featuredShopNameRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  featuredShopName: { color: '#F5F3FF', fontSize: 11, fontWeight: '700', flex: 1 },
  featuredTagline: { color: '#D1D5DB', fontSize: 10, lineHeight: 14 },
  followShopBtn: {
    backgroundColor: '#7C3AED', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center',
  },
  followShopBtnActive: { backgroundColor: 'rgba(124,58,237,0.25)', borderWidth: 1, borderColor: '#7C3AED' },
  followShopBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Products grid
  productsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, paddingHorizontal: 16,
  },
  productCard: {
    width: CARD_W,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  productImageArea: {
    height: 148, alignItems: 'center', justifyContent: 'center',
  },
  productBadge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  productBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  wishlistBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  productCenterIcon: { opacity: 0.6 },
  productInfo: { padding: 10, gap: 3 },

  // Shop number badge
  shopNumberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(124,58,237,0.15)',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
    marginBottom: 2,
  },
  shopNumberText: { color: '#A78BFA', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  productName: { color: '#F5F3FF', fontSize: 13, fontWeight: '700' },
  productSellerRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  productSeller: { color: '#6B7280', fontSize: 10, fontWeight: '500', flex: 1 },
  productRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  productRating: { color: '#F59E0B', fontSize: 10, fontWeight: '700' },
  productRatingCount: { color: '#4B5563', fontSize: 10 },
  productAvailable: { color: '#4B5563', fontSize: 10 },
  productPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  productPrice: { color: '#A78BFA', fontSize: 15, fontWeight: '800' },
  productOriginalPrice: {
    color: '#4B5563', fontSize: 11,
    textDecorationLine: 'line-through',
  },
  addToCartBtn: { marginTop: 6, borderRadius: 9, overflow: 'hidden', alignSelf: 'flex-end' },
  addToCartGrad: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 9,
  },

  // Trending shops
  trendingShopsScroll: { paddingHorizontal: 16, gap: 12 },
  trendingShopCard: {
    width: W * 0.55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  trendingShopAvatar: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  trendingShopAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  trendingShopInfo: { flex: 1, gap: 2 },
  trendingShopName: { color: '#F5F3FF', fontSize: 12, fontWeight: '700' },
  trendingShopFollowers: { color: '#6B7280', fontSize: 10 },
  trendingShopRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendingShopRating: { color: '#F59E0B', fontSize: 10, fontWeight: '700' },
  trendingFollowBtn: {
    backgroundColor: '#7C3AED', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  trendingFollowBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: '#7C3AED',
  },
  trendingFollowBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  trendingFollowBtnTextActive: { color: '#A78BFA' },
});
