import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import Constants from "expo-constants";
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
  Image,
} from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "./types";

import { ToastMessage } from "../components/Toast";

const { width, height } = Dimensions.get("window");

function isPdf(path: string) {
  return path && path.toLowerCase().endsWith(".pdf");
}

interface SavedDocument {
  name: string;
  imagePath: string;
  pdfPath: string;
  date: string;
  ocrText?: string;
}

const DocumentDetailsScreen = () => {
  const router = useRouter();
  let { imagePath, pdfPath } = useLocalSearchParams();

  // Handle both imagePath and pdfPath parameters
  let imgPath = imagePath;
  let pdfP = pdfPath;
  if (Array.isArray(imgPath)) imgPath = imgPath[0];
  if (Array.isArray(pdfP)) pdfP = pdfP[0];

  // Fallback: if only pdfPath is provided, try to infer imagePath from storage
  const [imageUri, setImageUri] = useState<string | null>(imgPath || null);
  const [pdfUri, setPdfUri] = useState<string | null>(pdfP || null);

  useEffect(() => {
    // If imagePath is missing but pdfPath is present, try to find the imagePath from storage
    if (!imgPath && pdfP) {
      (async () => {
        const saved = await AsyncStorage.getItem("SAVED_PDFS");
        if (saved) {
          const docs = JSON.parse(saved);
          const found = docs.find((doc: any) => doc.pdfPath === pdfP);
          if (found && found.imagePath) setImageUri(found.imagePath);
        }
      })();
    }
    if (!pdfP && imgPath) {
      (async () => {
        const saved = await AsyncStorage.getItem("SAVED_PDFS");
        if (saved) {
          const docs = JSON.parse(saved);
          const found = docs.find((doc: any) => doc.imagePath === imgPath);
          if (found && found.pdfPath) setPdfUri(found.pdfPath);
        }
      })();
    }
  }, [imgPath, pdfP]);

  const [pdfHtml, setPdfHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [webViewError, setWebViewError] = useState(false);
  const isExpoGo = Constants.appOwnership === "expo";

  // Get the actual document name from storage
  const [documentName, setDocumentName] = useState<string>("Document");

  useEffect(() => {
    const getDocumentName = async () => {
      try {
        const saved = await AsyncStorage.getItem("SAVED_PDFS");
        if (saved) {
          const docs = JSON.parse(saved);
          const found = docs.find((doc: any) => 
            doc.pdfPath === pdfUri || doc.imagePath === imageUri
          );
          if (found && found.name) {
            // Use the stored name as-is (don't modify it)
            setDocumentName(found.name);
          }
        }
      } catch (error) {
        console.error("Error getting document name:", error);
      }
    };
    
    if (pdfUri || imageUri) {
      getDocumentName();
    }
  }, [pdfUri, imageUri]);

  useEffect(() => {
    if (isPdf(pdfUri || "")) {
      setLoading(true);
      setWebViewError(false);
      const loadPdf = async () => {
        try {
          const base64 = await FileSystem.readAsStringAsync(pdfUri || "", {
            encoding: FileSystem.EncodingType.Base64,
          });

          // For both platforms, try the embed approach first
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
                  .android-fallback {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    color: white;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                  }
                  .open-button {
                    background: #007AFF;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    margin-top: 20px;
                    cursor: pointer;
                  }
                </style>
                <script>
                  // Check if PDF loaded successfully on Android
                  window.addEventListener('load', function() {
                    ${
                      Platform.OS === "android"
                        ? `
                      setTimeout(function() {
                        // If we're on Android and the embed didn't work, show fallback
                        var embed = document.querySelector('embed');
                        if (!embed || embed.offsetHeight === 0) {
                          document.body.innerHTML = \`
                            <div class="android-fallback">
                              <h3>PDF Ready to View</h3>
                              <p>This PDF will open in your device's PDF viewer for the best experience.</p>
                              <button class="open-button" onclick="window.ReactNativeWebView.postMessage('OPEN_EXTERNAL')">
                                Open PDF
                              </button>
                            </div>
                          \`;
                        }
                      }, 2000);
                    `
                        : ""
                    }
                  });
                </script>
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
  }, [pdfUri]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      if (pdfUri) {
        await Sharing.shareAsync(pdfUri);
      }
    } catch (err) {
      Alert.alert("Share Failed", "Unable to share this PDF.");
    }
  };

  const handlePrint = async () => {
    try {
      if (pdfUri) {
        await Print.printAsync({ uri: pdfUri });
      }
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
            let docs = saved ? JSON.parse(saved) : [];
            docs = docs.filter((doc: any) => doc.pdfPath !== pdfUri);
            await AsyncStorage.setItem("SAVED_PDFS", JSON.stringify(docs));
            // Remove files from file system
            if (pdfUri) await FileSystem.deleteAsync(pdfUri, { idempotent: true });
            if (imageUri) await FileSystem.deleteAsync(imageUri, { idempotent: true });
            router.replace("/HomeScreen");
          } catch (err) {
            Alert.alert("Delete Failed", "Unable to delete this document.");
          }
        },
      },
    ]);
  };

  // FIXED: Open PDF in external app
  const handleViewInApp = async () => {
    try {
      if (pdfUri) {
        // Check if file exists first
        const fileInfo = await FileSystem.getInfoAsync(pdfUri);
        if (!fileInfo.exists) {
          Alert.alert("File Not Found", "The PDF file could not be found.");
          return;
        }

        // Try to open the PDF file directly
        const canOpen = await Linking.canOpenURL(pdfUri);
        if (canOpen) {
          await Linking.openURL(pdfUri);
        } else {
          // If direct opening fails, try using file:// scheme
          const fileUrl = pdfUri.startsWith('file://') ? pdfUri : `file://${pdfUri}`;
          await Linking.openURL(fileUrl);
        }
      } else {
        Alert.alert("No PDF Available", "No PDF file is available to open.");
      }
    } catch (err) {
      console.error("Error opening PDF in external app:", err);
      Alert.alert(
        "No PDF Viewer Found",
        "No app found to view PDF files on this device. Please install a PDF viewer app from the app store."
      );
    }
  };

  // FIXED: Implement actual zoom in functionality
  const handleZoomIn = () => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(prevZoom + 0.2, 3); // Max zoom 3x
      console.log(`Zooming in: ${prevZoom} -> ${newZoom}`);
      return newZoom;
    });
  };

  // FIXED: Implement actual zoom out functionality
  const handleZoomOut = () => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(prevZoom - 0.2, 0.5); // Min zoom 0.5x
      console.log(`Zooming out: ${prevZoom} -> ${newZoom}`);
      return newZoom;
    });
  };

  console.log("filePath", pdfUri);

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

      {/* PDF Title - Use stored document name without extension */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{documentName}</Text>
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
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain",
                  transform: [{ scale: zoom }]  // FIXED: Apply zoom transform
                }}
              />
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
                <Text style={{ color: "white", textAlign: "center", marginBottom: 20, fontSize: 16 }}>
                  Unable to display image.
                </Text>
              </View>
            )}
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
              onPress={() => {
                setMoreOptionsVisible(false);
                handleViewInApp();
              }}
            >
              <Ionicons name="eye-outline" size={20} color="#222" />
              <Text style={styles.optionsText}>Open in another app</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.optionsItem} 
              onPress={() => {
                setMoreOptionsVisible(false);
                handleZoomIn();
              }}
            >
              <Ionicons name="add" size={20} color="#222" />
              <Text style={styles.optionsText}>Zoom In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionsItem}
              onPress={() => {
                setMoreOptionsVisible(false);
                handleZoomOut();
              }}
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
    paddingBottom: 30,
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