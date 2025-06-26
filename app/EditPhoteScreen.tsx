import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const TOOLBAR_ACTIONS = [
  { icon: "camera-reverse-outline", label: "Retake" },
  { icon: "crop", label: "Crop" },
  { icon: "sync", label: "Rotate" },
  { icon: "create-outline", label: "Edit text" },
  { icon: "color-filter-outline", label: "Filters" },
  { icon: "sparkles-outline", label: "Magic eraser" },
  { icon: "brush-outline", label: "Markup" },
  { icon: "color-wand-outline", label: "Cleanup" },
  { icon: "resize-outline", label: "Resize" },
  { icon: "trash-outline", label: "Delete" },
];

const EditPhoteScreen = () => {
  const { uri } = useLocalSearchParams();
  const imageUri = typeof uri === "string" ? uri : undefined;
  const filename = imageUri ? imageUri.split("/").pop() : "Untitled";
  const [selectedTool, setSelectedTool] = useState("Crop");

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Ionicons name="home" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.filenameContainer}>
          <Text style={styles.filename} numberOfLines={1}>
            {(filename || "Untitled").replace(/%20/g, " ")}
          </Text>
          <TouchableOpacity>
            <Ionicons
              name="pencil"
              size={18}
              color="#fff"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content: Image fills available space */}
      <View style={styles.mainContent}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      {/* Scrollable Toolbar */}
      <View style={styles.toolbarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarScroll}
        >
          {TOOLBAR_ACTIONS.map((action, idx) => {
            const isSelected = selectedTool === action.label;
            return (
              <TouchableOpacity
                key={action.icon}
                style={[
                  styles.toolbarButton,
                  isSelected && styles.toolbarButtonSelected,
                ]}
                onPress={() => setSelectedTool(action.label)}
              >
                <Ionicons
                  name={action.icon as any}
                  size={24}
                  color={isSelected ? "#fff" : "#fff"}
                  style={isSelected ? styles.toolbarIconSelected : undefined}
                />
                <Text
                  style={[
                    styles.toolbarLabel,
                    isSelected && styles.toolbarLabelSelected,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.keepScanningButton}>
          <Text style={styles.keepScanningText}>Keep scanning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.savePdfButton}>
          <Text style={styles.savePdfText}>Save PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#232323",
    backgroundColor: "#181818",
  },
  filenameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 12,
    minWidth: 0,
  },
  filename: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flexShrink: 1,
    maxWidth: width * 0.45,
    textAlign: "center",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#232323",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  toolbarContainer: {
    backgroundColor: "#181818",
    borderBottomWidth: 1,
    borderBottomColor: "#232323",
    paddingVertical: 10,
  },
  toolbarScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  toolbarButton: {
    alignItems: "center",
    marginHorizontal: 12,
    opacity: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  toolbarButtonSelected: {
    backgroundColor: "#008080",
  },
  toolbarIconSelected: {
    color: "#fff",
  },
  toolbarLabel: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
  },
  toolbarLabelSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#181818",
  },
  keepScanningButton: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 24,
    marginRight: 10,
    alignItems: "center",
  },
  keepScanningText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  savePdfButton: {
    flex: 1,
    backgroundColor: "#008080",
    paddingVertical: 14,
    borderRadius: 24,
    marginLeft: 10,
    alignItems: "center",
  },
  savePdfText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditPhoteScreen;
