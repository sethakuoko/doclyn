import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useEffect, useImperativeHandle, useRef, useState, ForwardedRef } from "react";
import { Alert, StyleSheet, Text, View, Modal, TouchableOpacity } from "react-native";
import { PhotoResult } from "../app/types";
import { requestMediaLibraryPermissions } from "../utils/permissions";
import { getDefaultFilePrefix, getSaveOriginalsToPhotos } from "../utils/storage";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";

interface CameraScreenProps {
  flashMode?: FlashMode;
}

const CameraScreen = (props: CameraScreenProps, ref: ForwardedRef<any>) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>(props.flashMode || "off");
  const [isReady, setIsReady] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // Update flash mode when props change
  useEffect(() => {
    if (props.flashMode) {
      setFlashMode(props.flashMode);
    }
  }, [props.flashMode]);

  useEffect(() => {
    initializeCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeCamera = async (): Promise<void> => {
    try {
      if (!permission?.granted) {
        await requestPermission();
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
        // Generate a unique name using the default prefix and current time
        let prefix = await getDefaultFilePrefix();
        const timestamp = Date.now();
        if (!prefix) prefix = "Scan";
        let originalName = photo.uri.split("/").pop() || "";
        originalName = originalName.replace(/^IMG[_-]?/i, "");
        originalName = originalName.replace(/\.png$/i, "");
        const generatedName = `${prefix}_${timestamp}.pdf`;
        // Check if we should save the original to the gallery
        const shouldSaveOriginal = await getSaveOriginalsToPhotos();
        if (shouldSaveOriginal) {
          try {
            await MediaLibrary.createAssetAsync(photo.uri);
          } catch (err) {
            console.error('Failed to save original photo to gallery:', err);
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

  useImperativeHandle(ref, () => ({
    takePicture,
  }));

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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a", // Dark background
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
    backgroundColor: "#1a1a1a", // Dark background
    padding: 20,
  },
  permissionText: {
    color: "#ffffff", // White text
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  permissionSubText: {
    color: "#cccccc", // Light gray text
    fontSize: 14,
    textAlign: "center",
  },
});

export default React.forwardRef(CameraScreen);