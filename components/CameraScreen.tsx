import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { PhotoResult } from "../app/types";
import { requestMediaLibraryPermissions } from "../utils/permissions";

const CameraScreen = (props: any, ref: React.Ref<any>) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [isReady, setIsReady] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

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

      if (photo && photo.uri) {
        router.push({
          pathname: "/EditPhoteScreen",
          params: { uri: photo.uri },
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
    backgroundColor: "#ffffff",
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
    backgroundColor: "#ffffff",
    padding: 20,
  },
  permissionText: {
    color: "#333333",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  permissionSubText: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
  },
});

export default React.forwardRef(CameraScreen);
