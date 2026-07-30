import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ZLogo from '@/components/z-logo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { API_URL } from '@/lib/api';


const { width, height } = Dimensions.get('window');

// Mock OTP that will be "sent" to the phone
const MOCK_OTP = '123456';

// Country code data — flag emoji, name, dial code
const COUNTRIES = [
    { flag: '🇳🇬', name: 'Nigeria', code: '+234' },
    { flag: '🇺🇸', name: 'United States', code: '+1' },
    { flag: '🇬🇧', name: 'United Kingdom', code: '+44' },
    { flag: '🇨🇦', name: 'Canada', code: '+1' },
    { flag: '🇦🇺', name: 'Australia', code: '+61' },
    { flag: '🇮🇳', name: 'India', code: '+91' },
    { flag: '🇿🇦', name: 'South Africa', code: '+27' },
    { flag: '🇬🇭', name: 'Ghana', code: '+233' },
    { flag: '🇰🇪', name: 'Kenya', code: '+254' },
    { flag: '🇪🇬', name: 'Egypt', code: '+20' },
    { flag: '🇫🇷', name: 'France', code: '+33' },
    { flag: '🇩🇪', name: 'Germany', code: '+49' },
    { flag: '🇮🇹', name: 'Italy', code: '+39' },
    { flag: '🇪🇸', name: 'Spain', code: '+34' },
    { flag: '🇵🇹', name: 'Portugal', code: '+351' },
    { flag: '🇧🇷', name: 'Brazil', code: '+55' },
    { flag: '🇲🇽', name: 'Mexico', code: '+52' },
    { flag: '🇦🇷', name: 'Argentina', code: '+54' },
    { flag: '🇵🇰', name: 'Pakistan', code: '+92' },
    { flag: '🇧🇩', name: 'Bangladesh', code: '+880' },
    { flag: '🇸🇦', name: 'Saudi Arabia', code: '+966' },
    { flag: '🇦🇪', name: 'UAE', code: '+971' },
    { flag: '🇵🇭', name: 'Philippines', code: '+63' },
    { flag: '🇮🇩', name: 'Indonesia', code: '+62' },
    { flag: '🇲🇾', name: 'Malaysia', code: '+60' },
    { flag: '🇸🇬', name: 'Singapore', code: '+65' },
    { flag: '🇯🇵', name: 'Japan', code: '+81' },
    { flag: '🇨🇳', name: 'China', code: '+86' },
    { flag: '🇷🇺', name: 'Russia', code: '+7' },
    { flag: '🇹🇷', name: 'Turkey', code: '+90' },
];

