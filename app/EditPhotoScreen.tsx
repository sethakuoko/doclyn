import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ImageCropPicker from "react-native-image-crop-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { OCRStatus, processOCRParallel } from "../utils/ocr";
import { getDefaultFilePrefix } from "../utils/storage";
import { handleDelete } from "./editTools/Delete";
import { MARKUP_TOOLS } from "./editTools/Markup";
import { handleResize } from "./editTools/Resize";
import { handleRotate } from "./editTools/Rotate";
import { COLORS } from "./types";

const { width, height } = Dimensions.get("window");

// Tool definitions with their functionality
const TOOLBAR_ACTIONS = [
  { icon: "camera-reverse-outline", label: "Retake", action: "retake" },
  { icon: "crop", label: "Crop", action: "crop" },
  { icon: "sync", label: "Rotate", action: "rotate" },
  { icon: "resize-outline", label: "Resize", action: "resize" },
  { icon: "trash-outline", label: "Delete", action: "delete" },
];

interface EditState {
  currentImageUri: string;
  originalImageUri: string;
  cropArea: { x: number; y: number; width: number; height: number } | null;
  rotation: number;
  appliedFilter: string;
  markupElements: any[];
  isProcessing: boolean;
  imageDimensions: { width: number; height: number } | null;
  ocrStatus: OCRStatus;
}

// Helper to generate the display name for the file (no extension)
const getDisplayFileName = (prefix: string, number: string) => {
  if (prefix && prefix.trim() !== "") {
    return `${prefix.trim()}_${number}`;
  } else {
    return number;
  }
};

