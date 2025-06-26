export type TabType = 'document' | 'audio';

export interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  showCameraControls: boolean;
  takePicture?: () => void;
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