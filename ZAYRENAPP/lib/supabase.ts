import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js'

// Use AsyncStorage adapter to tell Supabase how to persist auth tokens securely
const AsyncStorageAdapter = {
    getItem: (key: string) => {
        return AsyncStorage.getItem(key)
    },
    setItem: (key: string, value: string) => {
        AsyncStorage.setItem(key, value)
    },
    removeItem: (key: string) => {
        AsyncStorage.removeItem(key)
    },
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are not provided. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorageAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})
