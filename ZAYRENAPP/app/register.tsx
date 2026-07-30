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
    FlatList,
    Modal,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ZLogo from '@/components/z-logo';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width, height } = Dimensions.get('window');

// Data arrays for birth date custom pickers
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 110 }, (_, i) => String(currentYear - i));

export default function RegisterScreen() {
    const router = useRouter();

    // Form Field States
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');

    const [day, setDay] = useState('5');
    const [month, setMonth] = useState('Jul');
    const [year, setYear] = useState('2000');
    const [gender, setGender] = useState<'female' | 'male' | 'custom' | null>(null);
    const [customGenderDetail, setCustomGenderDetail] = useState('');

    // UI States
    const [status, setStatus] = useState<'idle' | 'typing' | 'processing'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Custom Picker States
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerType, setPickerType] = useState<'day' | 'month' | 'year' | null>(null);
    const [pickerData, setPickerData] = useState<string[]>([]);
    const [tempSelectedValue, setTempSelectedValue] = useState('');

    // Refs for inputs
    const firstNameRef = useRef<TextInput>(null);
    const middleNameRef = useRef<TextInput>(null);
    const surnameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const customGenderRef = useRef<TextInput>(null);

    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleFocus = (fieldName: string) => {
        setFocusedField(fieldName);
        setStatus('typing');
    };

    const handleBlur = () => {
        setFocusedField(null);
        setTimeout(() => {
            if (
                !firstNameRef.current?.isFocused() &&
                !middleNameRef.current?.isFocused() &&
                !surnameRef.current?.isFocused() &&
                !emailRef.current?.isFocused() &&
                !customGenderRef.current?.isFocused()
            ) {
                setStatus('idle');
            }
        }, 100);
    };

    const openCustomPicker = (type: 'day' | 'month' | 'year') => {
        Keyboard.dismiss();
        setPickerType(type);
        if (type === 'day') {
            setPickerData(days);
            setTempSelectedValue(day);
        } else if (type === 'month') {
            setPickerData(months);
            setTempSelectedValue(month);
        } else {
            setPickerData(years);
            setTempSelectedValue(year);
        }
        setPickerVisible(true);
    };

    const selectPickerValue = (val: string) => {
        if (pickerType === 'day') setDay(val);
        else if (pickerType === 'month') setMonth(val);
        else if (pickerType === 'year') setYear(val);
        setPickerVisible(false);
        setPickerType(null);
    };

    const handleNext = () => {
        Keyboard.dismiss();
        setErrorMessage('');

        if (!firstName.trim() || !surname.trim()) {
            setErrorMessage('First name and Surname are required.');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        if (!gender) {
            setErrorMessage('Please select a gender.');
            return;
        }

        if (gender === 'custom' && !customGenderDetail.trim()) {
            setErrorMessage('Please enter custom gender details.');
            return;
        }

        setStatus('processing');
        router.push({
            pathname: '/register-password',
            params: {
                email: email.trim(),
                firstName: firstName.trim(),
                middleName: middleName.trim(),
                surname: surname.trim(),
                day,
                month,
                year,
                gender: gender === 'custom' ? customGenderDetail.trim() : gender,
            },
        } as any);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Futuristic Background Gradients */}
                <LinearGradient
                    colors={['#06060c', '#0d0d1e', '#030307']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {/* Ambient Blur Orbs */}
                <View style={styles.blurContainer}>
                    <LinearGradient
                        colors={['rgba(0, 255, 136, 0.2)', 'rgba(0, 255, 136, 0)']}
                        style={[styles.orb, styles.orbEmerald]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <LinearGradient
                        colors={['rgba(160, 32, 240, 0.25)', 'rgba(160, 32, 240, 0)']}
                        style={[styles.orb, styles.orbPurple]}
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
                        onPress={() => router.replace('/login' as any)}
                        disabled={status === 'processing'}
                    >
                        <IconSymbol size={28} name="chevron.left" color="#fff" />
                    </TouchableOpacity>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Step badge */}
                        <View style={styles.stepBadgeRow}>
                            <View style={[styles.stepDot, styles.stepDotActive]}>
                                <Text style={[styles.stepDotText, styles.stepDotTextActive]}>1</Text>
                            </View>
                            <View style={styles.stepLine} />
                            <View style={styles.stepDot}>
                                <Text style={styles.stepDotText}>2</Text>
                            </View>
                            <View style={styles.stepLine} />
                            <View style={styles.stepDot}>
                                <Text style={styles.stepDotText}>3</Text>
                            </View>
                        </View>

                        <View style={styles.headerSection}>
                            <View style={styles.miniZ}>
                                <ZLogo status={status === 'processing' ? 'processing' : 'idle'} />
                            </View>
                            <Text style={styles.headerTitle}>Create a new account</Text>
                            <Text style={styles.headerSubtitle}>It's quick and easy.</Text>
                            <View style={styles.headerLine} />
                        </View>

                        {/* Registration Form Card */}
                        <View style={styles.card}>
                            {/* Grid Row: First and Middle Name */}
                            <View style={styles.row}>
                                <View style={[styles.col, { marginRight: 10 }]}>
                                    <Text style={[styles.inputLabel, focusedField === 'firstName' && styles.inputLabelActive]}>First name</Text>
                                    <TextInput
                                        ref={firstNameRef}
                                        style={[styles.input, focusedField === 'firstName' && styles.inputFocused]}
                                        placeholder="First name"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={firstName}
                                        onChangeText={(text) => { setFirstName(text); setStatus('typing'); }}
                                        onFocus={() => handleFocus('firstName')}
                                        onBlur={handleBlur}
                                        editable={status !== 'processing'}
                                        returnKeyType="next"
                                        onSubmitEditing={() => middleNameRef.current?.focus()}
                                    />
                                    {focusedField === 'firstName' && (
                                        <LinearGradient colors={['#00FF88', '#00FCFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputFocusLine} />
                                    )}
                                </View>

                                <View style={styles.col}>
                                    <Text style={[styles.inputLabel, focusedField === 'middleName' && styles.inputLabelActive]}>Middle name</Text>
                                    <TextInput
                                        ref={middleNameRef}
                                        style={[styles.input, focusedField === 'middleName' && styles.inputFocused]}
                                        placeholder="(optional)"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={middleName}
                                        onChangeText={setMiddleName}
                                        onFocus={() => handleFocus('middleName')}
                                        onBlur={handleBlur}
                                        editable={status !== 'processing'}
                                        returnKeyType="next"
                                        onSubmitEditing={() => surnameRef.current?.focus()}
                                    />
                                </View>
                            </View>

                            {/* Surname Input */}
                            <View style={styles.fullWidthInputLayout}>
                                <Text style={[styles.inputLabel, focusedField === 'surname' && styles.inputLabelActive]}>Surname</Text>
                                <TextInput
                                    ref={surnameRef}
                                    style={[styles.input, focusedField === 'surname' && styles.inputFocused]}
                                    placeholder="Surname"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={surname}
                                    onChangeText={setSurname}
                                    onFocus={() => handleFocus('surname')}
                                    onBlur={handleBlur}
                                    editable={status !== 'processing'}
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                />
                                {focusedField === 'surname' && (
                                    <LinearGradient colors={['#FF007F', '#A020F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputFocusLine} />
                                )}
                            </View>

                            {/* Email Input */}
                            <View style={styles.fullWidthInputLayout}>
                                <Text style={[styles.inputLabel, focusedField === 'email' && styles.inputLabelActive]}>Email address</Text>
                                <TextInput
                                    ref={emailRef}
                                    style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                                    placeholder="example@domain.com"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => handleFocus('email')}
                                    onBlur={handleBlur}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={status !== 'processing'}
                                    returnKeyType="done"
                                />
                                {focusedField === 'email' && (
                                    <LinearGradient colors={['#00FCFF', '#00FF88']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputFocusLine} />
                                )}
                            </View>

                            {/* Date of Birth */}
                            <View style={styles.dobSection}>
                                <Text style={styles.sectionLabel}>Date of birth</Text>
                                <View style={styles.dropdownRow}>
                                    <TouchableOpacity style={styles.dropdown} onPress={() => openCustomPicker('day')} activeOpacity={0.8} disabled={status === 'processing'}>
                                        <Text style={styles.dropdownText}>{day}</Text>
                                        <IconSymbol size={16} name="chevron.down" color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.dropdown, { marginHorizontal: 8 }]} onPress={() => openCustomPicker('month')} activeOpacity={0.8} disabled={status === 'processing'}>
                                        <Text style={styles.dropdownText}>{month}</Text>
                                        <IconSymbol size={16} name="chevron.down" color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.dropdown} onPress={() => openCustomPicker('year')} activeOpacity={0.8} disabled={status === 'processing'}>
                                        <Text style={styles.dropdownText}>{year}</Text>
                                        <IconSymbol size={16} name="chevron.down" color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Gender */}
                            <View style={styles.genderSection}>
                                <Text style={styles.sectionLabel}>Gender</Text>
                                <View style={styles.genderRow}>
                                    {(['female', 'male', 'custom'] as const).map((g, i) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.genderCapsule, i === 1 && { marginHorizontal: 8 }, gender === g && styles.genderCapsuleActive]}
                                            onPress={() => setGender(g)}
                                            activeOpacity={0.8}
                                            disabled={status === 'processing'}
                                        >
                                            <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                                                {g.charAt(0).toUpperCase() + g.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {gender === 'custom' && (
                                <View style={[styles.fullWidthInputLayout, { marginBottom: 16 }]}>
                                    <Text style={[styles.inputLabel, focusedField === 'customGender' && styles.inputLabelActive]}>
                                        Pronoun / Gender details
                                    </Text>
                                    <TextInput
                                        ref={customGenderRef}
                                        style={[styles.input, focusedField === 'customGender' && styles.inputFocused]}
                                        placeholder="e.g. they/them"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={customGenderDetail}
                                        onChangeText={setCustomGenderDetail}
                                        onFocus={() => handleFocus('customGender')}
                                        onBlur={handleBlur}
                                        editable={status !== 'processing'}
                                    />
                                </View>
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
                                    colors={['#00FF88', '#00DF76']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.button}
                                >
                                    {status === 'processing' ? (
                                        <View style={styles.processingBtnContent}>
                                            <ActivityIndicator size="small" color="#000" style={{ marginRight: 10 }} />
                                            <Text style={styles.buttonText}>CHECKING...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.processingBtnContent}>
                                            <Text style={styles.buttonText}>NEXT</Text>
                                            <IconSymbol size={18} name="chevron.right" color="#000" />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.switchLoginLink}
                                onPress={() => router.replace('/login' as any)}
                                disabled={status === 'processing'}
                            >
                                <Text style={styles.switchLoginText}>Already have an account?</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Custom Picker Overlay */}
                <Modal animationType="fade" transparent={true} visible={pickerVisible} onRequestClose={() => setPickerVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => setPickerVisible(false)}>
                        <View style={styles.pickerModalBG}>
                            <View style={styles.pickerModalContent}>
                                <View style={styles.pickerHeader}>
                                    <Text style={styles.pickerHeaderTitle}>Select {pickerType}</Text>
                                    <TouchableOpacity onPress={() => setPickerVisible(false)}>
                                        <Text style={styles.pickerCloseBtn}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={pickerData}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.pickerItem, tempSelectedValue === item && styles.pickerItemActive]}
                                            onPress={() => selectPickerValue(item)}
                                        >
                                            <Text style={[styles.pickerItemText, tempSelectedValue === item && styles.pickerItemTextActive]}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    style={styles.pickerList}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
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
    orbEmerald: {
        top: -90,
        left: -100,
    },
    orbPurple: {
        bottom: -90,
        right: -100,
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
    headerSection: {
        alignItems: 'center',
        marginBottom: 20,
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
        letterSpacing: 0.5,
    },
    headerLine: {
        width: 60,
        height: 3,
        backgroundColor: '#00FF88',
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
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    col: {
        flex: 1,
        position: 'relative',
    },
    fullWidthInputLayout: {
        marginBottom: 16,
        position: 'relative',
    },
    inputLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        marginBottom: 6,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    inputLabelActive: {
        color: '#00FF88',
    },
    input: {
        height: 46,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        color: '#fff',
        fontSize: 14,
    },
    inputFocused: {
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
    passwordWrapper: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 46,
    },
    eyeBtn: {
        position: 'absolute',
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
    },
    matchHint: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: -8,
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    matchGood: {
        color: '#00FF88',
    },
    matchBad: {
        color: '#FF334B',
    },
    sectionLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '600',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    dobSection: {
        marginBottom: 16,
    },
    dropdownRow: {
        flexDirection: 'row',
    },
    dropdown: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        color: '#fff',
        fontSize: 14,
    },
    genderSection: {
        marginBottom: 16,
    },
    genderRow: {
        flexDirection: 'row',
    },
    genderCapsule: {
        flex: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    genderCapsuleActive: {
        backgroundColor: 'rgba(0, 255, 136, 0.08)',
        borderColor: '#00FF88',
    },
    genderText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    genderTextActive: {
        color: '#00FF88',
    },
    errorText: {
        color: '#FF334B',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '500',
    },
    buttonContainer: {
        marginTop: 10,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#00FF88',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    button: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    buttonText: {
        color: '#06060c',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
    switchLoginLink: {
        marginTop: 18,
        alignItems: 'center',
    },
    switchLoginText: {
        color: '#00FF88',
        fontSize: 13,
        fontWeight: '600',
    },
    pickerModalBG: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    pickerModalContent: {
        backgroundColor: '#0d0d1e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingBottom: 40,
        maxHeight: height * 0.45,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    pickerHeaderTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    pickerCloseBtn: {
        color: '#00FF88',
        fontSize: 14,
        fontWeight: '600',
    },
    pickerList: {
        paddingHorizontal: 16,
    },
    pickerItem: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    pickerItemActive: {
        backgroundColor: 'rgba(0,255,136,0.06)',
        borderRadius: 10,
    },
    pickerItemText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
    },
    pickerItemTextActive: {
        color: '#00FF88',
        fontWeight: '700',
    },
});
