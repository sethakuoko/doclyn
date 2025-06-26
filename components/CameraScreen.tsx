import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { PhotoResult } from "../app/types";
import { requestMediaLibraryPermissions } from "../utils/permissions";

const CameraScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [isReady, setIsReady] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    initializeCamera();
  }, []);

  const initializeCamera = async (): Promise<void> => {
    try {
      if (!permission?.granted) {
        await requestPermission();
      }
      const mediaPermission = await requestMediaLibraryPermissions();
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

      if (photo) {
        await savePicture(photo);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture");
    }
  };

  const savePicture = async (photo: PhotoResult): Promise<void> => {
    try {
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      await MediaLibrary.createAlbumAsync("Camera App", asset, false);

      Alert.alert("Photo Saved", "Your photo has been saved to the gallery", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error saving picture:", error);
      Alert.alert("Error", "Failed to save picture");
    }
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
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
        ratio="16:9"
      >
        <View style={styles.cameraOverlay}>
          {/* Camera overlay content can be added here */}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  permissionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  permissionSubText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
  },
});

export default CameraScreen;
