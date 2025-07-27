import { Ionicons } from "@expo/vector-icons";
import { FlashMode } from "expo-camera";
import { Stack } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AudioScreen from "../components/AudioScreen";
import CameraScreen from "../components/CameraScreen";
import TabNavigation from "../components/TabNavigation";
import { COLORS } from "./types";

const ScanScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"document" | "audio">("document");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const cameraRef = useRef<any>(null);

  const handleTabChange = (tab: "document" | "audio"): void => {
    setActiveTab(tab);
  };

  const handleTakePicture = (): void => {
    if (cameraRef.current) {
      cameraRef.current.takePicture();
    }
  };

  const handleFlashModeChange = (mode: FlashMode): void => {
    setFlashMode(mode);
  };

  const handleHomePress = () => {
    // Use router to navigate home
    // Import useRouter if not already
    // const router = useRouter();
    // router.replace("/HomeScreen");
    // For now, use window.location as placeholder if router not available
    // window.location.href = "/HomeScreen";
    // But in Expo Router:
    const { useRouter } = require("expo-router");
    const router = useRouter();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.appBarHomeButton}
          onPress={handleHomePress}
        >
          <Ionicons name="home" size={28} color={COLORS.brand} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>
          {activeTab === "document" ? "Document" : "Audio"}
        </Text>
        <View style={{ width: 50 }} /> {/* Spacer for symmetry */}
      </View>
      <View style={styles.contentContainer}>
        {activeTab === "document" ? (
          <CameraScreen ref={cameraRef} flashMode={flashMode} />
        ) : (
          <AudioScreen />
        )}
      </View>
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showCameraControls={activeTab === "document"}
        takePicture={handleTakePicture}
        onFlashModeChange={handleFlashModeChange}
        flashMode={flashMode}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a", // Dark background
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 18,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },

  appBarHomeButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 25,
  },
  appBarTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  contentContainer: {
    flex: 1,
  },
});

export default ScanScreen;