export default function RegisterPhoneScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        email?: string;
        password?: string;
        firstName?: string;
        middleName?: string;
        surname?: string;
        day?: string;
        month?: string;
        year?: string;
        gender?: string;
    }>();

    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default: Nigeria
    const [phone, setPhone] = useState('');
    const [countryModalVisible, setCountryModalVisible] = useState(false);
    const [status, setStatus] = useState<'idle' | 'typing' | 'processing'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [filterText, setFilterText] = useState('');

    const phoneRef = useRef<TextInput>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const filteredCountries = COUNTRIES.filter(
        (c) =>
            c.name.toLowerCase().includes(filterText.toLowerCase()) ||
            c.code.includes(filterText)
    );

    const handleSendOtp = async () => {
        Keyboard.dismiss();
        setErrorMessage('');

        const cleaned = phone.replace(/\s/g, '');
        if (!cleaned || cleaned.length < 5) {
            setErrorMessage('Please enter a valid phone number.');
            return;
        }

        setStatus('processing');
        const fullPhone = `${selectedCountry.code} ${phone}`;

        try {
            const dobString = params.year && params.month && params.day 
                ? `${params.year}-${params.month}-${params.day}`
                : '';

            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: params.email?.trim(),
                    password: params.password,
                    first_name: params.firstName?.trim(),
                    last_name: params.surname?.trim(),
                    dob: dobString,
                    gender: params.gender,
                    phone_number: fullPhone.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push({
                    pathname: '/verify',
                    params: {
                        phone: fullPhone,
                        email: params.email ?? '',
                        mockOtp: MOCK_OTP,
                    },
                } as any);
            } else {
                setStatus('idle');
                setErrorMessage(data.detail || 'Registration failed. Please check your data.');
            }
        } catch (error) {
            setStatus('idle');
            setErrorMessage('Unable to connect to the server. Please try again later.');
            console.error('[Register API Error]', error);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Background */}
                <LinearGradient
                    colors={['#06060c', '#0d0d1e', '#030307']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {/* Ambient Orbs */}
                <View style={styles.blurContainer}>
                    <LinearGradient
                        colors={['rgba(0, 252, 255, 0.18)', 'rgba(0, 252, 255, 0)']}
                        style={[styles.orb, { top: -90, right: -100 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <LinearGradient
                        colors={['rgba(160, 32, 240, 0.22)', 'rgba(160, 32, 240, 0)']}
                        style={[styles.orb, { bottom: -90, left: -100 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        disabled={status === 'processing'}
                    >
                        <IconSymbol size={28} name="chevron.left" color="#fff" />
                    </TouchableOpacity>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Step Progress — 4 steps */}
                        <View style={styles.stepBadgeRow}>
                            <View style={[styles.stepDot, styles.stepDotDone]}>
                                <Text style={[styles.stepDotText, styles.stepDotTextActive]}>✓</Text>
                            </View>
                            <View style={[styles.stepLine, styles.stepLineActive]} />
                            <View style={[styles.stepDot, styles.stepDotDone]}>
                                <Text style={[styles.stepDotText, styles.stepDotTextActive]}>✓</Text>
                            </View>
                            <View style={[styles.stepLine, styles.stepLineActive]} />
                            <View style={[styles.stepDot, styles.stepDotActive]}>
                                <Text style={[styles.stepDotText, styles.stepDotTextActive]}>3</Text>
                            </View>
                            <View style={styles.stepLine} />
                            <View style={styles.stepDot}>
                                <Text style={styles.stepDotText}>4</Text>
                            </View>
                        </View>

                        {/* Logo & Header */}
                        <View style={styles.headerSection}>
                            <View style={styles.miniZ}>
                                <ZLogo status={status === 'processing' ? 'processing' : 'idle'} />
                            </View>
                            <Text style={styles.headerTitle}>Your phone number</Text>
                            <Text style={styles.headerSubtitle}>We'll send a verification code to it.</Text>
                            <View style={styles.headerLine} />
                        </View>

                        {/* Phone Card */}
                        <View style={styles.card}>
                            {/* Phone Number Label */}
                            <Text style={styles.sectionLabel}>Mobile number</Text>

                            {/* Country + Phone Row */}
                            <View style={styles.phoneRow}>
                                {/* Country Code Button */}
                                <TouchableOpacity
                                    style={styles.countryBtn}
                                    onPress={() => { Keyboard.dismiss(); setCountryModalVisible(true); }}
                                    activeOpacity={0.8}
                                    disabled={status === 'processing'}
                                >
                                    <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                                    <Text style={styles.codeText}>{selectedCountry.code}</Text>
                                    <IconSymbol size={14} name="chevron.down" color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>

                                {/* Phone Number Input */}
                                <View style={styles.phoneInputWrapper}>
                                    <TextInput
                                        ref={phoneRef}
                                        style={[styles.phoneInput, focusedField === 'phone' && styles.phoneInputFocused]}
                                        placeholder="Enter phone number"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={phone}
                                        onChangeText={(text) => { setPhone(text); setStatus('typing'); setErrorMessage(''); }}
                                        onFocus={() => setFocusedField('phone')}
                                        onBlur={() => setFocusedField(null)}
                                        keyboardType="phone-pad"
                                        editable={status !== 'processing'}
                                    />
                                    {focusedField === 'phone' && (
                                        <LinearGradient
                                            colors={['#00FCFF', '#00FF88']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.inputFocusLine}
                                        />
                                    )}
                                </View>
                            </View>

                            {/* Preview of full number */}
                            {phone.length > 0 && (
                                <View style={styles.previewRow}>
                                    <IconSymbol size={12} name="phone.fill" color="rgba(0,255,136,0.6)" />
                                    <Text style={styles.previewText}>
                                        {selectedCountry.flag}  {selectedCountry.code} {phone}
                                    </Text>
                                </View>
                            )}

                            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                            {/* Info tip */}
                            <View style={styles.infoBox}>
                                <IconSymbol size={14} name="info.circle.fill" color="rgba(0,252,255,0.6)" />
                                <Text style={styles.infoText}>
                                    An SMS with a 6-digit code will be sent to this number.
                                </Text>
                            </View>

                            {/* Send OTP Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleSendOtp}
                                disabled={status === 'processing'}
                                style={styles.buttonContainer}
                            >
                                <LinearGradient
                                    colors={['#00FCFF', '#00FF88']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.button}
                                >
                                    {status === 'processing' ? (
                                        <View style={styles.btnContent}>
                                            <Text style={styles.buttonText}>SENDING OTP...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.btnContent}>
                                            <Text style={styles.buttonText}>SEND OTP</Text>
                                            <IconSymbol size={18} name="paperplane.fill" color="#000" />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Country Code Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={countryModalVisible}
                    onRequestClose={() => setCountryModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setCountryModalVisible(false)}>
                        <View style={styles.modalBG}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    {/* Modal Header */}
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Select Country</Text>
                                        <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                                            <Text style={styles.modalClose}>Done</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Search bar */}
                                    <View style={styles.searchWrapper}>
                                        <IconSymbol size={16} name="magnifyingglass" color="rgba(255,255,255,0.3)" />
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Search country or code..."
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={filterText}
                                            onChangeText={setFilterText}
                                            autoCapitalize="none"
                                        />
                                        {filterText.length > 0 && (
                                            <TouchableOpacity onPress={() => setFilterText('')}>
                                                <IconSymbol size={14} name="xmark.circle.fill" color="rgba(255,255,255,0.4)" />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Country list */}
                                    <FlatList
                                        data={filteredCountries}
                                        keyExtractor={(item) => `${item.name}-${item.code}`}
                                        renderItem={({ item }) => {
                                            const isSelected = item.name === selectedCountry.name && item.code === selectedCountry.code;
                                            return (
                                                <TouchableOpacity
                                                    style={[styles.countryItem, isSelected && styles.countryItemActive]}
                                                    onPress={() => {
                                                        setSelectedCountry(item);
                                                        setCountryModalVisible(false);
                                                        setFilterText('');
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.countryItemFlag}>{item.flag}</Text>
                                                    <Text style={[styles.countryItemName, isSelected && styles.countryItemNameActive]}>
                                                        {item.name}
                                                    </Text>
                                                    <Text style={[styles.countryItemCode, isSelected && styles.countryItemCodeActive]}>
                                                        {item.code}
                                                    </Text>
                                                    {isSelected && (
                                                        <IconSymbol size={16} name="checkmark.circle.fill" color="#00FF88" />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        }}
                                        style={styles.countryList}
                                        showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps="handled"
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#06060c',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 90,
        paddingBottom: 40,
    },
    blurContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        borderRadius: 200,
        width: 350,
        height: 350,
        opacity: 0.7,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 10,
    },
    stepBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    stepDotActive: {
        backgroundColor: 'rgba(0,252,255,0.12)',
        borderColor: '#00FCFF',
    },
    stepDotDone: {
        backgroundColor: 'rgba(0,255,136,0.12)',
        borderColor: '#00FF88',
    },
    stepDotText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontWeight: '700',
    },
    stepDotTextActive: {
        color: '#00FF88',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 6,
    },
    stepLineActive: {
        backgroundColor: '#00FF88',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    miniZ: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: 0.75 }],
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 4,
        letterSpacing: 0.3,
    },
    headerLine: {
        width: 60,
        height: 3,
        backgroundColor: '#00FCFF',
        borderRadius: 1.5,
        marginTop: 12,
    },
    card: {
        width: Math.min(width - 40, 420),
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 28,
        paddingVertical: 26,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    sectionLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '600',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 10,
        marginBottom: 12,
    },
    countryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    flagText: {
        fontSize: 20,
    },
    codeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    phoneInputWrapper: {
        flex: 1,
        position: 'relative',
    },
    phoneInput: {
        height: 46,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        color: '#fff',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    phoneInputFocused: {
        borderColor: 'transparent',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    inputFocusLine: {
        position: 'absolute',
        bottom: 0,
        left: 12,
        right: 12,
        height: 1.5,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    previewText: {
        color: 'rgba(0,255,136,0.7)',
        fontSize: 13,
        fontWeight: '500',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: 'rgba(0,252,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,252,255,0.1)',
        padding: 12,
        marginBottom: 20,
        marginTop: 4,
    },
    infoText: {
        flex: 1,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        lineHeight: 18,
    },
    errorText: {
        color: '#FF334B',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '500',
    },
    buttonContainer: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#00FCFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    button: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#06060c',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
    // Modal
    modalBG: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0d0d1e',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        maxHeight: height * 0.75,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    modalClose: {
        color: '#00FF88',
        fontSize: 15,
        fontWeight: '600',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 16,
        marginVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        padding: 0,
    },
    countryList: {
        paddingHorizontal: 12,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
        gap: 12,
        borderRadius: 10,
    },
    countryItemActive: {
        backgroundColor: 'rgba(0,255,136,0.05)',
    },
    countryItemFlag: {
        fontSize: 22,
    },
    countryItemName: {
        flex: 1,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '500',
    },
    countryItemNameActive: {
        color: '#fff',
        fontWeight: '700',
    },
    countryItemCode: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontWeight: '600',
        marginRight: 4,
    },
    countryItemCodeActive: {
        color: '#00FF88',
    },
});
