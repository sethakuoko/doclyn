export type TabType = 'document' | 'audio';

export interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  showCameraControls: boolean;
  takePicture?: () => void;
  onFlashModeChange?: (mode: 'on' | 'off' | 'auto') => void;
  flashMode?: 'on' | 'off' | 'auto';
}

export interface CameraControlsProps {
  onTakePicture: () => void;
  onToggleFlash: () => void;
  onToggleCamera: () => void;
  onOpenGallery: () => void;
  flashMode: 'on' | 'off' | 'auto';
  isFlashAvailable: boolean;
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
}

export interface SavedDocument {
  name: string;
  imagePath: string;
  pdfPath: string;
  date: string;
  ocrText?: string;
}

// Centralized color palette for dark theme and brand colors
export const COLORS = {
  // Brand
  brand: "#008080", // Teal
  brandDark: "#006666",
  // Backgrounds
  background: "#181818",
  backgroundSecondary: "#232323",
  backgroundTertiary: "#2a2a2a",
  // Surfaces
  surface: "#232323",
  surfaceSecondary: "#333333",
  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textTertiary: "#666666",
  // Borders
  border: "#333333",
  borderLight: "#444444",
  // Misc
  error: "#FF4C4C",
  success: "#4CAF50",
  info: "#2196F3",
  overlay: "rgba(0,0,0,0.7)",
  // Button backgrounds
  button: "#1F1F1F",
  buttonActive: "#008080",
  buttonText: "#FFFFFF",
  // Disabled
  disabled: "#444444",
  disabledText: "#999999",
};

// Default export to satisfy the warning
export default {
  // This is just a placeholder to satisfy the default export requirement
  version: '1.0.0'
};