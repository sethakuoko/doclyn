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
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { COLORS } from "./types";
import { getDefaultFilePrefix } from "../utils/storage";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import { Platform } from "react-native";
import ViewShot from "react-native-view-shot";
import { useRef } from "react";
import type { SavedDocument } from "./types";

// Utility to get display name based on current prefix rules
const getDisplayName = (originalName: string, currentPrefix: string) => {
  // Return the original name as-is (don't modify existing saved names)
  return originalName;
};

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
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [pdfPreviews, setPdfPreviews] = useState<{ [pdfPath: string]: string }>({});
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SavedDocument | null>(null);
  const [defaultPrefix, setDefaultPrefix] = useState("");
  const [webViewHeight, setWebViewHeight] = useState(0);
  
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SavedDocument[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Multi-select state
  const [selectedOption, setSelectedOption] = useState<string>("viewAll");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // Reset selection when switching back to viewAll
  useEffect(() => {
    if (selectedOption === "viewAll") {
      setSelectedDocs(new Set());
    }
  }, [selectedOption]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const toggleDocSelection = (pdfPath: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(pdfPath)) next.delete(pdfPath);
      else next.add(pdfPath);
      return next;
    });
  };

  const handleCancelMultiSelect = () => {
    setSelectedOption("viewAll");
    setSelectedDocs(new Set());
  };

  const handleDeleteSelected = async () => {
    const pdfPathsToDelete = Array.from(selectedDocs);
    let saved = await AsyncStorage.getItem("SAVED_PDFS");
    let docs = saved ? JSON.parse(saved) : [];
    docs = docs.filter((doc: any) => !pdfPathsToDelete.includes(doc.pdfPath));
    await AsyncStorage.setItem("SAVED_PDFS", JSON.stringify(docs));
    setDocuments((docs) => docs.filter((doc) => !selectedDocs.has(doc.pdfPath)));
    handleCancelMultiSelect();
  };

  const handleShareSelected = async () => {
    const docsToShare = documents.filter((doc) => selectedDocs.has(doc.pdfPath));
    if (docsToShare.length === 0) {
      handleCancelMultiSelect();
      return;
    }
    try {
      if (docsToShare.length === 1) {
        await Sharing.shareAsync(docsToShare[0].pdfPath);
      } else {
        await Sharing.shareAsync(docsToShare[0].pdfPath);
        if (docsToShare.length > 1) {
          Alert.alert("Multiple file sharing is not supported on all platforms.");
        }
      }
    } catch (err) {
      console.error("Error sharing file:", err);
    }
    handleCancelMultiSelect();
  };

  // Load saved PDFs on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadSavedPdfs = async () => {
        const saved = await AsyncStorage.getItem("SAVED_PDFS");
        if (saved) {
          const docs = JSON.parse(saved);
          setDocuments(
            docs.map((doc: any) => ({
              name: doc.name,
              imagePath: doc.imagePath,
              pdfPath: doc.pdfPath,
              date: doc.date ? new Date(doc.date).toLocaleDateString() : "",
              ocrText: doc.ocrText,
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
        const previews: { [pdfPath: string]: string } = {};
        for (const doc of documents) {
          try {
            const base64 = await FileSystem.readAsStringAsync(doc.pdfPath, {
              encoding: FileSystem.EncodingType.Base64,
            });
            previews[doc.pdfPath] = getPdfHtml(base64);
          } catch (e) {
            previews[doc.pdfPath] = "";
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
      const filtered = documents.filter((doc) =>
        doc.name.toLowerCase().includes(q)
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

  const handleShareClick = async (pdfPath: string) => {
    const doc = documents.find((d) => d.pdfPath === pdfPath);
    if (!doc) return;
    try {
      await Sharing.shareAsync(doc.pdfPath);
    } catch (err) {
      console.error("Error sharing file:", err);
    }
  };

  const handleViewClick = async (pdfPath: string) => {
    const doc = documents.find((d) => d.pdfPath === pdfPath);
    if (!doc) return;
    try {
      await Linking.openURL(doc.pdfPath);
    } catch (err) {
      Alert.alert("No PDF Viewer", "No app found to view PDF files on this device.");
    }
  };

  const handleEditClick = (pdfPath: string): void => {
    console.log(`Edit text button clicked for document ${pdfPath}`);
  };

  // Ref for capturing the WebView as an image
  const viewShotRef = useRef<any>(null);
  const [captureDocId, setCaptureDocId] = useState<string | null>(null);
  const [readyToCapture, setReadyToCapture] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSaveAsJPEGClick = async (pdfPath: string) => {
    setCaptureDocId(pdfPath);
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
        await new Promise((res) => setTimeout(res, 1500));

        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync("Doclyn", asset, false);
          Alert.alert("Saved to gallery as image!");
        }
      } catch (err) {
        console.error("Error capturing and saving as image:", err);
        Alert.alert("Failed to save as image.");
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

  const handleDocumentClick = (pdfPath: string): void => {
    const doc = documents.find((d) => d.pdfPath === pdfPath);
    if (doc) {
      router.push({
        pathname: "/DocumentDetailsScreen",
        params: { imagePath: doc.imagePath },
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

  const renderDocumentItem = (doc: SavedDocument, idx: number) => {
    const isMultiSelect = selectedOption === "selectMultiple";
    const isSelected = selectedDocs.has(doc.pdfPath);
    
    // Use the stored name as-is (don't modify existing names)
    const displayName = getDisplayName(doc.name, defaultPrefix);

    return (
      <View key={doc.pdfPath || idx} style={styles.documentContainer}>
        <TouchableOpacity
          onPress={() =>
            isMultiSelect
              ? toggleDocSelection(doc.pdfPath)
              : handleDocumentClick(doc.pdfPath)
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
          {doc.imagePath ? (
            <Image
              source={{ uri: doc.imagePath }}
              style={styles.documentImage}
              resizeMode="cover"
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
            <TouchableOpacity onPress={() => handleShareClick(doc.pdfPath)}>
              <Ionicons
                name="share-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleViewClick(doc.pdfPath)}>
              <Ionicons
                name="eye-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSaveAsJPEGClick(doc.pdfPath)}>
              <Ionicons
                name="image-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
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
          docsToShow.map((doc, idx) => renderDocumentItem(doc, idx))
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
          const doc = documents.find((d) => d.pdfPath === captureDocId);
          if (!doc || !pdfPreviews[doc.pdfPath]) return null;

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
                    source={{ html: pdfPreviews[doc.pdfPath] }}
                    style={{ width: 400, height: 600 }}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState={false}
                    scrollEnabled={false}
                    onLoadEnd={() => {
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
                          setWebViewHeight(600);
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
            setDocuments((docs) => docs.filter((doc) => doc.pdfPath !== (selectedDocument?.pdfPath || "")));
            setSelectedDocument(null);
            setItemModalVisible(false);
          } else if (updated) {
            setDocuments((docs) => docs.map((doc) => doc.pdfPath === updated.pdfPath ? updated : doc));
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