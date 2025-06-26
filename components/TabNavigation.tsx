import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TabNavigationProps } from "../app/types";
import { requestImagePickerPermissions } from "../utils/permissions";

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  showCameraControls,
}) => {
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");

  const handleTakePicture = (): void => {
    // This will be called from the parent component
    console.log("Take picture triggered");
    Alert.alert(
      "Camera",
      "Take picture functionality will be connected to camera component"
    );
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

  const handleToggleCamera = (): void => {
    console.log("Toggle camera triggered");
    Alert.alert(
      "Camera",
      "Camera flip functionality will be connected to camera component"
    );
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
        Alert.alert("Gallery", `Selected image: ${result.assets[0].uri}`);
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

          {/* <TouchableOpacity
            style={styles.controlButton}
            onPress={handleToggleFlash}
          >
            <Text style={styles.controlIcon}>{getFlashIcon()}</Text>
            <Text style={styles.flashModeText}>{flashMode}</Text>
          </TouchableOpacity> */}

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

          <View style={styles.controlButton}>
            {/* Empty space for symmetry */}
          </View>
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
    backgroundColor: "#000",
    paddingBottom: 20,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
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
    color: "#fff",
  },
  flashModeText: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#333",
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#111",
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
    backgroundColor: "#fff",
  },
  tabText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#000",
  },
});

export default TabNavigation;
