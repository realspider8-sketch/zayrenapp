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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ZLogo from '@/components/z-logo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { API_URL, registerUserProfile } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

declare global {
    var setIsAuthenticatedGlobal: ((val: boolean) => void) | undefined;
}

export default function RegisterPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        email?: string;
        firstName?: string;
        middleName?: string;
        surname?: string;
        username?: string;
        bio?: string;
        day?: string;
        month?: string;
        year?: string;
        gender?: string;
    }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'typing' | 'processing'>('idle');

    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const handleNext = async () => {
        console.log('[Register Password] Button pressed!');
        Keyboard.dismiss();
        setErrorMessage('');

        console.log('[Register Password] Validation starting...', { passwordLength: password.length, confirmPasswordLength: confirmPassword.length });

        if (!password || password.length < 6) {
            setErrorMessage('Password must be at least 6 characters.');
            console.log('[Register Password] Password validation failed');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            console.log('[Register Password] Passwords do not match');
            return;
        }

        console.log('[Register Password] Validation passed, processing signup...');
        setStatus('processing');

        const emailValue = params.email?.trim() ?? '';
        const dobString = params.year && params.month && params.day
            ? `${params.year}-${params.month}-${params.day}`
            : '';

        // Helper to navigate to verify screen
        const goToVerify = (email: string) => {
            router.replace({
                pathname: '/verify',
                params: { email, autoVerify: 'false' },
            });
        };

        try {
            // 1. Sign up with Supabase Auth
            console.log('[Register Password] Signing up with Supabase...');
            const name = `${params.firstName || ''} ${params.surname || ''}`.trim();
            const username = params.username?.trim() || emailValue.split('@')[0];

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: emailValue,
                password: password,
                options: {
                    data: {
                        name: name,
                        username: username,
                    }
                }
            });

            console.log('[Register Password] Supabase response:', { authError, userId: authData?.user?.id });

            if (authError) {
                setStatus('idle');
                console.error('[Register Password] Supabase auth error:', authError.message);
                setErrorMessage(authError.message);
                return;
            }

            if (authData.user) {
                // 2. Create profile in our FastAPI database
                const name = `${params.firstName || ''} ${params.surname || ''}`.trim();
                const username = params.username?.trim() || emailValue.split('@')[0];
                
                console.log('[Register Password] Creating profile on backend...', { userId: authData.user.id, name, username });
                
                try {
                    const profileRes = await registerUserProfile({
                        id: authData.user.id,
                        email: emailValue,  // Added: pass email to backend
                        name: name,
                        username: username,
                    });
                    console.log('[Register Password] Profile created successfully:', profileRes);
                } catch (apiError: any) {
                    console.log('[Register Password] Backend offline. Supabase auth succeeded, proceeding with fallback.', apiError?.message || '');
                }

                // INSTEAD: Directly log in
                try {
                    await SecureStore.setItemAsync('zayren_is_authenticated', 'true');
                    await SecureStore.setItemAsync('zayren_user_id', String(authData.user.id));
                    await SecureStore.setItemAsync('zayren_user_name', name);
                    await SecureStore.setItemAsync('zayren_user_username', username);
                } catch (storeError) {
                    console.warn('[Register] Could not persist auth state', storeError);
                }
                setTimeout(() => {
                    if (typeof global.setIsAuthenticatedGlobal === 'function') {
                        global.setIsAuthenticatedGlobal(true);
                    }
                    router.replace('/(tabs)');
                }, 500);
            } else {
                setStatus('idle');
                console.error('[Register Password] No user returned from Supabase');
                setErrorMessage('Registration failed. Please try again.');
            }

        } catch (error: any) {
            setStatus('idle');
            console.error('[Register Password] Outer catch block error:', error);
            setErrorMessage('Something went wrong. Please check your network connection.');
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
                        colors={['rgba(160, 32, 240, 0.22)', 'rgba(160, 32, 240, 0)']}
                        style={[styles.orb, { top: -90, left: -100 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <LinearGradient
                        colors={['rgba(0, 255, 136, 0.18)', 'rgba(0, 255, 136, 0)']}
                        style={[styles.orb, { bottom: -90, right: -100 }]}
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

                    <View style={styles.centerContent}>
                        {/* Step Indicator */}
                        <View style={styles.stepBadgeRow}>
                            <View style={[styles.stepDot, styles.stepDotDone]}>
                                <Text style={[styles.stepDotText, { color: '#00FF88' }]}>✓</Text>
                            </View>
                            <View style={[styles.stepLine, styles.stepLineDone]} />
                            <View style={[styles.stepDot, styles.stepDotActive]}>
                                <Text style={[styles.stepDotText, { color: '#A020F0' }]}>2</Text>
                            </View>
                            <View style={styles.stepLine} />
                            <View style={styles.stepDot}>
                                <Text style={styles.stepDotText}>3</Text>
                            </View>
                        </View>

                        {/* Logo & Header */}
                        <View style={styles.headerSection}>
                            <View style={styles.miniZ}>
                                <ZLogo status={status === 'processing' ? 'processing' : 'idle'} />
                            </View>
                            <Text style={styles.headerTitle}>Create a password</Text>
                            <Text style={styles.headerSubtitle}>Step 2 of 3: choose a password to secure your account.</Text>
                            <Text style={styles.helperText}>After this, we’ll verify your email and send you to your dashboard.</Text>
                            <View style={styles.headerLine} />
                        </View>

                        {/* Card */}
                        <View style={styles.card}>
                            {/* Password */}
                            <View style={styles.fieldLayout}>
                                <Text style={[styles.inputLabel, focusedField === 'password' && styles.inputLabelActive]}>
                                    Password
                                </Text>
                                <View style={styles.passwordWrapper}>
                                    <TextInput
                                        ref={passwordRef}
                                        style={[styles.input, styles.passwordInput, focusedField === 'password' && styles.inputFocused]}
                                        placeholder="Min. 6 characters"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={password}
                                        onChangeText={(t) => { setPassword(t); setStatus('typing'); setErrorMessage(''); }}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        editable={status !== 'processing'}
                                        returnKeyType="next"
                                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                    />
                                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                                        <IconSymbol size={20} name={showPassword ? 'eye.slash.fill' : 'eye.fill'} color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                </View>
                                {focusedField === 'password' && (
                                    <LinearGradient colors={['#A020F0', '#00FCFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputFocusLine} />
                                )}
                            </View>

                            {/* Strength hint */}
                            {password.length > 0 && (
                                <View style={styles.strengthRow}>
                                    {[1, 2, 3, 4].map((level) => {
                                        const strength = password.length < 6 ? 1 : password.length < 9 ? 2 : /[!@#$%^&*]/.test(password) ? 4 : 3;
                                        const colors = ['#FF334B', '#FF8C00', '#FFD700', '#00FF88'];
                                        return (
                                            <View
                                                key={level}
                                                style={[styles.strengthBar, { backgroundColor: level <= strength ? colors[strength - 1] : 'rgba(255,255,255,0.08)' }]}
                                            />
                                        );
                                    })}
                                    <Text style={styles.strengthLabel}>
                                        {password.length < 6 ? 'Weak' : password.length < 9 ? 'Fair' : /[!@#$%^&*]/.test(password) ? 'Strong' : 'Good'}
                                    </Text>
                                </View>
                            )}

                            {/* Confirm Password */}
                            <View style={[styles.fieldLayout, { marginTop: 6 }]}>
                                <Text style={[styles.inputLabel, focusedField === 'confirm' && styles.inputLabelActive]}>
                                    Confirm password
                                </Text>
                                <View style={styles.passwordWrapper}>
                                    <TextInput
                                        ref={confirmPasswordRef}
                                        style={[styles.input, styles.passwordInput, focusedField === 'confirm' && styles.inputFocused]}
                                        placeholder="Re-enter password"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={confirmPassword}
                                        onChangeText={(t) => { setConfirmPassword(t); setErrorMessage(''); }}
                                        onFocus={() => setFocusedField('confirm')}
                                        onBlur={() => setFocusedField(null)}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        editable={status !== 'processing'}
                                        returnKeyType="done"
                                        onSubmitEditing={handleNext}
                                    />
                                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <IconSymbol size={20} name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'} color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                </View>
                                {focusedField === 'confirm' && (
                                    <LinearGradient colors={['#00FF88', '#A020F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputFocusLine} />
                                )}
                            </View>

                            {/* Match indicator */}
                            {confirmPassword.length > 0 && (
                                <Text style={[styles.matchHint, password === confirmPassword ? styles.matchGood : styles.matchBad]}>
                                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </Text>
                            )}

                            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                            {/* Next Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleNext}
                                disabled={status === 'processing'}
                                style={styles.buttonContainer}
                            >
                                <LinearGradient
                                    colors={['#A020F0', '#00FCFF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.button}
                                >
                                    {status === 'processing' ? (
                                        <View style={styles.btnContent}>
                                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={styles.buttonText}>CHECKING...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.btnContent}>
                                            <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                                            <IconSymbol size={18} name="chevron.right" color="#fff" />
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
    stepBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    stepDot: {
        width: 30, height: 30, borderRadius: 15,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    stepDotActive: { backgroundColor: 'rgba(160,32,240,0.12)', borderColor: '#A020F0' },
    stepDotDone: { backgroundColor: 'rgba(0,255,136,0.12)', borderColor: '#00FF88' },
    stepDotText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '700' },
    stepLine: { width: 30, height: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 5 },
    stepLineDone: { backgroundColor: '#00FF88' },
    headerSection: { alignItems: 'center', marginBottom: 20 },
    miniZ: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', transform: [{ scale: 0.75 }] },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    helperText: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 8, textAlign: 'center', lineHeight: 18 },
    headerLine: { width: 60, height: 3, backgroundColor: '#A020F0', borderRadius: 1.5, marginTop: 12 },
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
    inputLabelActive: { color: '#A020F0' },
    input: {
        height: 46, backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        borderRadius: 12, paddingHorizontal: 14, color: '#fff', fontSize: 14,
    },
    inputFocused: { borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.05)' },
    inputFocusLine: { position: 'absolute', bottom: 0, left: 12, right: 12, height: 1.5 },
    passwordWrapper: { position: 'relative' },
    passwordInput: { paddingRight: 46 },
    eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', width: 36 },
    strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, marginTop: -8 },
    strengthBar: { flex: 1, height: 3, borderRadius: 2 },
    strengthLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', marginLeft: 6, width: 44 },
    matchHint: { fontSize: 12, fontWeight: '600', marginTop: -8, marginBottom: 14, letterSpacing: 0.3 },
    matchGood: { color: '#00FF88' },
    matchBad: { color: '#FF334B' },
    errorText: { color: '#FF334B', fontSize: 13, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
    buttonContainer: {
        marginTop: 10, borderRadius: 14, overflow: 'hidden',
        shadowColor: '#A020F0', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
    },
    button: { height: 50, justifyContent: 'center', alignItems: 'center' },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    buttonText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
});
