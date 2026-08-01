import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.REACT_APP_API_URL;
  console.log('[API] Checking EXPO_PUBLIC_API_URL:', envUrl);
  if (envUrl) {
    console.log('[API] Using environment URL:', envUrl);
    return envUrl;
  }

  if (!__DEV__) {
    console.log('[API] Production environment detected, falling back to https://api.zayrenapp.com');
    return 'https://api.zayrenapp.com';
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  console.log('[API] hostUri from Constants (expoConfig or manifest.debuggerHost):', hostUri);
  const isAndroidEmulator = Platform.OS === 'android' && !Constants.isDevice;

  if (isAndroidEmulator) {
    console.log('[API] Detected Android emulator, using 10.0.2.2');
    return 'http://10.0.2.2:8000';
  }

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    const cleanIp = ip.replace(/^.*\//, '');
    if (cleanIp && cleanIp !== 'localhost' && cleanIp !== '127.0.0.1') {
      console.log('[API] Using hostUri IP:', cleanIp);
      return `http://${cleanIp}:8000`;
    }
  }

  console.log('[API] Falling back to localhost');
  return 'http://localhost:8000';
};

export const API_URL = getBaseUrl();
console.log('[Zayren API] Resolved API_URL:', API_URL);

// --- API Calls ---

export const registerUserProfile = async (userData: { id: string, email: string, name: string, username: string }) => {
  console.log('[API] registerUserProfile called with:', userData);
  console.log('[API] Using API_URL:', API_URL);
  
  const url = `${API_URL}/api/auth/register`;
  console.log('[API] Full URL:', url);
  console.log('[API] Request body:', JSON.stringify(userData));
  
  try {
    // Use AbortController for a clearer timeout and better cancellation
    const controller = new AbortController();
    const timeoutMs = 5000; // 5 seconds
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    console.log('[API] registerUserProfile: starting fetch with timeout (ms):', timeoutMs);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      signal: controller.signal,
    }) as Response;

    clearTimeout(timeoutId);

    console.log('[API] registerUserProfile response status:', res.status, res.ok);

    if (!res.ok) {
      const error = await res.json();
      console.error('[API] registerUserProfile error response:', error);
      throw new Error(error.detail || `HTTP ${res.status}: ${JSON.stringify(error)}`);
    }

    const data = await res.json();
    console.log('[API] registerUserProfile success:', data);
    return data;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.error('[API] registerUserProfile aborted due to timeout');
      throw new Error('Request timeout after 45 seconds');
    }
    console.error('[API] registerUserProfile error caught');
    console.error('[API] Error type:', error?.constructor?.name);
    console.error('[API] Error name:', error?.name);
    console.error('[API] Error message:', error?.message);
    console.error('[API] Full error:', error);

    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  const res = await fetch(`${API_URL}/api/auth/profile/${userId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to fetch user profile');
  }
  return res.json();
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const res = await fetch(`${API_URL}/api/auth/profile/update?user_id=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to update profile');
  }
  return res.json();
};

export const uploadProfilePicture = async (userId: string, fileUri: string, mimeType: string, fileName: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: mimeType,
    name: fileName,
  } as any);

  const res = await fetch(`${API_URL}/api/auth/profile/upload-picture?user_id=${userId}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to upload picture');
  }
  return res.json();
};

export const toggleFollowUser = async (followerId: string, followingId: string, action: 'follow' | 'unfollow') => {
  const method = action === 'follow' ? 'POST' : 'DELETE';
  const res = await fetch(`${API_URL}/api/auth/follow/${followingId}?follower_id=${followerId}`, {
    method,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || `Failed to ${action} user`);
  }
  return res.json();
};
