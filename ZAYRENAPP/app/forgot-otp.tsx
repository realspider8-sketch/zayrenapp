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

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;
const MOCK_OTP = '123456';

export default function ForgotOtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string }>();
    const email = params.email ?? 'forgot@example.com';

    const [status, setStatus] = useState<'idle' | 'typing' | 'processing' | 'success' | 'error'>('idle');
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(59);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        setTimeout(() => {
            Alert.alert(
                '📧 Email Sent',
                `A 6-digit reset code was sent to:\n${maskEmail(email)}\n\n🔑 Test Code: ${MOCK_OTP}`,
                [{ text: 'OK' }]
            );
        }, 500);
    }, []);

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

            if (digit && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }

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

    const verifyOtp = (code: string) => {
        console.log('[Verify OTP] Verifying code:', code, 'for email:', email);
        Keyboard.dismiss();
        setStatus('processing');

        // Since we verify the OTP along with the password reset on the backend,
        // we pass the code directly to the next screen.
        setTimeout(() => {
            console.log('[Verify OTP] OTP accepted, navigating to reset-password');
            setStatus('success');
            setTimeout(() => {
                console.log('[Verify OTP] Navigating with params:', { email, code });
                router.replace({
                    pathname: '/reset-password',
                    params: { email, code }
                } as any);
            }, 1000);
        }, 800);
    };

    const handleResend = () => {
        setOtp(Array(OTP_LENGTH).fill(''));
        setOtpError('');
        setStatus('idle');
        setCountdown(59);
        setCanResend(false);

        Alert.alert(
            '📧 New Code Sent',
            `A new reset code has been sent to:\n${maskEmail(email)}\n\n🔑 Test Code: ${MOCK_OTP}`,
            [{ text: 'OK' }]
        );

        setTimeout(() => inputRefs.current[0]?.focus(), 300);
    };

    function maskEmail(e: string) {
        const [user, domain] = e.split('@');
        if (!domain) return e;
        const masked = user.slice(0, 2) + '***';
        return `${masked}@${domain}`;
    }

    const isProcessingOrSuccess = status === 'processing' || status === 'success';

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
                        colors={['rgba(255, 0, 127, 0.12)', 'rgba(255, 0, 127, 0)']}
                        style={[styles.orb, { top: -80, right: -80 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isProcessingOrSuccess}>
                        <IconSymbol size={28} name="chevron.left" color="#fff" />
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View style={styles.logoSection}>
                            <View style={styles.miniZ}>
                                <ZLogo status={status === 'processing' ? 'processing' : status === 'success' ? 'success' : 'idle'} />
                            </View>
                        </View>

                        <Text style={styles.title}>
                            {status === 'success' ? '✓ Verified!' : 'Enter Reset Code'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {status === 'success'
                                ? 'Proceeding to reset password...'
                                : `Enter the 6-digit code sent to ${maskEmail(email)}`}
                        </Text>

                        <View style={styles.shieldBadge}>
                            <LinearGradient colors={['rgba(255,0,127,0.08)', 'rgba(0,252,255,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shieldGradient}>
                                <IconSymbol size={14} name="envelope.fill" color="#FF007F" />
                                <Text style={styles.shieldText}>Email Verification</Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.card}>
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
                                    />
                                ))}
                            </View>

                            {status === 'processing' && (
                                <View style={styles.statusRow}>
                                    <ActivityIndicator size="small" color="#00FCFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.statusText}>Verifying code...</Text>
                                </View>
                            )}

                            {status === 'success' && (
                                <View style={styles.statusRow}>
                                    <Text style={[styles.statusText, { color: '#00FF88' }]}>Moving to secure reset...</Text>
                                </View>
                            )}

                            {otpError ? (
                                <View style={styles.errorBox}>
                                    <IconSymbol size={14} name="exclamationmark.circle.fill" color="#FF334B" />
                                    <Text style={styles.errorText}>{otpError}</Text>
                                </View>
                            ) : null}

                            <View style={styles.resendRow}>
                                {!canResend ? (
                                    <Text style={styles.countdownText}>
                                        Resend code in <Text style={styles.countdownNumber}>0:{countdown < 10 ? `0${countdown}` : countdown}</Text>
                                    </Text>
                                ) : (
                                    <TouchableOpacity onPress={handleResend} disabled={isProcessingOrSuccess} style={styles.resendBtn}>
                                        <IconSymbol size={15} name="arrow.clockwise" color="#FF007F" />
                                        <Text style={styles.resendLink}>Resend Code</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#06060c' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 90, paddingBottom: 40 },
    blurContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    orb: { position: 'absolute', borderRadius: 200, width: 350, height: 350, opacity: 0.8 },
    backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 10 },
    logoSection: { alignItems: 'center', marginBottom: 10 },
    miniZ: { width: 130, height: 130, justifyContent: 'center', alignItems: 'center', transform: [{ scale: 0.7 }] },
    title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: 0.5 },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8, marginBottom: 20, paddingHorizontal: 10 },
    shieldBadge: { marginBottom: 20, borderRadius: 20, overflow: 'hidden' },
    shieldGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,0,127,0.2)' },
    shieldText: { color: '#FF007F', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    card: { width: Math.min(width - 40, 420), backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', paddingHorizontal: 24, paddingVertical: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8, alignItems: 'center' },
    otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
    otpBox: { width: 48, height: 58, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.12)', borderWidth: 1.5, borderRadius: 14, textAlign: 'center', color: '#fff', fontSize: 24, fontWeight: '700' },
    otpBoxFilled: { borderColor: '#FF007F', backgroundColor: 'rgba(255,0,127,0.05)' },
    otpBoxError: { borderColor: '#FF334B', backgroundColor: 'rgba(255, 51, 75, 0.05)' },
    otpBoxSuccess: { borderColor: '#00FF88', backgroundColor: 'rgba(0, 255, 136, 0.05)' },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statusText: { color: '#00FCFF', fontSize: 13, fontWeight: '600' },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,51,75,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,51,75,0.2)', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
    errorText: { color: '#FF334B', fontSize: 13, fontWeight: '500', flex: 1 },
    resendRow: { alignItems: 'center', marginTop: 6 },
    countdownText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
    countdownNumber: { color: '#00FCFF', fontWeight: '700' },
    resendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(255,0,127,0.06)', borderWidth: 1, borderColor: 'rgba(255,0,127,0.15)' },
    resendLink: { color: '#FF007F', fontSize: 14, fontWeight: '700' },
});
