import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/lib/api';

const { width } = Dimensions.get('window');

// Define global interface to avoid TS errors
declare global {
    var setIsAuthenticatedGlobal: ((val: boolean) => void) | undefined;
}

export default function DevToolsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('Users');

    useEffect(() => {
        fetchDevData();
    }, []);

    const fetchDevData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/dev/summary`);
            if (!res.ok) {
                throw new Error('Failed to fetch dev data');
            }
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Error fetching dev data:', error);
            Alert.alert('Error', 'Could not load development data. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (user: any) => {
        try {
            // Mock login as the selected test user
            await SecureStore.setItemAsync('zayren_is_authenticated', 'true');
            await SecureStore.setItemAsync('zayren_user_id', user.id);
            await SecureStore.setItemAsync('zayren_user_name', user.name);
            await SecureStore.setItemAsync('zayren_user_username', user.username);
            
            Alert.alert('Success', `Logged in as ${user.username}`, [
                {
                    text: 'Continue',
                    onPress: () => {
                        if (typeof global.setIsAuthenticatedGlobal === 'function') {
                            global.setIsAuthenticatedGlobal(true);
                        }
                        router.replace('/(tabs)');
                    }
                }
            ]);
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Failed to perform quick login');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#A78BFA" />
                <Text style={{ color: '#fff', marginTop: 10 }}>Loading Dev Data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
            
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Development Tools</Text>
                <TouchableOpacity onPress={fetchDevData} style={styles.backBtn}>
                    <Feather name="refresh-cw" size={20} color="#A78BFA" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Users</Text>
                    <Text style={styles.statValue}>{data?.stats?.total_users || 0}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Shops</Text>
                    <Text style={styles.statValue}>{data?.stats?.total_shops || 0}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Products</Text>
                    <Text style={styles.statValue}>{data?.stats?.total_products || 0}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Offices</Text>
                    <Text style={styles.statValue}>{data?.stats?.total_delivery_offices || 0}</Text>
                </View>
            </View>

            <View style={styles.tabsRow}>
                {['Users', 'Shops', 'Products', 'Offices'].map(tab => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeTab === 'Users' && data?.users?.map((user: any) => (
                    <View key={user.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{user.name}</Text>
                                <Text style={styles.cardSubtitle}>@{user.username} • {user.email}</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.actionBtn}
                                onPress={() => handleQuickLogin(user)}
                            >
                                <Text style={styles.actionBtnText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.cardDetail}>Posts: {user.posts_count} | Followers: {user.followers_count}</Text>
                    </View>
                ))}

                {activeTab === 'Shops' && data?.shops?.map((shop: any) => (
                    <View key={shop.id} style={styles.card}>
                        <Text style={styles.cardTitle}>{shop.name}</Text>
                        <Text style={styles.cardSubtitle}>{shop.phone} • {shop.address}</Text>
                        <Text style={styles.cardDetail}>Products: {shop.products_count} • Owner ID: {shop.owner_id?.substring(0,8)}...</Text>
                    </View>
                ))}

                {activeTab === 'Products' && data?.products?.map((product: any) => (
                    <View key={product.id} style={styles.card}>
                        <Text style={styles.cardTitle}>{product.name}</Text>
                        <Text style={styles.cardSubtitle}>{product.shop_name} • ₦{product.price}</Text>
                        <Text style={styles.cardDetail}>Stock: {product.stock_quantity} • Cat: {product.category}</Text>
                    </View>
                ))}

                {activeTab === 'Offices' && data?.delivery_offices?.map((office: any) => (
                    <View key={office.id} style={styles.card}>
                        <Text style={styles.cardTitle}>{office.name} ({office.tag})</Text>
                        <Text style={styles.cardSubtitle}>{office.phone} • {office.address}</Text>
                        <Text style={styles.cardDetail}>Base Fee: ₦{office.base_fee} • Rating: {office.rating}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0B1A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statLabel: {
        color: '#9CA3AF',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statValue: {
        color: '#A78BFA',
        fontSize: 20,
        fontWeight: '800',
        marginTop: 4,
    },
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#A78BFA',
    },
    tabText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    cardSubtitle: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    cardDetail: {
        color: '#D1D5DB',
        fontSize: 12,
        marginTop: 6,
    },
    actionBtn: {
        backgroundColor: '#10B981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
});
