import React, { useState, useRef, useEffect } from 'react';
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
import { API_URL } from '@/lib/api';


const { width } = Dimensions.get('window');

export default function ResetPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string; code?: string }>();
    const email = params.email;
    const code = params.code;

    console.log('[ResetPassword] Component mounted with params:', { email, code });
    console.log('[ResetPassword] API_URL from lib/api:', API_URL);
    
    useEffect(() => {
        console.log('[ResetPassword] useEffect - API_URL is:', API_URL);
    }, []);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'typing' | 'processing' | 'success'>('idle');

    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const handleReset = async () => {
        console.log('[Password Reset] Button pressed!');
        Keyboard.dismiss();
        setErrorMessage('');

        console.log('[Password Reset] Starting...', { password, confirmPassword, email, code });

        if (!password) {
            console.log('[Password Reset] Password is empty');
            setErrorMessage('Please enter a password.');
            return;
        }

        if (password.length < 6) {
            console.log('[Password Reset] Password too short:', password.length);
            setErrorMessage('Password must be at least 6 characters.');
            return;
        }

        if (!confirmPassword) {
            console.log('[Password Reset] Confirm password is empty');
            setErrorMessage('Please confirm your password.');
            return;
        }

        if (password !== confirmPassword) {
            console.log('[Password Reset] Passwords do not match', { password, confirmPassword });
            setErrorMessage('Passwords do not match.');
            return;
        }

        console.log('[Password Reset] Validation passed, calling API...');
        console.log('[Password Reset] Current API_URL:', API_URL);
        setStatus('processing');

        try {
            const url = `${API_URL}/api/auth/reset-password?code=${encodeURIComponent(code ?? '')}`;
            const requestBody = {
                email: email?.trim(),
                new_password: password,
            };
            
            console.log('[Password Reset] Full request details:');
            console.log('  URL:', url);
            console.log('  Method: POST');
            console.log('  Headers:', { 'Content-Type': 'application/json' });
            console.log('  Body:', requestBody);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('[Password Reset] Response received');
            console.log('  Status:', response.status);
            console.log('  OK:', response.ok);
            
            const data = await response.json();
            console.log('[Password Reset] Response data:', data);

            if (response.ok) {
                setStatus('success');
                console.log('[Password Reset] Success! Navigating to login...');
                setTimeout(() => {
                    router.replace('/login' as any);
                }, 1500);
            } else {
                setStatus('idle');
                setErrorMessage(data.detail || 'Password reset failed. Check if code is expired.');
                console.log('[Password Reset] Failed:', data.detail);
            }
        } catch (error: any) {
            setStatus('idle');
            const errorMsg = error?.message || error?.toString() || 'Unknown error';
            console.error('[Reset Password API Error] Full error:', error);
            console.error('[Reset Password API Error] Error type:', typeof error);
            console.error('[Reset Password API Error] Message:', errorMsg);
            console.error('[Reset Password API Error] Stack:', error?.stack);
            
            // More specific error messages
            if (errorMsg.includes('Network') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('Cannot connect')) {
                setErrorMessage(`Cannot connect to server at ${API_URL}. Make sure backend is running.`);
            } else if (errorMsg.includes('timeout')) {
                setErrorMessage('Request timed out. Server is slow to respond.');
            } else {
                setErrorMessage(`Connection error: ${errorMsg}`);
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
                        colors={['rgba(0, 255, 136, 0.22)', 'rgba(0, 255, 136, 0)']}
                        style={[styles.orb, { top: -90, left: -100 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <View style={styles.centerContent}>
                        <View style={styles.headerSection}>
                            <View style={styles.miniZ}>
                                <ZLogo status={status} />
                            </View>
                            <Text style={styles.headerTitle}>Create New Password</Text>
                            <Text style={styles.headerSubtitle}>For {email}</Text>
                            <View style={styles.headerLine} />
                        </View>

                        <View style={styles.card}>
                            {/* Password */}
                            <View style={styles.fieldLayout}>
                                <Text style={[styles.inputLabel, focusedField === 'password' && styles.inputLabelActive]}>
                                    New Password
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
                                        editable={status !== 'processing' && status !== 'success'}
                                        returnKeyType="next"
                                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                    />
                                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                                        <IconSymbol size={20} name={showPassword ? 'eye.slash.fill' : 'eye.fill'} color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                </View>
                                {focusedField === 'password' && (
                                    <LinearGradient colors={['#00FF88', '#00FCFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputFocusLine} />
                                )}
                            </View>

                            {/* Strength */}
                            {password.length > 0 && (
                                <View style={styles.strengthRow}>
                                    {[1, 2, 3, 4].map((level) => {
                                        const strength = password.length < 6 ? 1 : password.length < 9 ? 2 : /[!@#$%^&*]/.test(password) ? 4 : 3;
                                        const colors = ['#FF334B', '#FF8C00', '#FFD700', '#00FF88'];
                                        return (
                                            <View key={level} style={[styles.strengthBar, { backgroundColor: level <= strength ? colors[strength - 1] : 'rgba(255,255,255,0.08)' }]} />
                                        );
                                    })}
                                </View>
                            )}

                            {/* Confirm Password */}
                            <View style={[styles.fieldLayout, { marginTop: 6 }]}>
                                <Text style={[styles.inputLabel, focusedField === 'confirm' && styles.inputLabelActive]}>
                                    Confirm Password
                                </Text>
                                <View style={styles.passwordWrapper}>
                                    <TextInput
                                        ref={confirmPasswordRef}
                                        style={[styles.input, styles.passwordInput, focusedField === 'confirm' && styles.inputFocused]}
                                        placeholder="Re-enter new password"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={confirmPassword}
                                        onChangeText={(t) => { setConfirmPassword(t); setErrorMessage(''); }}
                                        onFocus={() => setFocusedField('confirm')}
                                        onBlur={() => setFocusedField(null)}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        editable={status !== 'processing' && status !== 'success'}
                                        returnKeyType="done"
                                        onSubmitEditing={handleReset}
                                    />
                                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <IconSymbol size={20} name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'} color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                </View>
                                {focusedField === 'confirm' && (
                                    <LinearGradient colors={['#00FCFF', '#00FF88']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputFocusLine} />
                                )}
                            </View>

                            {/* Match */}
                            {confirmPassword.length > 0 && (
                                <Text style={[styles.matchHint, password === confirmPassword ? styles.matchGood : styles.matchBad]}>
                                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </Text>
                            )}

                            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                            {/* Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleReset}
                                disabled={status === 'processing' || status === 'success'}
                                style={styles.buttonContainer}
                            >
                                <LinearGradient
                                    colors={['#00FF88', '#00FCFF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.button}
                                >
                                    {status === 'processing' ? (
                                        <View style={styles.btnContent}>
                                            <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
                                            <Text style={styles.buttonText}>UPDATING...</Text>
                                        </View>
                                    ) : status === 'success' ? (
                                        <View style={styles.btnContent}>
                                            <IconSymbol size={18} name="checkmark" color="#000" />
                                            <Text style={styles.buttonText}>PASSWORD RESET!</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.btnContent}>
                                            <Text style={styles.buttonText}>RESET PASSWORD</Text>
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
    centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    blurContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    orb: { position: 'absolute', borderRadius: 200, width: 350, height: 350, opacity: 0.7 },
    headerSection: { alignItems: 'center', marginBottom: 20, marginTop: -40 },
    miniZ: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', transform: [{ scale: 0.75 }] },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    headerLine: { width: 60, height: 3, backgroundColor: '#00FF88', borderRadius: 1.5, marginTop: 12 },
    card: { width: Math.min(width - 40, 420), backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 28, paddingVertical: 26, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
    fieldLayout: { marginBottom: 16, position: 'relative' },
    inputLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: '600', letterSpacing: 0.5 },
    inputLabelActive: { color: '#00FF88' },
    input: { height: 46, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, color: '#fff', fontSize: 14 },
    inputFocused: { borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.05)' },
    inputFocusLine: { position: 'absolute', bottom: 0, left: 12, right: 12, height: 1.5 },
    passwordWrapper: { position: 'relative' },
    passwordInput: { paddingRight: 46 },
    eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', width: 36 },
    strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, marginTop: -8 },
    strengthBar: { flex: 1, height: 3, borderRadius: 2 },
    matchHint: { fontSize: 12, fontWeight: '600', marginTop: -8, marginBottom: 14, letterSpacing: 0.3 },
    matchGood: { color: '#00FF88' },
    matchBad: { color: '#FF334B' },
    errorText: { color: '#FF334B', fontSize: 13, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
    buttonContainer: { marginTop: 10, borderRadius: 14, overflow: 'hidden', shadowColor: '#00FF88', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
    button: { height: 50, justifyContent: 'center', alignItems: 'center' },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    buttonText: { color: '#06060c', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
});
