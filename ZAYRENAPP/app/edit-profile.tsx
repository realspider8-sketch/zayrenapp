import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      let id = await SecureStore.getItemAsync('zayren_user_id');
      const { data: { user } } = await supabase.auth.getUser();
      if (!id && user?.id) {
          id = user.id;
          await SecureStore.setItemAsync('zayren_user_id', id);
      }
      if (!id) throw new Error('Not logged in');
      setUserId(id);

      let profile: any = {};
      try {
          profile = await getUserProfile(id);
      } catch (e) {
          console.warn('Backend profile fetch failed, using Supabase data');
      }

      setName(profile.name || user?.user_metadata?.name || '');
      setUsername(profile.username || user?.user_metadata?.username || '');
      setBio(profile.bio || user?.user_metadata?.bio || '');
      setLocation(profile.location || user?.user_metadata?.location || '');
      setProfilePic(profile.profile_pic || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission needed', 'You need to allow access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      setIsSaving(true);
      setError('');

      if (newImageUri) {
        try {
          const fileExt = newImageUri.split('.').pop() || 'jpg';
          const fileName = `${userId}-avatar.${fileExt}`;
          const mimeType = `image/${fileExt}`;
          await uploadProfilePicture(userId, newImageUri, mimeType, fileName);
        } catch(e) {
          console.warn('Image upload failed', e);
        }
      }

      try {
        await updateUserProfile(userId, {
          name,
          username,
          bio,
          location,
        });
      } catch (e) {
        console.warn('Backend profile update failed', e);
      }

      await supabase.auth.updateUser({
          data: { name, username, bio, location }
      });

      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  const displayImageUri = newImageUri || profilePic;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <LinearGradient colors={['#0D0B1A', '#130E26', '#0D0B1A']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} disabled={isSaving}>
          <Text style={styles.headerBtnTextCancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#A78BFA" />
          ) : (
            <Text style={styles.headerBtnTextDone}>Done</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} disabled={isSaving} style={{ alignItems: 'center' }}>
            {displayImageUri ? (
              <Image source={{ uri: displayImageUri }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.avatar}>
                <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'Z'}</Text>
              </LinearGradient>
            )}
            <Text style={styles.changePhotoText}>Edit picture or avatar</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Form Fields */}
        <View style={styles.formGroup}>
          
          <View style={styles.inputRow}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#6B7280"
              editable={!isSaving}
            />
          </View>
          <View style={styles.separator} />

          <View style={styles.inputRow}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              editable={!isSaving}
            />
          </View>
          <View style={styles.separator} />

          <View style={[styles.inputRow, { alignItems: 'flex-start', paddingVertical: 12 }]}>
            <Text style={[styles.label, { marginTop: 4 }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              placeholderTextColor="#6B7280"
              multiline
              editable={!isSaving}
            />
          </View>
          <View style={styles.separator} />

          <View style={styles.inputRow}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
              placeholderTextColor="#6B7280"
              editable={!isSaving}
            />
          </View>
          
        </View>

        <View style={styles.additionalSettings}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Personal information settings</Text>
            <Feather name="chevron-right" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerBtn: {
    paddingVertical: 8,
    minWidth: 60,
  },
  headerBtnTextCancel: { color: '#F3F4F6', fontSize: 16 },
  headerBtnTextDone: { color: '#A78BFA', fontSize: 16, fontWeight: '700', textAlign: 'right' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  avatar: {
    width: 86, height: 86,
    borderRadius: 43,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  changePhotoText: { color: '#A78BFA', fontSize: 14, fontWeight: '600', marginTop: 16 },
  errorText: { color: '#EF4444', textAlign: 'center', marginBottom: 20, fontSize: 14, paddingHorizontal: 20 },
  
  formGroup: { 
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 50,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 100, // Aligns with the input text start
  },
  label: { 
    width: 100,
    color: '#F3F4F6', 
    fontSize: 15, 
  },
  input: {
    flex: 1,
    color: '#fff', 
    fontSize: 15,
  },
  textArea: { 
    height: 60, 
    textAlignVertical: 'top' 
  },
  additionalSettings: {
    marginTop: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingText: {
    color: '#A78BFA',
    fontSize: 15,
  }
});
