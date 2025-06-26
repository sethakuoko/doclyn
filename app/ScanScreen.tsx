import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import AudioScreen from "../components/AudioScreen";
import CameraScreen from "../components/CameraScreen";
import TabNavigation from "../components/TabNavigation";
import { TabType } from "./types";

const ScanScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("document");
  const cameraRef = useRef<{ takePicture: () => void }>(null);

  const handleTakePicture = () => {
    cameraRef.current?.takePicture();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="home" size={24} color="#008080" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === "document" ? (
          <CameraScreen ref={cameraRef} />
        ) : (
          <AudioScreen />
        )}
      </View>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showCameraControls={activeTab === "document"}
        takePicture={handleTakePicture}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScanScreen;
