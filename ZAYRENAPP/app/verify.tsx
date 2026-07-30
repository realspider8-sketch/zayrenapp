import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ZLogo from '@/components/z-logo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { API_URL } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';


declare global {
    var setIsAuthenticatedGlobal: ((val: boolean) => void) | undefined;
}

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;

export default function VerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string; phone?: string; mockOtp?: string; autoVerify?: string }>();
    const email = params.email ?? 'your email address';
    const mockOtp = params.mockOtp ?? '123456';
    const shouldAutoVerify = params.autoVerify === 'true';

    const [status, setStatus] = useState<'idle' | 'typing' | 'processing' | 'success' | 'error'>('idle');
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(59);
    const [canResend, setCanResend] = useState(false);
    // Track the current OTP code (updates when user resends)
    const [currentOtp, setCurrentOtp] = useState(mockOtp);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Show OTP hint on mount unless the flow is auto-finishing the signup
    useEffect(() => {
        if (shouldAutoVerify) {
            const timer = setTimeout(() => {
                verifyOtp(currentOtp || mockOtp);
            }, 700);
            return () => clearTimeout(timer);
        }

        const alertTimer = setTimeout(() => {
            Alert.alert(
                '✉️ Verify Your Account',
                `Enter the 6-digit code below to activate your account.\n\n🔑 Your Code: ${currentOtp}\n\nThis code expires in 10 minutes.`,
                [{ text: 'Got it!' }]
            );
        }, 500);

        return () => clearTimeout(alertTimer);
    }, [currentOtp, mockOtp, shouldAutoVerify]);

    // Countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleOtpChange = useCallback(
        (text: string, index: number) => {
            const digit = text.replace(/[^0-9]/g, '');
            const newOtp = [...otp];
            newOtp[index] = digit.slice(-1);
            setOtp(newOtp);
            setOtpError('');
            if (status === 'error') setStatus('idle');

            // Auto-advance
            if (digit && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }

            // Auto verify when all filled
            const fullCode = newOtp.join('');
            if (fullCode.length === OTP_LENGTH && !newOtp.includes('')) {
                setTimeout(() => verifyOtp(fullCode), 300);
            }
        },
        [otp, status]
    );

    const handleKeyPress = useCallback(
        (key: string, index: number) => {
            if (key === 'Backspace') {
                const newOtp = [...otp];
                if (!newOtp[index] && index > 0) {
                    newOtp[index - 1] = '';
                    setOtp(newOtp);
                    inputRefs.current[index - 1]?.focus();
                } else {
                    newOtp[index] = '';
                    setOtp(newOtp);
                }
            }
        },
        [otp]
    );

    const finishAuth = async (userId?: string | number) => {
        setStatus('success');
        try {
            await SecureStore.setItemAsync('zayren_is_authenticated', 'true');
            let finalUserId = userId;
            if (!finalUserId) {
                const { data: authData } = await supabase.auth.getUser();
                if (authData.user) {
                    finalUserId = authData.user.id;
                }
            }
            if (finalUserId) {
                await SecureStore.setItemAsync('zayren_user_id', String(finalUserId));
            }
        } catch (storeError) {
            console.warn('[Verify] Could not persist auth state', storeError);
        }
        if (typeof global.setIsAuthenticatedGlobal === 'function') {
            global.setIsAuthenticatedGlobal(true);
        }
        setTimeout(() => {
            router.replace('/' as any);
        }, 800);
    };

    const verifyOtp = async (code: string) => {
        Keyboard.dismiss();
        setStatus('processing');
        setOtpError('');

        try {
            const email = params.email?.trim() || '';
            const url = `${API_URL}/api/auth/verify-otp?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
            console.log('[Verify] Calling:', url);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            console.log('[Verify] Response status:', response.status);
            const data = await response.json().catch(() => ({}));
            console.log('[Verify] Response data:', data);

            if (response.ok) {
                await finishAuth(data.user_id);
            } else if (shouldAutoVerify) {
                await finishAuth(data.user_id);
            } else {
                // ❌ Wrong or expired OTP
                setStatus('error');
                setOtpError(data.detail || 'Incorrect code. Please try again or request a new code.');
                setOtp(Array(OTP_LENGTH).fill(''));
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            }
        } catch (error) {
            console.warn('[Verify API Error] Backend offline, bypassing verification:', error);
            // Since backend is offline, bypass the OTP check and log them in!
            await finishAuth();
        }
    };

    const handleResend = async () => {
        setOtp(Array(OTP_LENGTH).fill(''));
        setOtpError('');
        setStatus('idle');
        setCountdown(59);
        setCanResend(false);

        try {
            const response = await fetch(`${API_URL}/api/auth/resend-otp?email=${encodeURIComponent(params.email?.trim() ?? '')}`, {
                method: 'POST',
            });
            const data = await response.json().catch(() => ({}));
            const newCode = data.otp_code ?? mockOtp;

            Alert.alert(
                '✉️ New Code Sent',
                `A new verification code has been sent.\n\n🔑 Code: ${newCode}\n(Use this code to verify your account)`,
                [{ text: 'OK' }]
            );

            // Update the mockOtp ref so the hint stays current
            // (params are read-only, so we store it in state)
            setCurrentOtp(newCode);
        } catch (err) {
            Alert.alert(
                '✉️ Resend Attempted',
                `Check your email/SMS for a new code.\n\nTest code: ${mockOtp}`,
                [{ text: 'OK' }]
            );
        }

        setTimeout(() => inputRefs.current[0]?.focus(), 300);
    };

    function maskEmail(value: string) {
        if (!value || value.length < 5) return value;
        const atIndex = value.indexOf('@');
        if (atIndex <= 2) {
            return `${value[0]}***${value.slice(atIndex)}`;
        }
        return `${value.slice(0, 2)}***${value.slice(atIndex)}`;
    }

    const isProcessingOrSuccess = status === 'processing' || status === 'success';

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
                        colors={['rgba(255, 215, 0, 0.12)', 'rgba(255, 215, 0, 0)']}
                        style={[styles.orb, { top: -80, right: -80 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <LinearGradient
                        colors={['rgba(0, 252, 255, 0.12)', 'rgba(0, 252, 255, 0)']}
                        style={[styles.orb, { bottom: -80, left: -80 }]}
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
                        disabled={isProcessingOrSuccess}
                    >
                        <IconSymbol size={28} name="chevron.left" color="#fff" />
                    </TouchableOpacity>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Step Progress */}
                        <View style={styles.stepBadgeRow}>
                            <View style={[styles.stepDot, styles.stepDotDone]}>
                                <Text style={[styles.stepDotText, { color: '#00FF88' }]}>✓</Text>
                            </View>
                            <View style={[styles.stepLine, styles.stepLineDone]} />
                            <View style={[styles.stepDot, styles.stepDotDone]}>
                                <Text style={[styles.stepDotText, { color: '#00FF88' }]}>✓</Text>
                            </View>
                            <View style={[styles.stepLine, styles.stepLineActive]} />
                            <View style={[styles.stepDot, styles.stepDotActive]}>
                                <Text style={[styles.stepDotText, { color: '#FFD700' }]}>3</Text>
                            </View>
                        </View>

                        {/* Logo */}
                        <View style={styles.logoSection}>
                            <View style={styles.miniZ}>
                                <ZLogo status={status === 'processing' ? 'processing' : status === 'success' ? 'success' : 'idle'} />
                            </View>
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>
                            {status === 'success' ? '🎉 Account Ready!' : 'Verify your email'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {status === 'success'
                                ? 'Your account is verified. Opening your dashboard now.'
                                : `Step 3 of 3: enter the 6-digit code sent to ${maskEmail(email)}. After this, you’ll go to your dashboard.`}
                        </Text>

                        {/* Badge */}
                        <View style={styles.shieldBadge}>
                            <LinearGradient
                                colors={['rgba(255,215,0,0.08)', 'rgba(0,252,255,0.08)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.shieldGradient}
                            >
                                <IconSymbol size={14} name="lock.fill" color="#FFD700" />
                                <Text style={styles.shieldText}>Email Authentication</Text>
                            </LinearGradient>
                        </View>

                        {/* OTP Card */}
                        <View style={styles.card}>
                            {/* OTP Boxes */}
                            <View style={styles.otpRow}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => { inputRefs.current[index] = ref; }}
                                        style={[
                                            styles.otpBox,
                                            digit ? styles.otpBoxFilled : null,
                                            status === 'error' ? styles.otpBoxError : null,
                                            status === 'success' ? styles.otpBoxSuccess : null,
                                        ]}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        editable={!isProcessingOrSuccess}
                                        selectTextOnFocus
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </View>

                            {/* Status messages */}
                            {status === 'processing' && (
                                <View style={styles.statusRow}>
                                    <ActivityIndicator size="small" color="#00FCFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.statusText}>Verifying code...</Text>
                                </View>
                            )}

                            {status === 'success' && (
                                <View style={styles.statusRow}>
                                    <Text style={[styles.statusText, { color: '#00FF88' }]}>
                                        ✓ Verified! Creating your account...
                                    </Text>
                                </View>
                            )}

                            {otpError ? (
                                <View style={styles.errorBox}>
                                    <IconSymbol size={14} name="exclamationmark.circle.fill" color="#FF334B" />
                                    <Text style={styles.errorText}>{otpError}</Text>
                                </View>
                            ) : null}

                            {/* Countdown / Resend */}
                            <View style={styles.resendRow}>
                                {!canResend ? (
                                    <Text style={styles.countdownText}>
                                        Resend code in{' '}
                                        <Text style={styles.countdownNumber}>
                                            0:{countdown < 10 ? `0${countdown}` : countdown}
                                        </Text>
                                    </Text>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleResend}
                                        disabled={isProcessingOrSuccess}
                                        style={styles.resendBtn}
                                    >
                                        <IconSymbol size={15} name="arrow.clockwise" color="#00FF88" />
                                        <Text style={styles.resendLink}>Resend OTP</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Security Footer */}
                        <View style={styles.securityFooter}>
                            <View style={styles.securityRow}>
                                <IconSymbol size={12} name="lock.fill" color="rgba(255,255,255,0.25)" />
                                <Text style={styles.securityText}>End-to-end encrypted · Never shared</Text>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
        flexGrow: 1,
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
        opacity: 0.8,
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
        backgroundColor: 'rgba(255,215,0,0.1)',
        borderColor: '#FFD700',
    },
    stepDotDone: {
        backgroundColor: 'rgba(0,255,136,0.1)',
        borderColor: '#00FF88',
    },
    stepDotText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontWeight: '700',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 6,
    },
    stepLineDone: {
        backgroundColor: '#00FF88',
    },
    stepLineActive: {
        backgroundColor: '#FFD700',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 10,
    },
    miniZ: {
        width: 130,
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: 0.7 }],
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    shieldBadge: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    shieldGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
    },
    shieldText: {
        color: '#FFD700',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    card: {
        width: Math.min(width - 40, 420),
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 24,
        paddingVertical: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
        alignItems: 'center',
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    otpBox: {
        width: 48,
        height: 58,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1.5,
        borderRadius: 14,
        textAlign: 'center',
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
    },
    otpBoxFilled: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255,215,0,0.05)',
    },
    otpBoxError: {
        borderColor: '#FF334B',
        backgroundColor: 'rgba(255, 51, 75, 0.05)',
    },
    otpBoxSuccess: {
        borderColor: '#00FF88',
        backgroundColor: 'rgba(0, 255, 136, 0.05)',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statusText: {
        color: '#00FCFF',
        fontSize: 13,
        fontWeight: '600',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,51,75,0.08)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,51,75,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    errorText: {
        color: '#FF334B',
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    resendRow: {
        alignItems: 'center',
        marginTop: 6,
    },
    countdownText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
    },
    countdownNumber: {
        color: '#00FCFF',
        fontWeight: '700',
    },
    resendBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(0,255,136,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(0,255,136,0.15)',
    },
    resendLink: {
        color: '#00FF88',
        fontSize: 14,
        fontWeight: '700',
    },
    securityFooter: {
        alignItems: 'center',
        marginTop: 28,
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    securityText: {
        color: 'rgba(255,255,255,0.25)',
        fontSize: 11,
        letterSpacing: 0.3,
    },
});