const EditPhotoScreen = () => {
  const { uri, generatedName, from } = useLocalSearchParams();
  const router = useRouter();
  const imageUri = typeof uri === "string" ? uri : undefined;

  // Get the default prefix
  const [defaultPrefix, setDefaultPrefix] = useState("");
  useEffect(() => {
    getDefaultFilePrefix().then((prefix) => setDefaultPrefix(prefix || ""));
  }, []);

  // Generate initial display name based on current prefix and timestamp
  const [displayFileName, setDisplayFileName] = useState("");
  useEffect(() => {
    const uniqueNumber = Date.now().toString();
    setDisplayFileName(getDisplayFileName(defaultPrefix, uniqueNumber));
  }, [defaultPrefix]);

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    currentImageUri: imageUri || "",
    originalImageUri: imageUri || "",
    cropArea: null,
    rotation: 0,
    appliedFilter: "original_color",
    markupElements: [],
    isProcessing: false,
    imageDimensions: null,
    ocrStatus: { status: "idle" },
  });

  const handleCopyOCRText = async () => {
    console.log("📋 Current OCR Status:", editState.ocrStatus);

    if (editState.ocrStatus.status === "processing") {
      console.log("⏳ OCR still processing");
      Alert.alert(
        "OCR Processing",
        "Text extraction is still in progress. Please wait..."
      );
      return;
    }

    if (editState.ocrStatus.status === "failed") {
      console.log("❌ OCR failed earlier:", editState.ocrStatus.error);
      Alert.alert("OCR Failed", "Could not extract text from this image.");
      return;
    }

    if (editState.ocrStatus.status === "success") {
      console.log(
        "ℹ️ OCR text length:",
        editState.ocrStatus.result?.text?.length
      );

      if (editState.ocrStatus.result?.text) {
        try {
          await Clipboard.setStringAsync(editState.ocrStatus.result.text);
          console.log("✅ Copied text to clipboard");
          Toast.show({
            type: "success",
            text1: "Text Copied",
            text2: "OCR text has been copied to your clipboard",
          });
          return;
        } catch (error) {
          console.error("⚠️ Clipboard error:", error);
        }
      }
    }

    console.log("⚠️ No valid OCR text available");
    Alert.alert("No Text", "No OCR text available to copy.");
  };

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMarkupModal, setShowMarkupModal] = useState(false);
  const [selectedMarkupTool, setSelectedMarkupTool] = useState("draw");
  const [markupColor, setMarkupColor] = useState("#FF0000");
  const [markupThickness, setMarkupThickness] = useState(3);

  // 1. Add state for editing the image name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState(displayFileName);

  // Update editableName when displayFileName changes
  useEffect(() => {
    setEditableName(displayFileName);
  }, [displayFileName]);

  // 2. Add state for showing the 3-dots menu
  const [showMenu, setShowMenu] = useState(false);

  // Get image dimensions on load
  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setEditState((prev) => ({
          ...prev,
          imageDimensions: { width, height },
        }));
      });
    }
  }, [imageUri]);

  useEffect(() => {
    if (imageUri) {
      console.log("🔵 [1] Starting OCR process for image:", imageUri);
      setEditState((prev) => ({
        ...prev,
        ocrStatus: { status: "processing" },
      }));

      const startTime = Date.now();

      processOCRParallel(imageUri)
        .then((result) => {
          console.log(`🟢 [2] OCR Success (${Date.now() - startTime}ms)`);
          console.log(
            "🟢 Extracted Text Preview:",
            result.text.substring(0, 50) +
              (result.text.length > 50 ? "..." : "")
          );
          console.log("🟢 Source:", result.source);

          setEditState((prev) => ({
            ...prev,
            ocrStatus: {
              status: "success",
              result,
            },
          }));
        })
        .catch((error) => {
          console.log(`🔴 [3] OCR Failed (${Date.now() - startTime}ms)`);
          console.error("🔴 Error Details:", error);

          setEditState((prev) => ({
            ...prev,
            ocrStatus: {
              status: "failed",
              error: error.message || "OCR processing failed",
            },
          }));
        });
    } else {
      console.log("⚪️ [0] No imageUri available for OCR");
    }
  }, [imageUri]);

  const renderCopyButton = () => {
    if (editState.ocrStatus.status === "processing") {
      // Show progress bar while processing
      return (
        <View style={styles.appBarProgressContainer}>
          <ActivityIndicator size="small" color={COLORS.brand} />
          <Text style={styles.progressText}>Extracting...</Text>
        </View>
      );
    }
  };

  // Production-ready crop function using react-native-image-crop-picker
  const handleCropWithPicker = async () => {
    if (!editState.currentImageUri) {
      Toast.show({ type: "error", text1: "No image to crop" });
      return;
    }

    setEditState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const croppedImage = await ImageCropPicker.openCropper({
        path: editState.currentImageUri,
        width: 400,
        height: 400,
        cropping: true,
        cropperActiveWidgetColor: "#00FFFF",
        cropperStatusBarColor: "#000000",
        cropperToolbarColor: "#000000",
        cropperToolbarWidgetColor: "#FFFFFF",
        hideBottomControls: false,
        enableRotationGesture: true,
        freeStyleCropEnabled: true,
        showCropGuidelines: true,
        showCropFrame: true,
        compressImageQuality: 0.8,
        includeBase64: false,
        includeExif: false,
        mediaType: "photo",
      });

      setEditState((prev) => ({
        ...prev,
        currentImageUri: croppedImage.path,
        isProcessing: false,
      }));

      setSelectedTool(null);
      Toast.show({ type: "success", text1: "Image cropped successfully" });
    } catch (error: any) {
      console.error("Crop error:", error);
      setEditState((prev) => ({ ...prev, isProcessing: false }));

      // Handle user cancellation gracefully
      if (
        error.message &&
        (error.message.includes("User cancelled") ||
          error.message.includes("cancelled"))
      ) {
        // User cancelled, no error message needed
        setSelectedTool(null);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to crop image",
          text2: "Please try again",
        });
      }
    }
  };

  // Handle tool selection
  const handleToolSelect = useCallback(
    async (action: string) => {
      if (action === "crop") {
        setSelectedTool(action);
        await handleCropWithPicker();
        return;
      }

      setSelectedTool(action);

      switch (action) {
        case "retake":
          handleRetake();
          break;
        case "resize":
          handleResize(editState.currentImageUri, setEditState);
          break;
        case "delete":
          handleDelete(router);
          break;
        case "rotate":
          handleRotate(
            editState.currentImageUri,
            editState.rotation,
            setEditState
          );
          break;
      }
    },
    [editState]
  );

  // Back button handler: always go to HomeScreen
  const handleBack = () => {
    router.back();
  };

  // Retake functionality: go to GalleryScreen or ScanScreen based on 'from' param
  const handleRetake = () => {
    console.log("handleRetake — from:", from);
    Alert.alert("Retake Photo", "Are you sure you want to retake this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Retake",
        onPress: () => {
          if (from === "gallery") {
            router.replace("/GalleryScreen");
          } else if (from === "camera") {
            router.replace("/ScanScreen");
          } else {
            router.replace("/HomeScreen");
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!editState.currentImageUri) {
      Toast.show({ type: "error", text1: "No image to save" });
      return;
    }
    setEditState((prev) => ({ ...prev, isProcessing: true }));
    try {
      let currentPrefix = await getDefaultFilePrefix();
      const uniqueNumber = Date.now();

      let baseName = "";
      if (currentPrefix && currentPrefix.trim() !== "") {
        baseName = `${currentPrefix.trim()}_${uniqueNumber}`;
      } else {
        baseName = `${uniqueNumber}`;
      }

      const imageName = `${baseName}.jpg`;
      const imageDestPath = `${FileSystem.documentDirectory}${imageName}`;
      await FileSystem.copyAsync({
        from: editState.currentImageUri,
        to: imageDestPath,
      });

      const base64 = await FileSystem.readAsStringAsync(imageDestPath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const html = `...`; // Keep existing HTML

      const { uri: pdfUri } = await Print.printToFileAsync({ html });
      const pdfName = `${baseName}.pdf`;
      const pdfDestPath = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.moveAsync({ from: pdfUri, to: pdfDestPath });

      let savedDocs = [];
      const existing = await AsyncStorage.getItem("SAVED_PDFS");
      if (existing) {
        savedDocs = JSON.parse(existing);
      }

      savedDocs.push({
        name: baseName,
        imagePath: imageDestPath,
        pdfPath: pdfDestPath,
        date: new Date().toISOString(),
        ocrText:
          editState.ocrStatus.status === "success"
            ? editState.ocrStatus.result?.text
            : undefined,
      });

      await AsyncStorage.setItem("SAVED_PDFS", JSON.stringify(savedDocs));
      router.back();
    } catch (error) {
      console.error("Save error:", error);
      Toast.show({ type: "error", text1: "Failed to save document" });
    } finally {
      setEditState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={26} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.filenameContainer}>
            {isEditingName ? (
              <TextInput
                value={editableName}
                onChangeText={setEditableName}
                onBlur={() => setIsEditingName(false)}
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 18,
                  fontWeight: "600",
                  backgroundColor: COLORS.backgroundSecondary,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  minWidth: 120,
                  maxWidth: width * 0.45,
                }}
                autoFocus
                selectTextOnFocus
              />
            ) : (
              <Text style={styles.filename} numberOfLines={1}>
                {displayFileName}
              </Text>
            )}
            <TouchableOpacity onPress={() => setIsEditingName(true)}>
              <Ionicons
                name="pencil"
                size={18}
                color={COLORS.textPrimary}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>

          {renderCopyButton()}
        </View>

        {/* Main Content: Image */}
        <View style={styles.mainContent}>
          {editState.currentImageUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: editState.currentImageUri }}
                style={styles.image}
                resizeMode="contain"
              />
              {editState.isProcessing && (
                <View style={styles.processingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.brand} />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        {/* Bottom controls: Save PDF, toolbar, and filter bar stacked vertically */}
        <View
          style={{
            width: "100%",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: "column-reverse",
            zIndex: 50,
          }}
        >
          {/* Save PDF button at the top of the stack */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.savePdfButton} onPress={handleSave}>
              <Text style={styles.savePdfText}>Save</Text>
            </TouchableOpacity>
          </View>
          {/* Toolbar below Save PDF */}
          <View style={styles.toolbarContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.toolbarScroll}
            >
              {TOOLBAR_ACTIONS.map((action) => {
                const isSelected = selectedTool === action.action;
                return (
                  <TouchableOpacity
                    key={action.icon}
                    style={[
                      styles.toolbarButton,
                      isSelected && styles.toolbarButtonSelected,
                    ]}
                    onPress={() => handleToolSelect(action.action)}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={24}
                      color={COLORS.textPrimary}
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
        </View>

        {/* Markup Modal */}
        <Modal
          visible={showMarkupModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMarkupModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Markup Tools</Text>
                <TouchableOpacity onPress={() => setShowMarkupModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={styles.markupTools}>
                {MARKUP_TOOLS.map((tool) => (
                  <TouchableOpacity
                    key={tool.type}
                    style={[
                      styles.markupTool,
                      selectedMarkupTool === tool.type &&
                        styles.markupToolSelected,
                    ]}
                    onPress={() => setSelectedMarkupTool(tool.type)}
                  >
                    <Ionicons
                      name={tool.icon as any}
                      size={24}
                      color={
                        selectedMarkupTool === tool.type
                          ? COLORS.textPrimary
                          : COLORS.textSecondary
                      }
                    />
                    <Text style={styles.markupToolLabel}>{tool.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.colorPicker}>
                <Text style={styles.colorPickerTitle}>Color:</Text>
                {[
                  "#FF0000",
                  "#00FF00",
                  "#0000FF",
                  "#FFFF00",
                  "#FF00FF",
                  "#00FFFF",
                ].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      markupColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setMarkupColor(color)}
                  />
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <Toast />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBarCopyButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 25,
    marginLeft: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
    flexShrink: 1,
    maxWidth: width * 0.45,
    textAlign: "center",
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    paddingTop: 10,
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  appBarProgressContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 25,
    marginLeft: 8,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: COLORS.textPrimary,
    marginTop: 10,
    fontSize: 16,
  },
  placeholderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  bottomControls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column-reverse",
    zIndex: 50,
  },
  toolbarContainer: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
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
    backgroundColor: COLORS.brand,
  },
  toolbarLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  toolbarLabelSelected: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.background,
    paddingBottom: 32,
  },
  savePdfButton: {
    backgroundColor: COLORS.brand,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 24,
    alignItems: "center",
  },
  savePdfText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  // Crop Modal Styles
  cropModalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cropperStyle: {
    flex: 1,
  },
  // Modal styles (existing)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  markupTools: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    justifyContent: "space-around",
  },
  markupTool: {
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    minWidth: 80,
  },
  markupToolSelected: {
    backgroundColor: COLORS.brand,
  },
  markupToolLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  colorPicker: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundSecondary,
  },
  colorPickerTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginRight: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: COLORS.textPrimary,
  },
});

export default EditPhotoScreen;
