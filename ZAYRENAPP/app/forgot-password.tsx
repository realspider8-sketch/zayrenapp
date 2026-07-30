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
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ZLogo from '@/components/z-logo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { API_URL } from '@/lib/api';


const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'typing' | 'processing' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const emailRef = useRef<TextInput>(null);

    const handleNext = async () => {
        Keyboard.dismiss();
        setErrorMessage('');

        if (!email.trim() || !email.includes('@')) {
            setErrorMessage('Please enter a valid email address.');
            setStatus('error');
            return;
        }

        setStatus('processing');
        console.log('[Forgot Password] Attempting to request OTP for:', email);

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password?email=${encodeURIComponent(email.trim())}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('[Forgot Password] Response status:', response.status);
            const data = await response.json();
            console.log('[Forgot Password] Response data:', data);

            if (response.ok) {
                console.log('[Forgot Password] Success! Navigating to OTP screen');
                router.push({
                    pathname: '/forgot-otp',
                    params: { email },
                } as any);
                setStatus('idle');
            } else {
                setStatus('error');
                setErrorMessage(data.detail || 'Failed to request reset OTP. Please check your email.');
                console.log('[Forgot Password] Failed:', data.detail);
            }
        } catch (error: any) {
            setStatus('error');
            const errorMsg = error?.message || error?.toString() || 'Unknown error';
            console.error('[Forgot Password Error] Full error:', error);
            console.error('[Forgot Password Error] Message:', errorMsg);
            
            if (errorMsg.includes('Network') || errorMsg.includes('ECONNREFUSED')) {
                setErrorMessage(`Cannot connect to server at ${API_URL}`);
            } else {
                setErrorMessage('Unable to connect to the server. Please check your connection.');
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#06060c', '#0d0d1e', '#030307']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View style={styles.blurContainer}>
                    <LinearGradient
                        colors={['rgba(0, 252, 255, 0.15)', 'rgba(0, 252, 255, 0)']}
                        style={[styles.orb, { top: -90, right: -100 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <LinearGradient
                        colors={['rgba(255, 0, 127, 0.15)', 'rgba(255, 0, 127, 0)']}
                        style={[styles.orb, { bottom: -90, left: -100 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        disabled={status === 'processing'}
                    >
                        <IconSymbol size={28} name="chevron.left" color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.centerContent}>
                        {/* Header */}
                        <View style={styles.headerSection}>
                            <View style={styles.miniZ}>
                                <ZLogo status={status === 'processing' ? 'processing' : 'idle'} />
                            </View>
                            <Text style={styles.headerTitle}>Reset Password</Text>
                            <Text style={styles.headerSubtitle}>Enter your email to receive an OTP.</Text>
                            <View style={styles.headerLine} />
                        </View>

                        {/* Card */}
                        <View style={styles.card}>
                            {/* Email Input */}
                            <View style={styles.fieldLayout}>
                                <Text style={[styles.inputLabel, focusedField === 'email' && styles.inputLabelActive]}>
                                    Email address
                                </Text>
                                <TextInput
                                    ref={emailRef}
                                    style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                                    placeholder="example@domain.com"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setStatus('typing'); setErrorMessage(''); }}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={status !== 'processing'}
                                    returnKeyType="done"
                                    onSubmitEditing={handleNext}
                                />
                                {focusedField === 'email' && (
                                    <LinearGradient colors={['#00FCFF', '#FF007F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputFocusLine} />
                                )}
                            </View>

                            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                            {/* Info tip */}
                            <View style={styles.infoBox}>
                                <IconSymbol size={14} name="info.circle.fill" color="rgba(0,252,255,0.6)" />
                                <Text style={styles.infoText}>
                                    We will check if this email exists and send a 6-digit OTP code to verify your identity.
                                </Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleNext}
                                disabled={status === 'processing'}
                                style={styles.buttonContainer}
                            >
                                <LinearGradient
                                    colors={['#00FCFF', '#FF007F']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.button}
                                >
                                    {status === 'processing' ? (
                                        <View style={styles.btnContent}>
                                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={styles.buttonText}>CHECKING RECORD...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.btnContent}>
                                            <Text style={styles.buttonText}>SEND OTP</Text>
                                            <IconSymbol size={18} name="paperplane.fill" color="#fff" />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#06060c' },
    keyboardView: { flex: 1 },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 90,
        paddingBottom: 40,
    },
    blurContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    orb: { position: 'absolute', borderRadius: 200, width: 350, height: 350, opacity: 0.7 },
    backButton: {
        position: 'absolute', top: 50, left: 20,
        width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 10,
    },
    headerSection: { alignItems: 'center', marginBottom: 24 },
    miniZ: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', transform: [{ scale: 0.75 }] },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    headerLine: { width: 60, height: 3, backgroundColor: '#00FCFF', borderRadius: 1.5, marginTop: 12 },
    card: {
        width: Math.min(width - 40, 420),
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 28, paddingVertical: 26,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
    },
    fieldLayout: { marginBottom: 16, position: 'relative' },
    inputLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: '600', letterSpacing: 0.5 },
    inputLabelActive: { color: '#00FCFF' },
    input: {
        height: 48, backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        borderRadius: 12, paddingHorizontal: 16, color: '#fff', fontSize: 15,
    },
    inputFocused: { borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.05)' },
    inputFocusLine: { position: 'absolute', bottom: 0, left: 12, right: 12, height: 1.5 },
    errorText: { color: '#FF334B', fontSize: 13, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
    infoBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: 'rgba(0,252,255,0.05)', borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(0,252,255,0.1)',
        padding: 12, marginBottom: 20, marginTop: 4,
    },
    infoText: { flex: 1, color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 18 },
    buttonContainer: {
        borderRadius: 14, overflow: 'hidden',
        shadowColor: '#FF007F', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
    },
    button: { height: 50, justifyContent: 'center', alignItems: 'center' },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    buttonText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
});
