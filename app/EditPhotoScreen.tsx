import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { OCRStatus } from "../utils/ocr";
import { getDefaultFilePrefix } from "../utils/storage";
import Crop from "./editTools/Crop";
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
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropRect, setCropRect] = useState({
    x: 50,
    y: 100,
    w: width * 0.7,
    h: height * 0.4,
  });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLayout, setImageLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Store initial gesture positions to calculate relative movement
  const gestureState = useRef({
    initialX: 0,
    initialY: 0,
    initialCropRect: { x: 0, y: 0, w: 0, h: 0 },
  });

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

  // useEffect(() => {
  //   if (imageUri) {
  //     console.log("🔵 [1] Starting OCR process for image:", imageUri);
  //     setEditState((prev) => ({
  //       ...prev,
  //       ocrStatus: { status: "processing" },
  //     }));

  //     const startTime = Date.now();

  //     processOCRParallel(imageUri)
  //       .then((result) => {
  //         console.log(`🟢 [2] OCR Success (${Date.now() - startTime}ms)`);
  //         console.log(
  //           "🟢 Extracted Text Preview:",
  //           result.text.substring(0, 50) +
  //             (result.text.length > 50 ? "..." : "")
  //         );
  //         console.log("🟢 Source:", result.source);

  //         setEditState((prev) => ({
  //           ...prev,
  //           ocrStatus: {
  //             status: "success",
  //             result,
  //           },
  //         }));
  //       })
  //       .catch((error) => {
  //         console.log(`🔴 [3] OCR Failed (${Date.now() - startTime}ms)`);
  //         console.error("🔴 Error Details:", error);

  //         setEditState((prev) => ({
  //           ...prev,
  //           ocrStatus: {
  //             status: "failed",
  //             error: error.message || "OCR processing failed",
  //           },
  //         }));
  //       });
  //   } else {
  //     console.log("⚪️ [0] No imageUri available for OCR");
  //   }
  // }, [imageUri]);

  // Handle image layout - this is crucial for proper crop positioning
  const handleImageLayout = (event: any) => {
    const {
      x,
      y,
      width: layoutWidth,
      height: layoutHeight,
    } = event.nativeEvent.layout;
    setImageLayout({ x, y, width: layoutWidth, height: layoutHeight });

    // Initialize crop rect based on actual image layout dimensions
    if (layoutWidth > 0 && layoutHeight > 0) {
      const padding = 40;
      setCropRect({
        x: padding,
        y: padding,
        w: layoutWidth - padding * 2,
        h: layoutHeight - padding * 2,
      });
    }
  };

  // Handle tool selection
  const handleToolSelect = useCallback(
    (action: string) => {
      if (action === "crop") {
        setSelectedTool(action);
        setIsCropMode(true);
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

  // Improved PanResponders with proper gesture handling
  const createHandlePanResponder = (handle: string) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        setActiveHandle(handle);
        setIsDragging(true);
        // Store initial positions for relative movement calculation
        gestureState.current.initialX = evt.nativeEvent.pageX;
        gestureState.current.initialY = evt.nativeEvent.pageY;
        // FIXED: Use current cropRect state instead of storing outdated state
        gestureState.current.initialCropRect = { ...cropRect };
      },

      onPanResponderMove: (evt, gesture) => {
        // Calculate movement delta from initial position
        const deltaX = evt.nativeEvent.pageX - gestureState.current.initialX;
        const deltaY = evt.nativeEvent.pageY - gestureState.current.initialY;

        setCropRect((prev) => {
          const initial = gestureState.current.initialCropRect;
          let { x, y, w, h } = { ...initial };

          const minSize = 80; // Minimum crop size
          const maxSize = imageLayout
            ? { w: imageLayout.width, h: imageLayout.height }
            : { w: width, h: height };

          if (handle === "left") {
            // Move left edge
            const newX = Math.max(
              0,
              Math.min(initial.x + deltaX, initial.x + initial.w - minSize)
            );
            const newW = initial.w - (newX - initial.x);
            x = newX;
            w = newW;
          } else if (handle === "right") {
            // Move right edge
            const newW = Math.max(
              minSize,
              Math.min(initial.w + deltaX, maxSize.w - initial.x)
            );
            w = newW;
          } else if (handle === "top") {
            // Move top edge
            const newY = Math.max(
              0,
              Math.min(initial.y + deltaY, initial.y + initial.h - minSize)
            );
            const newH = initial.h - (newY - initial.y);
            y = newY;
            h = newH;
          } else if (handle === "bottom") {
            // Move bottom edge
            const newH = Math.max(
              minSize,
              Math.min(initial.h + deltaY, maxSize.h - initial.y)
            );
            h = newH;
          }

          // Ensure crop stays within image bounds
          x = Math.max(0, Math.min(x, maxSize.w - w));
          y = Math.max(0, Math.min(y, maxSize.h - h));
          w = Math.min(w, maxSize.w - x);
          h = Math.min(h, maxSize.h - y);

          return { x, y, w, h };
        });
      },

      onPanResponderRelease: () => {
        setActiveHandle(null);
        setIsDragging(false);
      },
    });

  const leftHandle = useRef(createHandlePanResponder("left")).current;
  const rightHandle = useRef(createHandlePanResponder("right")).current;
  const topHandle = useRef(createHandlePanResponder("top")).current;
  const bottomHandle = useRef(createHandlePanResponder("bottom")).current;

  // Confirm crop with proper coordinate mapping
  const confirmCrop = async () => {
    if (!imageLayout) {
      Toast.show({ type: "error", text1: "Image not ready for cropping" });
      return;
    }

    setEditState((prev) => ({ ...prev, isProcessing: true }));

    try {
      // Calculate actual crop coordinates relative to the original image
      const scaleX = editState.imageDimensions?.width
        ? editState.imageDimensions.width / imageLayout.width
        : 1;
      const scaleY = editState.imageDimensions?.height
        ? editState.imageDimensions.height / imageLayout.height
        : 1;

      const actualCrop = {
        originX: cropRect.x * scaleX,
        originY: cropRect.y * scaleY,
        width: cropRect.w * scaleX,
        height: cropRect.h * scaleY,
      };

      const result = await ImageManipulator.manipulateAsync(
        editState.currentImageUri,
        [{ crop: actualCrop }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditState((prev) => ({
        ...prev,
        currentImageUri: result.uri,
        isProcessing: false,
      }));

      setIsCropMode(false);
      setSelectedTool(null);
      Toast.show({ type: "success", text1: "Image cropped successfully" });
    } catch (error) {
      console.error("Crop error:", error);
      setEditState((prev) => ({ ...prev, isProcessing: false }));
      Toast.show({ type: "error", text1: "Failed to crop image" });
    }
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

          <TouchableOpacity
            style={styles.appBarCopyButton}
            onPress={handleCopyOCRText}
          >
            <Ionicons name="copy" size={24} color={COLORS.brand} />
          </TouchableOpacity>
        </View>

        {/* Main Content: Image with overlay */}
        <View style={styles.mainContent}>
          {editState.currentImageUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: editState.currentImageUri }}
                style={styles.image}
                resizeMode="contain"
                onLayout={handleImageLayout}
              />
              {isCropMode && imageLayout && (
                <Crop
                  width={width}
                  height={height}
                  cropRect={cropRect}
                  leftHandle={leftHandle}
                  rightHandle={rightHandle}
                  topHandle={topHandle}
                  bottomHandle={bottomHandle}
                  confirmCrop={confirmCrop}
                  imageDimensions={imageLayout}
                  isDragging={isDragging}
                />
              )}
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
