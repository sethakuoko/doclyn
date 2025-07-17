import { useFileNameInput } from "@/components/FileNameInput";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { logout, getUserSession, setDefaultFilePrefix, getDefaultFilePrefix, setSaveOriginalsToPhotos, getSaveOriginalsToPhotos } from "../utils/storage";
import { COLORS } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

function SettingsScreen() {
  const router = useRouter();

  // State for toggle switches
  const [saveOriginalsToPhotos, setSaveOriginalsToPhotosState] = useState(false);
  const [defaultFileName, setDefaultFileName] = useState("Scan");
  const [userData, setUserData] = useState({ fullName: "Loading...", email: "Loading..." });
  const { signOut } = useAuth();

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const session = await getUserSession();
        if (session.fullName && session.email) {
          setUserData({
            fullName: session.fullName,
            email: session.email
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // File name input component
  const { showFileNamePrompt } = useFileNameInput({
    currentFileName: defaultFileName,
    onFileNameUpdate: async (fileName: string) => {
      setDefaultFileName(fileName);
      await setDefaultFilePrefix(fileName);
      handleFileNameSave(fileName);
    },
    title: "Default File Name",
    message: "Enter the default name for your scans",
  });

  // Custom function to handle file name save
  const handleFileNameSave = (fileName: string) => {
    console.log("Processing file name save:", fileName);
  };

  // Load default file name prefix from storage on mount
  useEffect(() => {
    const loadDefaultPrefix = async () => {
      const prefix = await getDefaultFilePrefix();
      if (prefix) setDefaultFileName(prefix);
    };
    loadDefaultPrefix();
  }, []);

  // Load saveOriginalsToPhotos from storage on mount
  useEffect(() => {
    const loadSaveOriginals = async () => {
      const value = await getSaveOriginalsToPhotos();
      setSaveOriginalsToPhotosState(value);
    };
    loadSaveOriginals();
  }, []);

  const handleProfilePress = () => {};
  // ...rest of your code...

  const handleSignOutPress = async () => {
    try {
      // Use our custom logout function instead of Clerk's signOut
      await logout(router);
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback to Clerk signOut if our logout fails
      await signOut();
      router.replace("/");
    }
  };
  
  const handleDonePress = () => {
    router.back();
  };

  const handleSaveOriginalsToggle = async (value: boolean) => {
    console.log("Save originals to Photos toggled:", value);
    setSaveOriginalsToPhotosState(value);
    await setSaveOriginalsToPhotos(value);
  };

  const handleDefaultFileNamePress = () => {
    showFileNamePrompt();
  };

  return (
    <SafeAreaView style={styles.container}>
      {<Stack.Screen options={{ headerShown: false }} />}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

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
              <Text style={styles.profileName}>{userData.fullName}</Text>
              <Text style={styles.profileEmail}>{userData.email}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Preferences Section */}
        <View style={styles.preferencesSection}>
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
              trackColor={{ false: COLORS.border, true: COLORS.brand }}
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
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.brand,
  },
  doneButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  doneButtonText: {
    fontSize: 16,
    color: COLORS.brand,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: COLORS.backgroundSecondary,
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
    backgroundColor: COLORS.brand,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  preferencesSection: {
    backgroundColor: COLORS.background,
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
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
  },
  settingsList: {
    backgroundColor: COLORS.background,
    marginTop: 0,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  signOutItem: {
    borderBottomWidth: 0,
    marginTop: 20,
  },
});

export default SettingsScreen;
