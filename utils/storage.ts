import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import type { SavedDocument } from '../app/types';

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
    // Store the prefix exactly as provided (case-sensitive, can be empty)
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
    // Return empty string if null/undefined, don't default to 'scan'
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

// SavedDocument helpers
export const getSavedDocuments = async () => {
  try {
    const saved = await AsyncStorage.getItem('SAVED_PDFS');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error getting saved documents:', error);
    return [];
  }
};

export const saveDocument = async (doc: SavedDocument) => {
  try {
    const saved = await AsyncStorage.getItem('SAVED_PDFS');
    let docs = saved ? JSON.parse(saved) : [];
    docs.push(doc);
    await AsyncStorage.setItem('SAVED_PDFS', JSON.stringify(docs));
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

export const deleteDocument = async (pdfPath: string) => {
  try {
    const saved = await AsyncStorage.getItem('SAVED_PDFS');
    let docs = saved ? JSON.parse(saved) : [];
    docs = docs.filter((doc: SavedDocument) => doc.pdfPath !== pdfPath);
    await AsyncStorage.setItem('SAVED_PDFS', JSON.stringify(docs));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Update document name (for rename functionality)
export const updateDocumentName = async (pdfPath: string, newName: string) => {
  try {
    const saved = await AsyncStorage.getItem('SAVED_PDFS');
    let docs = saved ? JSON.parse(saved) : [];
    
    // Find and update the document
    docs = docs.map((doc: SavedDocument) => {
      if (doc.pdfPath === pdfPath) {
        return { ...doc, name: newName };
      }
      return doc;
    });
    
    await AsyncStorage.setItem('SAVED_PDFS', JSON.stringify(docs));
    return true;
  } catch (error) {
    console.error('Error updating document name:', error);
    throw error;
  }
};