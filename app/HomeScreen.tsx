import DocumentOptionsModal from "@/components/DocumentOptionsModal";
import HomeViewModal from "@/components/HomeViewModal";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // RECOMMENDED package
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { COLORS } from "./types";
import { getDefaultFilePrefix } from "../utils/storage";
// @ts-ignore
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import { Platform } from "react-native";
import ViewShot from "react-native-view-shot";
import { useRef } from "react";

interface Document {
  id: number;
  title: string;
  date: string;
  thumbnail: string;
  isLarge?: boolean;
  path: string; // Added path for navigation
}

/*

*/

// Utility to generate HTML for PDF preview (responsive to container)
const getPdfHtml = (base64: string) => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        html, body { 
          margin:0; 
          padding:0; 
          overflow:hidden; 
          background:#fff; 
          width:100%; 
          height:100%; 
        }
        embed { 
          width:100%; 
          height:100%; 
          object-fit:cover;
        }
      </style>
    </head>
    <body>
      <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
    </body>
  </html>
`;

const DoclynHomeScreen: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pdfPreviews, setPdfPreviews] = useState<{ [id: number]: string }>({});
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [defaultPrefix, setDefaultPrefix] = useState("");
  const [webViewHeight, setWebViewHeight] = useState(0);
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Multi-select state
  const [selectedOption, setSelectedOption] = useState<string>("viewAll"); // 'viewAll' by default
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set());

  // Reset selection when switching back to viewAll
  useEffect(() => {
    if (selectedOption === "viewAll") {
      setSelectedDocs(new Set());
    }
  }, [selectedOption]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const toggleDocSelection = (docId: number) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleCancelMultiSelect = () => {
    setSelectedOption("viewAll");
    setSelectedDocs(new Set());
  };

  const handleDeleteSelected = async () => {
    // Remove selected docs from AsyncStorage and state
    const idsToDelete = Array.from(selectedDocs);
    let saved = await AsyncStorage.getItem("SAVED_PDFS");
    let pdfs = saved ? JSON.parse(saved) : [];
    pdfs = pdfs.filter(
      (pdf: any, idx: number) => !idsToDelete.includes(idx + 1)
    );
    await AsyncStorage.setItem("SAVED_PDFS", JSON.stringify(pdfs));
    setDocuments((docs) => docs.filter((doc) => !selectedDocs.has(doc.id)));
    handleCancelMultiSelect();
  };

  const handleShareSelected = async () => {
    const docsToShare = documents.filter((doc) => selectedDocs.has(doc.id));
    if (docsToShare.length === 0) {
      handleCancelMultiSelect();
      return;
    }
    try {
      // If only one file, share directly
      if (docsToShare.length === 1) {
        await Sharing.shareAsync(docsToShare[0].path);
      } else {
        // For multiple files, share as an array (if supported)
        // Expo Sharing API does not support multiple files at once on all platforms
        // So share the first file and alert the user
        await Sharing.shareAsync(docsToShare[0].path);
        // Optionally, show a message to the user
        if (docsToShare.length > 1) {
          alert(
            "Sharing multiple files is not supported on all platforms. Only the first file was shared."
          );
        }
      }
    } catch (err) {
      console.error("Error sharing files:", err);
    }
    handleCancelMultiSelect();
  };

  // Load saved PDFs on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadSavedPdfs = async () => {
        const saved = await AsyncStorage.getItem("SAVED_PDFS");
        if (saved) {
          const pdfs = JSON.parse(saved);
          setDocuments(
            pdfs.map((pdf: any, idx: number) => ({
              id: idx + 1,
              title: pdf.name,
              date: pdf.date ? new Date(pdf.date).toLocaleDateString() : "",
              path: pdf.path,
            }))
          );
        } else {
          setDocuments([]);
        }
      };
      loadSavedPdfs();
    }, [])
  );

  // Load PDF previews as base64 for each document
  useFocusEffect(
    useCallback(() => {
      const loadPreviews = async () => {
        const previews: { [id: number]: string } = {};
        for (const doc of documents) {
          try {
            const base64 = await FileSystem.readAsStringAsync(doc.path, {
              encoding: FileSystem.EncodingType.Base64,
            });
            previews[doc.id] = getPdfHtml(base64);
          } catch (e) {
            previews[doc.id] = ""; // Use empty string on error
          }
        }
        setPdfPreviews(previews);
      };
      if (documents.length > 0) loadPreviews();
    }, [documents])
  );

  // Load default file prefix on mount
  useFocusEffect(
    useCallback(() => {
      const fetchPrefix = async () => {
        const prefix = await getDefaultFilePrefix();
        setDefaultPrefix(prefix || "");
      };
      fetchPrefix();
    }, [])
  );

  // Live search effect
  useEffect(() => {
    if (isSearching) {
      const q = searchQuery.trim().toLowerCase();
      if (q.length === 0) {
        setSearchResults([]);
        setSearchSubmitted(false);
        return;
      }
      // Rank by best match (simple: includes, then startsWith, then exact)
      const filtered = documents.filter((doc) =>
        doc.title.toLowerCase().includes(q)
      );
      setSearchResults(filtered);
    }
  }, [searchQuery, isSearching, documents]);

  // Button handler functions
  const handleSettingsclick = (): void => {
    router.push("/SettingsScreen");
  };

  const handleSearchClick = (): void => {
    router.push("/SearchScreen");
  };

  const handleFreeTrialClick = (): void => {
    console.log("Free trial button clicked");
  };

  const handleShareClick = async (docId: number) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    try {
      await Sharing.shareAsync(doc.path);
    } catch (err) {
      console.error("Error sharing file:", err);
    }
  };

  const handleViewClick = async (docId: number) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    // Only allow for PDFs
    if (!doc.path.toLowerCase().endsWith(".pdf")) return;
    try {
      // Try to open with the default app
      await Linking.openURL(doc.path);
    } catch (err) {
      Alert.alert(
        "No PDF Viewer",
        "No app found to view PDF files on this device."
      );
    }
  };

  const handleEditClick = (docId: number): void => {
    console.log(`Edit text button clicked for document ${docId}`);
  };

  // Ref for capturing the WebView as an image
  const viewShotRef = useRef<any>(null);
  const [captureDocId, setCaptureDocId] = useState<number | null>(null);
  const [readyToCapture, setReadyToCapture] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSaveAsJPEGClick = async (docId: number) => {
    setCaptureDocId(docId);
    setReadyToCapture(false);
    setIsCapturing(true);
    setWebViewHeight(0);
  };

  // Effect to capture and save when captureDocId is set and readyToCapture is true
  useEffect(() => {
    const doCapture = async () => {
      if (captureDocId === null || !readyToCapture || webViewHeight === 0)
        return;

      try {
        // Wait for WebView to be fully rendered with proper height
        await new Promise((res) => setTimeout(res, 1500));

        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync("Doclyn", asset, false);
          alert("Saved to gallery as image!");
        }
      } catch (err) {
        console.error("Error capturing and saving as image:", err);
        alert("Failed to save as image.");
      } finally {
        setCaptureDocId(null);
        setReadyToCapture(false);
        setIsCapturing(false);
        setWebViewHeight(0);
      }
    };
    if (captureDocId !== null && readyToCapture && webViewHeight > 0)
      doCapture();
  }, [captureDocId, readyToCapture, webViewHeight]);

  const handleDocumentClick = (docId: number): void => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      router.push({
        pathname: "/DocumentDetailsScreen",
        params: { imagePath: doc.path },
      });
    }
  };

  const handleCameraClick = (): void => {
    console.log("Camera button clicked");
    router.push("/ScanScreen");
  };

  const handleGalleryClick = (): void => {
    console.log("Gallery button clicked");
    router.push("/GalleryScreen");
  };

  const renderDocumentItem = (doc: Document) => {
    const isMultiSelect = selectedOption === "selectMultiple";
    const isSelected = selectedDocs.has(doc.id);
    // Ensure the prefix is present in the displayed name
    let displayName = doc.title;
    // If user has set a prefix, strip any IMG prefix from the name
    if (defaultPrefix && displayName) {
      displayName = displayName.replace(/^IMG[_-]?/i, "");
      if (!displayName.startsWith(defaultPrefix)) {
        displayName = `${defaultPrefix}${displayName}`;
      }
    }
    // If no user prefix and name does not start with IMG, fallback to Scan
    if (!defaultPrefix && displayName && !/^IMG[_-]?/i.test(displayName)) {
      displayName = `Scan${displayName}`;
    }
    return (
      <View key={doc.id} style={styles.documentContainer}>
        <TouchableOpacity
          onPress={() =>
            isMultiSelect
              ? toggleDocSelection(doc.id)
              : handleDocumentClick(doc.id)
          }
          style={[
            styles.documentImageContainer,
            isMultiSelect &&
              isSelected && { borderColor: COLORS.brand, borderWidth: 2 },
          ]}
        >
          {isMultiSelect && (
            <View
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                zIndex: 2,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: isSelected
                  ? COLORS.brand
                  : COLORS.surfaceSecondary,
                borderWidth: 1,
                borderColor: isSelected ? COLORS.brand : COLORS.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
          )}
          {/* PDF Preview using WebView with base64 HTML */}
          {pdfPreviews[doc.id] ? (
            <WebView
              originWhitelist={["*"]}
              source={{ html: pdfPreviews[doc.id] }}
              style={styles.documentImage}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderError={() => (
                <View style={styles.documentImage}>
                  <Text>Preview unavailable</Text>
                </View>
              )}
              scrollEnabled={false}
            />
          ) : (
            <View
              style={[
                styles.documentImage,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text>Loading...</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{displayName}</Text>
          <Text style={styles.documentDate}>{doc.date}</Text>
          <View style={styles.documentActions}>
            <TouchableOpacity onPress={() => handleShareClick(doc.id)}>
              <Ionicons
                name="share-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            {/* View option for opening with another app */}
            <TouchableOpacity onPress={() => handleViewClick(doc.id)}>
              <Ionicons
                name="eye-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSaveAsJPEGClick(doc.id)}>
              <Ionicons
                name="image-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            {/* More options button restored */}
            <TouchableOpacity
              onPress={() => {
                setSelectedDocument(doc);
                setItemModalVisible(true);
              }}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Top app bar logic
  const renderAppBar = () => {
    if (isSearching) {
      return (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setIsSearching(false);
              setSearchQuery("");
              setSearchResults([]);
              setSearchSubmitted(false);
            }}
            style={styles.headerButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          <View style={[styles.searchContainer, { flex: 1, marginLeft: 8 }]}>
            {!searchSubmitted ? (
              <TextInput
                style={styles.searchInput}
                placeholder="Search PDFs by name"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                onSubmitEditing={() => setSearchSubmitted(true)}
                returnKeyType="search"
              />
            ) : (
              <Text style={styles.searchInput} numberOfLines={1}>
                {searchQuery}
              </Text>
            )}
          </View>
        </View>
      );
    }
    if (selectedOption === "selectMultiple") {
      return (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Items</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleShareSelected}
              style={styles.headerButton}
            >
              <Ionicons
                name="share-outline"
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteSelected}
              style={styles.headerButton}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancelMultiSelect}
              style={styles.headerButton}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    // Normal app bar
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSettingsclick}>
          <View style={styles.profileButton}>
            <Ionicons name="person-circle" size={32} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doclyn</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setIsSearching(true)}
            style={styles.headerButton}
          >
            <Ionicons name="search" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {/* More options button restored */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.headerButton}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render document list (filtered or not)
  const docsToShow = isSearching
    ? searchSubmitted
      ? searchResults
      : searchResults.length > 0
      ? searchResults
      : []
    : documents;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {renderAppBar()}
      {/* HomeViewModal restored */}
      <HomeViewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
      />
      {/* Documents List */}
      <ScrollView
        style={[styles.documentsContainer, styles.docContainer]}
        showsVerticalScrollIndicator={false}
      >
        {docsToShow.length === 0 ? (
          <View style={styles.noDocumentsContainer}>
            <Text style={styles.noDocumentsText}>
              {isSearching && searchQuery
                ? "No results found."
                : "No saved PDFs found."}
            </Text>
          </View>
        ) : (
          docsToShow.map((doc) => renderDocumentItem(doc))
        )}
      </ScrollView>

      {/* Loading bar for background capture */}
      {isCapturing && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: "rgba(0,0,0,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.brand} />
          <Text style={{ color: COLORS.textPrimary, marginTop: 10 }}>
            Saving image to gallery...
          </Text>
        </View>
      )}

      {/* Hidden ViewShot and WebView for PDF-to-image capture */}
      {captureDocId !== null &&
        (() => {
          const doc = documents.find((d) => d.id === captureDocId);
          if (!doc || !pdfPreviews[doc.id]) return null;

          return (
            <View
              style={{
                position: "absolute",
                left: -9999,
                width: 400,
                height: 600,
              }}
            >
              <ViewShot
                ref={viewShotRef}
                options={{ format: "jpg", quality: 0.95 }}
              >
                <View
                  style={{ width: 400, height: 600, backgroundColor: "#fff" }}
                >
                  <WebView
                    originWhitelist={["*"]}
                    source={{ html: pdfPreviews[doc.id] }}
                    style={{ width: 400, height: 600 }}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState={false}
                    scrollEnabled={false}
                    onLoadEnd={() => {
                      // Inject JavaScript to get actual content height
                      const script = `
                (function() {
                  const height = Math.max(
                    document.body.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.clientHeight,
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight
                  );
                  window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', value: height}));
                })();
              `;
                      if (viewShotRef.current) {
                        setTimeout(() => {
                          // Use injectedJavaScript or send message to check height
                          setWebViewHeight(600); // Fallback to container height
                          setTimeout(() => setReadyToCapture(true), 800);
                        }, 800);
                      }
                    }}
                    onMessage={(event) => {
                      try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.type === "height" && data.value > 0) {
                          setWebViewHeight(data.value);
                        }
                      } catch (e) {
                        console.log("Message parsing error:", e);
                      }
                    }}
                    onError={() => {
                      console.error("WebView error during capture");
                      setIsCapturing(false);
                      setCaptureDocId(null);
                      setWebViewHeight(0);
                    }}
                  />
                </View>
              </ViewShot>
            </View>
          );
        })()}

      <DocumentOptionsModal
        visible={itemModalVisible}
        onClose={() => setItemModalVisible(false)}
        document={selectedDocument}
        onDocumentChange={(updated, deleted) => {
          if (deleted) {
            setDocuments((docs) =>
              docs.filter((doc) => doc.id !== selectedDocument?.id)
            );
            setItemModalVisible(false);
            setSelectedDocument(null);
          } else if (updated) {
            setDocuments((docs) =>
              docs.map((doc) =>
                doc.id === updated.id ? { ...doc, title: updated.title } : doc
              )
            );
            setSelectedDocument(updated);
          }
        }}
      />

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleCameraClick}
        >
          <Ionicons name="camera" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handleGalleryClick}
        >
          <Ionicons name="images" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  docContainer: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.brand,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
  },
  documentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  documentContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  documentImageContainer: {
    marginRight: 12,
    width: 80,
    height: 100,
  },
  documentImage: {
    width: 80,
    height: 100,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  documentInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  documentTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  documentDate: {
    color: COLORS.textTertiary,
    fontSize: 14,
    marginBottom: 12,
  },
  documentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editIconContainer: {
    position: "relative",
  },
  premiumBadge: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  cameraButton: {
    backgroundColor: COLORS.brand,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryButton: {
    backgroundColor: COLORS.brand,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  noDocumentsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  noDocumentsText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
});

export default DoclynHomeScreen;
