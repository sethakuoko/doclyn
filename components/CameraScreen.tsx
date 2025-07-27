import { Ionicons } from "@expo/vector-icons";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, {
  ForwardedRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { requestMediaLibraryPermissions } from "../utils/permissions";
import {
  getDefaultFilePrefix,
  getSaveOriginalsToPhotos,
} from "../utils/storage";

interface CameraScreenProps {
  flashMode?: FlashMode;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const CameraScreen = (props: CameraScreenProps, ref: ForwardedRef<any>) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>(
    props.flashMode || "off"
  );
  const [isReady, setIsReady] = useState<boolean>(false);
  const [cameraLayout, setCameraLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  useEffect(() => {
    if (props.flashMode) {
      setFlashMode(props.flashMode);
    }
  }, [props.flashMode]);

  useEffect(() => {
    initializeCamera();
  }, []);

  const initializeCamera = async (): Promise<void> => {
    try {
      const cameraPermission = await requestPermission();
      if (!cameraPermission.granted) {
        Alert.alert("Error", "Camera permissions are not granted.");
      }
      await requestMediaLibraryPermissions();
      setIsReady(true);
    } catch (error) {
      console.error("Camera initialization error:", error);
      Alert.alert("Error", "Failed to initialize camera");
    }
  };

  const takePicture = async (): Promise<void> => {
    if (!cameraRef.current || !isReady) {
      Alert.alert("Camera not ready", "Please wait for camera to initialize");
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
      if (photo && photo.uri) {
        let prefix = await getDefaultFilePrefix();
        const timestamp = Date.now();
        if (!prefix) prefix = "Scan";
        const generatedName = `${prefix}_${timestamp}.pdf`;
        const shouldSaveOriginal = await getSaveOriginalsToPhotos();
        if (shouldSaveOriginal) {
          try {
            await MediaLibrary.createAssetAsync(photo.uri);
          } catch (err) {
            console.error("Failed to save original photo to gallery:", err);
          }
        }
        router.push({
          pathname: "/EditPhotoScreen",
          params: { uri: photo.uri, generatedName, from: "camera" },
        });
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture");
    }
  };

  useImperativeHandle(ref, () => ({ takePicture }));

  const onCameraLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCameraLayout({ width, height });
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Requesting camera permissions...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access denied</Text>
        <Text style={styles.permissionSubText}>
          Please enable camera permissions in your device settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Container with Document Scanner Frame */}
      <View style={styles.cameraContainer} onLayout={onCameraLayout}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          ratio="16:9"
        />

        {/* Document Scanner Overlay */}
        <View style={styles.scannerOverlay}>
          {/* Full Screen Scanning Frame */}
          <View style={styles.scanningFrame}>
            {/* Corner Brackets */}
            <View style={[styles.cornerBracket, styles.topLeft]} />
            <View style={[styles.cornerBracket, styles.topRight]} />
            <View style={[styles.cornerBracket, styles.bottomLeft]} />
            <View style={[styles.cornerBracket, styles.bottomRight]} />

            {/* Scanning Line Animation */}
            <View style={styles.scanLine} />

            {/* Document Icon */}
            <View style={styles.documentIconContainer}>
              <Ionicons
                name="document-outline"
                size={24}
                color="rgba(255, 255, 255, 0.8)"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        {/* Instructions removed as requested */}
      </View>

      {/* Document Detection Indicator */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0, // Extend to top app bar
    marginBottom: 0, // Extend to bottom app bar
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanningFrame: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cornerBracket: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#00CED1",
    borderWidth: 4,
  },
  topLeft: {
    top: 20,
    left: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 20,
    right: 20,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#00CED1",
    opacity: 0.8,
  },
  documentIconContainer: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    marginHorizontal: 20,
  },
  instructionText: {
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 10,
    fontWeight: "500",
  },
  detectionIndicator: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFA500",
    marginRight: 8,
  },
  detectionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  permissionText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  permissionSubText: {
    color: "#cccccc",
    fontSize: 14,
    textAlign: "center",
  },
});

export default React.forwardRef(CameraScreen);
