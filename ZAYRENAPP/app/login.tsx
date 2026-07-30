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
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ZLogo from '@/components/z-logo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { API_URL, getUserProfile } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

declare global {
    var setIsAuthenticatedGlobal: ((val: boolean) => void) | undefined;
}

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'typing' | 'processing' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const handleFocus = (field: 'email' | 'password') => {
        setStatus('typing');
        if (field === 'email') setEmailFocused(true);
        if (field === 'password') setPasswordFocused(true);
    };

    const handleBlur = (field: 'email' | 'password') => {
        if (field === 'email') setEmailFocused(false);
        if (field === 'password') setPasswordFocused(false);

        // If both blurred and fields are empty, return to idle
        setTimeout(() => {
            if (!emailInputRef.current?.isFocused() && !passwordInputRef.current?.isFocused()) {
                setStatus('idle');
            }
        }, 100);
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        setErrorMessage('');

        if (!email || !password) {
            setErrorMessage('Please fill in all the data fields to process.');
            return;
        }

        if (email.length < 3 || password.length < 4) {
            setErrorMessage('Please enter a valid username/password (min. 4 chars).');
            return;
        }

        setStatus('processing');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                setStatus('idle');
                if (error.message.includes('Email not confirmed')) {
                    Alert.alert(
                        '⚠️ Verification Required',
                        'Your account is not verified. Please check your email or click OK to verify.',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    router.push({
                                        pathname: '/verify',
                                        params: { email: email.trim(), phone: '' },
                                    } as any);
                                },
                            },
                        ]
                    );
                } else {
                    setErrorMessage(error.message || 'Login failed. Please try again.');
                }
                return;
            }

            if (data?.user) {
                try {
                    await SecureStore.setItemAsync('zayren_is_authenticated', 'true');
                    await SecureStore.setItemAsync('zayren_user_id', String(data.user.id));
                    const userName = data.user.user_metadata?.name || '';
                    const userUsername = data.user.user_metadata?.username || '';
                    if (userName) await SecureStore.setItemAsync('zayren_user_name', userName);
                    if (userUsername) await SecureStore.setItemAsync('zayren_user_username', userUsername);
                    
                    // Fetch real backend role
                    let userRole = 'user';
                    try {
                        const profile = await getUserProfile(data.user.id);
                        if (profile && profile.role) {
                            userRole = profile.role;
                            await SecureStore.setItemAsync('zayren_user_role', userRole);
                        }
                    } catch (profileError) {
                        console.warn('[Login] Could not fetch profile for role, defaulting to user', profileError);
                    }

                    setStatus('success');
                    
                    setTimeout(() => {
                        if (typeof global.setIsAuthenticatedGlobal === 'function') {
                            global.setIsAuthenticatedGlobal(true);
                        }
                        // Route based on role
                        if (userRole === 'shop_owner') {
                            router.replace('/shop-admin' as any);
                        } else if (userRole === 'delivery_admin') {
                            router.replace('/delivery-admin' as any);
                        } else if (userRole === 'super_admin') {
                            router.replace('/super-admin' as any);
                        } else {
                            router.replace('/(tabs)');
                        }
                    }, 800);
                } catch (storeError) {
                    console.warn('[Login] Could not persist auth state', storeError);
                    setStatus('idle');
                    setErrorMessage('An error occurred while saving your session.');
                }
            }
        } catch (error) {
            setStatus('idle');
            setErrorMessage('Unable to connect to the server. Please check your connection.');
            console.error('[Login Error]', error);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    {/* Step Indicator */}
                    <View style={styles.stepIndicatorContainer}>
                        <View style={styles.stepCircle}>
                            <Text style={styles.stepText}>1</Text>
                        </View>
                        <Text style={styles.stepTitle}>Sign In</Text>
                    </View>

                    {/* Login Card */}
                    <View style={styles.card}>
                        {/* Logo Section */}
                        <View style={styles.logoSection}>
                            <View style={styles.logoRow}>
                                <ZLogo status={status} />
                                <Text style={styles.brandTitle}>ZAYREN</Text>
                            </View>
                            <Text style={styles.welcomeHeading}>Welcome back!</Text>
                            <Text style={styles.welcomeSubheading}>Sign in to your account</Text>
                        </View>

                        {/* Input Box 1 */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>
                                Email or Phone Number
                            </Text>
                            <TextInput
                                ref={emailInputRef}
                                style={[styles.input, emailFocused && styles.inputFocused]}
                                placeholder="Enter your email or phone"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (status === 'idle') setStatus('typing');
                                }}
                                onFocus={() => handleFocus('email')}
                                onBlur={() => handleBlur('email')}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={status !== 'processing' && status !== 'success'}
                            />
                        </View>

                        {/* Input Box 2 */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>
                                Password
                            </Text>
                            <View style={{ position: 'relative' }}>
                                <TextInput
                                    ref={passwordInputRef}
                                    style={[styles.input, styles.passwordFieldInput, passwordFocused && styles.inputFocused]}
                                    placeholder="Enter your password"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (status === 'idle') setStatus('typing');
                                    }}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={() => handleBlur('password')}
                                    secureTextEntry={!showPassword}
                                    editable={status !== 'processing' && status !== 'success'}
                                />
                                <TouchableOpacity
                                    style={styles.eyeBtn}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <IconSymbol
                                        size={20}
                                        name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                </TouchableOpacity>
                            </View>
                            
                            {/* Forgot Password */}
                            <TouchableOpacity
                                style={styles.forgotPasswordRow}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setTimeout(() => router.push('/forgot-password' as any), 100);
                                }}
                                disabled={status === 'processing' || status === 'success'}
                                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {errorMessage ? (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        ) : null}

                        {/* Submit Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleLogin}
                            disabled={status === 'processing' || status === 'success'}
                            style={styles.buttonContainer}
                        >
                            <LinearGradient
                                colors={['#7A28CB', '#9D4EDD']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.button}
                            >
                                {status === 'processing' ? (
                                    <View style={styles.processingBtnContent}>
                                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                                        <Text style={styles.buttonText}>Signing you in...</Text>
                                    </View>
                                ) : status === 'success' ? (
                                    <Text style={styles.buttonText}>Success</Text>
                                ) : (
                                    <Text style={styles.buttonText}>Sign In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerRow}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/register' as any)}
                                disabled={status === 'processing' || status === 'success'}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={styles.registerLink}>Register</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {/* Note: Social login omitted per rules (unconfigured) */}
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>By signing in, you agree to our</Text>
                            <View style={styles.footerLinksRow}>
                                <TouchableOpacity>
                                    <Text style={styles.footerLinkText}>Terms of Service</Text>
                                </TouchableOpacity>
                                <Text style={styles.footerText}> and </Text>
                                <TouchableOpacity>
                                    <Text style={styles.footerLinkText}>Privacy Policy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A14',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        alignSelf: 'center',
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#7A28CB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    stepText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    stepTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    card: {
        width: Math.min(width - 40, 400),
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginLeft: 10,
        letterSpacing: 2,
    },
    welcomeHeading: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    welcomeSubheading: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        color: '#fff',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        height: 52,
        backgroundColor: '#12121A',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        color: '#fff',
        fontSize: 15,
    },
    inputFocused: {
        borderColor: '#7A28CB',
        backgroundColor: '#151520',
    },
    passwordFieldInput: {
        paddingRight: 50,
    },
    eyeBtn: {
        position: 'absolute',
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: 38,
    },
    forgotPasswordRow: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    forgotPasswordText: {
        color: '#9D4EDD',
        fontSize: 13,
        fontWeight: '500',
    },
    errorText: {
        color: '#FF334B',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: '500',
    },
    buttonContainer: {
        marginTop: 10,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 20,
    },
    button: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    registerText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    },
    registerLink: {
        color: '#9D4EDD',
        fontSize: 14,
        fontWeight: '600',
    },
    footerRow: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    footerLinksRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    footerLinkText: {
        fontSize: 12,
        color: '#9D4EDD',
    },
});
