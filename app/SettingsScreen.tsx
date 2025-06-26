import { useFileNameInput } from "@/components/FileNameInput";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function SettingsScreen() {
  const router = useRouter();

  // State for toggle switches
  const [runTextRecognition, setRunTextRecognition] = useState(true);
  const [saveOriginalsToPhotos, setSaveOriginalsToPhotos] = useState(false);
  const [defaultFileName, setDefaultFileName] = useState("Scan");

  // File name input component
  const { showFileNamePrompt } = useFileNameInput({
    currentFileName: defaultFileName,
    onFileNameUpdate: (fileName: string) => {
      setDefaultFileName(fileName);

      handleFileNameSave(fileName);
    },
    title: "Default File Name",
    message: "Enter the default name for your scans",
  });

  // Custom function to handle file name save
  const handleFileNameSave = (fileName: string) => {
    console.log("Processing file name save:", fileName);
  };
  // Handler functions for each list item click
  const handleProfilePress = () => {};

  const handleSignOutPress = async () => {
    if (router.canGoBack()) {
      router.back();
    }

    router.replace("/");
  };

  const handleDonePress = () => {
    router.back();
  };

  const handleTextRecognitionToggle = (value: boolean) => {
    console.log("Text recognition toggled:", value);
    setRunTextRecognition(value);
  };

  const handleSaveOriginalsToggle = (value: boolean) => {
    console.log("Save originals to Photos toggled:", value);
    setSaveOriginalsToPhotos(value);
  };

  const handleDefaultFileNamePress = () => {
    showFileNamePrompt();
  };

  return (
    <SafeAreaView style={styles.container}>
      {<Stack.Screen options={{ headerShown: false }} />}
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleDonePress} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={handleProfilePress}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Full Name</Text>
              <Text style={styles.profileEmail}>email</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Preferences Section */}
        <View style={styles.preferencesSection}>
          {/* TEXT RECOGNITION Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TEXT RECOGNITION (OCR)</Text>
          </View>

          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>Run text recognition</Text>
            <Switch
              value={runTextRecognition}
              onValueChange={handleTextRecognitionToggle}
              trackColor={{ false: "#333", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          {/* SAVE IMAGES Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SAVE IMAGES</Text>
          </View>

          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>
              Save originals to Photos
            </Text>
            <Switch
              value={saveOriginalsToPhotos}
              onValueChange={handleSaveOriginalsToggle}
              trackColor={{ false: "#333", true: "#007AFF" }}
              thumbColor="#fff"
            />
          </View>

          {/* FILE NAMING Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FILE NAMING</Text>
          </View>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={handleDefaultFileNamePress}
          >
            <Text style={styles.settingsItemText}>Default file name</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={[styles.settingsItem, styles.signOutItem]}
            onPress={handleSignOutPress}
          >
            <Text style={styles.settingsItemText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  doneButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  doneButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 0,
    marginTop: 0,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#8A2BE2",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 24,
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  preferencesSection: {
    backgroundColor: "#000",
    marginTop: 0,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    letterSpacing: 0.5,
  },
  settingsList: {
    backgroundColor: "#000",
    marginTop: 0,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  settingsItemText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  signOutItem: {
    borderBottomWidth: 0,
    marginTop: 20,
  },
});

export default SettingsScreen;
