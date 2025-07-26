// utils/fileNaming.ts
import { getDefaultFilePrefix } from './storage';

/**
 * Generates a file name based on current prefix settings
 * @param customName - Optional custom name (used when user renames)
 * @returns Object with baseName (without extension) and full names with extensions
 */
export const generateFileName = async (customName?: string) => {
  // If custom name is provided (e.g., from rename), use it as-is
  if (customName && customName.trim() !== '') {
    const baseName = customName.trim();
    return {
      baseName,
      imageName: `${baseName}.jpg`,
      pdfName: `${baseName}.pdf`
    };
  }

  // Get current prefix from settings
  const prefix = await getDefaultFilePrefix();
  const uniqueNumber = Date.now().toString();

  let baseName: string;
  
  // Apply naming rules
  if (prefix && prefix.trim() !== '') {
    // User has specified a prefix - use it exactly as specified (case-sensitive)
    baseName = `${prefix.trim()}_${uniqueNumber}`;
  } else {
    // No prefix specified - use just the number
    baseName = uniqueNumber;
  }

  return {
    baseName,
    imageName: `${baseName}.jpg`,
    pdfName: `${baseName}.pdf`
  };
};

/**
 * Generates display name for EditPhotoScreen (no extension)
 * @returns Display name based on current prefix
 */
export const generateDisplayName = async (): Promise<string> => {
  const prefix = await getDefaultFilePrefix();
  const uniqueNumber = Date.now().toString();

  if (prefix && prefix.trim() !== '') {
    return `${prefix.trim()}_${uniqueNumber}`;
  } else {
    return uniqueNumber;
  }
};

/**
 * Extracts base name from full file name (removes extension)
 * @param fileName - File name with or without extension
 * @returns Base name without extension
 */
export const getBaseNameFromFileName = (fileName: string): string => {
  // Remove common extensions
  return fileName.replace(/\.(jpg|jpeg|png|pdf)$/i, '');
};

/**
 * Validates if a file name is valid
 * @param name - Name to validate
 * @returns Boolean indicating if name is valid
 */
export const isValidFileName = (name: string): boolean => {
  if (!name || name.trim() === '') return false;
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(name.trim());
};