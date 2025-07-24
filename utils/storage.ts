import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Storage keys
const STORAGE_KEYS = {
  USER_EMAIL: 'user_email',
  IS_LOGGED_IN: 'is_logged_in',
  DEFAULT_FILE_PREFIX: 'default_file_prefix',
  SAVE_ORIGINALS_TO_PHOTOS: 'save_originals_to_photos',
};

// User session management
export const storeUserSession = async (email: string) => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.USER_EMAIL, email],
      [STORAGE_KEYS.IS_LOGGED_IN, 'true'],
    ]);
    console.log('User session saved successfully');
  } catch (error) {
    console.error('Error saving user session:', error);
    throw error;
  }
};

export const getUserSession = async () => {
  try {
    const [email, isLoggedIn] = await AsyncStorage.multiGet([
      STORAGE_KEYS.USER_EMAIL,
      STORAGE_KEYS.IS_LOGGED_IN,
    ]);

    return {
      email: email[1],
      isLoggedIn: isLoggedIn[1] === 'true',
    };
  } catch (error) {
    console.error('Error getting user session:', error);
    return {
      email: null,
      isLoggedIn: false,
    };
  }
};

export const clearUserSession = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_EMAIL,
      STORAGE_KEYS.IS_LOGGED_IN,
    ]);
    console.log('User session cleared successfully');
  } catch (error) {
    console.error('Error clearing user session:', error);
    throw error;
  }
};

export const checkLoginStatus = async (): Promise<boolean> => {
  try {
    const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return isLoggedIn === 'true';
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Set default file name prefix
export const setDefaultFilePrefix = async (prefix: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_FILE_PREFIX, prefix);
  } catch (error) {
    console.error('Error saving default file prefix:', error);
    throw error;
  }
};

// Get default file name prefix
export const getDefaultFilePrefix = async (): Promise<string> => {
  try {
    const prefix = await AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_FILE_PREFIX);
    return prefix || '';
  } catch (error) {
    console.error('Error getting default file prefix:', error);
    return '';
  }
};

// Set save originals to photos setting
export const setSaveOriginalsToPhotos = async (value: boolean) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVE_ORIGINALS_TO_PHOTOS, value ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving saveOriginalsToPhotos:', error);
    throw error;
  }
};

// Get save originals to photos setting
export const getSaveOriginalsToPhotos = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.SAVE_ORIGINALS_TO_PHOTOS);
    return value === 'true';
  } catch (error) {
    console.error('Error getting saveOriginalsToPhotos:', error);
    return false;
  }
};