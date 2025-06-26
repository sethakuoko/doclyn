import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TabNavigationProps } from "../app/types";
import { requestImagePickerPermissions } from "../utils/permissions";

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  showCameraControls,
  takePicture,
}) => {
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const router = useRouter();

  const handleTakePicture = (): void => {
    if (takePicture) {
      takePicture();
    } else {
      Alert.alert(
        "Camera",
        "Take picture functionality will be connected to camera component"
      );
    }
  };

  const handleToggleFlash = (): void => {
    setFlashMode((current) => {
      switch (current) {
        case "off":
          return "on";
        case "on":
          return "off";
        default:
          return "off";
      }
    });
  };

  const handleOpenGallery = async (): Promise<void> => {
    try {
      const hasPermission = await requestImagePickerPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        router.push({ pathname: "/EditPhoteScreen", params: { uri } });
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      Alert.alert("Error", "Failed to open gallery");
    }
  };

  const getFlashIcon = (): string => {
    switch (flashMode) {
      case "on":
        return "⚡";
      default:
        return "⚡";
    }
  };

  return (
    <View style={styles.container}>
      {showCameraControls && (
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleOpenGallery}
          >
            <Text style={styles.controlIcon}>🖼️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleToggleFlash}
          >
            <Text style={styles.controlIcon}>{getFlashIcon()}</Text>
            <Text style={styles.flashModeText}>{flashMode}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "document" && styles.activeTab]}
          onPress={() => onTabChange("document")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "document" && styles.activeTabText,
            ]}
          >
            Document
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "audio" && styles.activeTab]}
          onPress={() => onTabChange("audio")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "audio" && styles.activeTabText,
            ]}
          >
            Audio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingBottom: 20,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  controlIcon: {
    fontSize: 24,
    color: "#333333",
  },
  flashModeText: {
    color: "#333333",
    fontSize: 10,
    marginTop: 2,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#008080",
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#008080",
    borderWidth: 2,
    borderColor: "#008080",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#008080",
  },
  tabText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#ffffff",
  },
});

export default TabNavigation;
