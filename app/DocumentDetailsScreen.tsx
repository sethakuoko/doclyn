import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { WebView } from "react-native-webview";
import { getDefaultFilePrefix } from "../utils/storage";
import { COLORS } from "./types";

import { ToastMessage } from "../components/Toast";

const { width, height } = Dimensions.get("window");

function isPdf(path: string) {
  return path && path.toLowerCase().endsWith(".pdf");
}

interface SavedPDF {
  name: string;
  path: string;
  date: string;
  ocrText?: string;
}

const DocumentDetailsScreen = () => {
  const router = useRouter();
  let { imagePath, pdfPath } = useLocalSearchParams();

  // Handle both imagePath and pdfPath parameters
  let filePath = pdfPath || imagePath;
  if (Array.isArray(filePath)) {
    filePath = filePath[0];
  }

  const [pdfHtml, setPdfHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [defaultPrefix, setDefaultPrefix] = useState("");
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Extract filename from path for display
  useEffect(() => {
    const fetchPrefix = async () => {
      const prefix = await getDefaultFilePrefix();
      setDefaultPrefix(prefix || "");
    };
    fetchPrefix();
  }, []);

  const getFileName = (path: string) => {
    if (!path) return "Document";
    const parts = path.split("/");
    let name = parts[parts.length - 1];
    // If user has set a prefix, strip any IMG prefix from the name
    if (defaultPrefix && name) {
      name = name.replace(/^IMG[_-]?/i, "");
      if (!name.startsWith(defaultPrefix)) {
        name = `${defaultPrefix}${name}`;
      }
    }
    // If no user prefix and name does not start with IMG, fallback to Scan
    if (!defaultPrefix && name && !/^IMG[_-]?/i.test(name)) {
      name = `Scan${name}`;
    }
    return name;
  };

  useEffect(() => {
    if (isPdf(filePath)) {
      setLoading(true);
      const loadPdf = async () => {
        try {
          const base64 = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setPdfHtml(`
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
                <style>
                  html, body { 
                    margin:0; 
                    padding:0; 
                    background:#000; 
                    width:100%; 
                    height:100%; 
                  }
                  embed { 
                    width:100%; 
                    height:100%; 
                    object-fit:contain;
                  }
                </style>
              </head>
              <body>
                <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
              </body>
            </html>
          `);
        } catch (e) {
          setError("Unable to display PDF.");
        } finally {
          setLoading(false);
        }
      };
      loadPdf();
    }
  }, [filePath]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      await Sharing.shareAsync(filePath);
    } catch (err) {
      Alert.alert("Share Failed", "Unable to share this PDF.");
    }
  };

  const handlePrint = async () => {
    try {
      await Print.printAsync({ uri: filePath });
    } catch (err) {
      Alert.alert("Print Failed", "Unable to print this PDF.");
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete PDF", "Are you sure you want to delete this PDF?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Remove from AsyncStorage
            let saved = await AsyncStorage.getItem("SAVED_PDFS");
            let pdfs = saved ? JSON.parse(saved) : [];
            pdfs = pdfs.filter((pdf: any) => pdf.path !== filePath);
            await AsyncStorage.setItem("SAVED_PDFS", JSON.stringify(pdfs));
            // Remove file from file system
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            router.replace("/HomeScreen");
          } catch (err) {
            Alert.alert("Delete Failed", "Unable to delete this PDF.");
          }
        },
      },
    ]);
  };

  const handleViewInApp = async () => {
    try {
      await Linking.openURL(filePath);
    } catch (err) {
      Alert.alert(
        "No PDF Viewer",
        "No app found to view PDF files on this device. Tap on the document to view as PDF."
      );
    }
  };

  // PDF viewer options
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  console.log("filePath", filePath);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* Removed file icon, replaced with nothing */}
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setMoreOptionsVisible(true)}
            style={styles.headerButton}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{getFileName(filePath)} PDF</Text>
      </View>
      <View style={styles.pdfContainer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={0.9}
          onPress={() => {}}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            horizontal={false}
            showsVerticalScrollIndicator
            maximumZoomScale={3}
            minimumZoomScale={0.5}
            scrollEnabled
          >
            {isPdf(filePath) &&
              !loading &&
              !error &&
              (Platform.OS === "android" ? (
                <Pdf
                  source={{ uri: filePath }}
                  style={{ flex: 1, width: "100%", height: "100%" }}
                  onError={() => setError("Unable to display PDF.")}
                  onLoadComplete={() => setLoading(false)}
                  onPageChanged={() => {}}
                  onPressLink={(uri) => Linking.openURL(uri)}
                />
              ) : (
                <WebView
                  originWhitelist={["*"]}
                  source={{ html: pdfHtml }}
                  style={{ flex: 1, width: "100%", height: "100%" }}
                  scalesPageToFit={true}
                  bounces={false}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  renderError={() => (
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        marginTop: 20,
                      }}
                    >
                      Unable to display PDF.
                    </Text>
                  )}
                />
              ))}
          </ScrollView>
        </TouchableOpacity>
      </View>

      {/* New Bottom Action Bar: Share, Print, Copy Text, Delete */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={styles.bottomActionButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          <Text style={styles.bottomActionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomActionButton}
          onPress={handlePrint}
        >
          <Ionicons name="print-outline" size={20} color="#FFFFFF" />
          <Text style={styles.bottomActionText}>Print</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomActionButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.bottomActionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* More Options Modal */}
      <Modal
        visible={moreOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoreOptionsVisible(false)}
      >
        <TouchableOpacity
          style={styles.optionsBackdrop}
          activeOpacity={1}
          onPress={() => setMoreOptionsVisible(false)}
        >
          <View style={styles.optionsSheet}>
            <TouchableOpacity
              style={styles.optionsItem}
              onPress={handleViewInApp}
            >
              <Ionicons name="eye-outline" size={20} color="#222" />
              <Text style={styles.optionsText}>Open in another app</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionsItem} onPress={handleZoomIn}>
              <Ionicons name="add" size={20} color="#222" />
              <Text style={styles.optionsText}>Zoom In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionsItem}
              onPress={handleZoomOut}
            >
              <Ionicons name="remove" size={20} color="#222" />
              <Text style={styles.optionsText}>Zoom Out</Text>
            </TouchableOpacity>
            {/* Add more PDF viewer options here if needed */}
          </View>
        </TouchableOpacity>
      </Modal>

      <Text>DocumentDetailsScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  titleContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: "center",
  },
  titleText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pdfWebView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: COLORS.surface,
    fontSize: 16,
  },
  bottomActionBar: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomActionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  bottomActionButtonDisabled: {
    opacity: 0.5,
  },
  bottomActionText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  bottomActionTextDisabled: {
    color: "#666666",
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  optionsBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  optionsSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30, // Add some padding at the bottom for the close button
  },
  optionsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionsText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

export default DocumentDetailsScreen;
