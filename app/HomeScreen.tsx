import DocumentOptionsModal from "@/components/DocumentOptionsModal";
import HomeViewModal from "@/components/HomeViewModal";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // RECOMMENDED package

interface Document {
  id: number;
  title: string;
  date: string;
  thumbnail: string;
  isLarge?: boolean;
}

const DoclynHomeScreen: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  // Sample data - in real app this would come from database
  const [documents] = useState<Document[]>([
    {
      id: 1,
      title: "Book 19 May 2025",
      date: "5/19/25",
      thumbnail:
        "https://via.placeholder.com/200x250/f0f0f0/333333?text=Document+1",
      isLarge: true,
    },
    {
      id: 2,
      title: "Doclyn 19 May 2025",
      date: "5/19/25",
      thumbnail:
        "https://via.placeholder.com/150x200/f0f0f0/333333?text=Document+2",
      isLarge: false,
    },
  ]);

  // Button handler functions
  const handleSettingsclick = (): void => {
    router.push("/SettingsScreen");
  };

  const handleSearchClick = (): void => {
    router.push("/SearchScreen");
  };

  const handleMoreClick = (): void => {
    setModalVisible(true);
  };

  const handleFreeTrialClick = (): void => {
    console.log("Free trial button clicked");
  };

  const handleShareClick = (docId: number): void => {
    console.log(`Share button clicked for document ${docId}`);
  };

  const handleEditClick = (docId: number): void => {
    console.log(`Edit text button clicked for document ${docId}`);
  };

  const handleSaveAsJPEGClick = (docId: number): void => {
    console.log(`Save as JPEG button clicked for document ${docId}`);
  };

  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const handleMoreOptionsClick = (docId: number): void => {
    console.log(`More options button clicked for document ${docId}`);

    // Find the document and show modal
    const document = documents.find((doc) => doc.id === docId);
    if (document) {
      setSelectedDocument(document);
      setItemModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocument(null);
  };

  const handleDocumentClick = (docId: number): void => {
    console.log(`Document ${docId} clicked - navigating to document view`);
    router.push("/PhotoDetailsScreen");
  };

  const handleCameraClick = (): void => {
    console.log("Camera button clicked");
    router.push("/ScanScreen");
  };

  const handleGalleryClick = (): void => {
    console.log("Gallery button clicked");
    router.push("/GalleryScreen");
  };

  const renderDocumentItem = (doc: Document) => (
    <View key={doc.id} style={styles.documentContainer}>
      <TouchableOpacity
        onPress={() => handleDocumentClick(doc.id)}
        style={styles.documentImageContainer}
      >
        <Image source={{ uri: doc.thumbnail }} style={styles.documentImage} />
      </TouchableOpacity>

      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>{doc.title}</Text>
        <Text style={styles.documentDate}>{doc.date}</Text>

        <View style={styles.documentActions}>
          <TouchableOpacity onPress={() => handleShareClick(doc.id)}>
            <Ionicons name="share-outline" size={20} color="#333333" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleEditClick(doc.id)}>
            <View style={styles.editIconContainer}>
              <Ionicons name="create-outline" size={20} color="#333333" />
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={8} color="#4CAF50" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSaveAsJPEGClick(doc.id)}>
            <Ionicons name="image-outline" size={20} color="#333333" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleMoreOptionsClick(doc.id)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSettingsclick}>
          <View style={styles.profileButton}>
            <Ionicons name="person-circle" size={32} color="#008080" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Doclyn</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleSearchClick}
            style={styles.headerButton}
          >
            <Ionicons name="search" size={24} color="#333333" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMoreClick}
            style={styles.headerButton}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>
      <HomeViewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      {/* Premium Banner */}
      <View style={styles.premiumBanner}>
        <Text style={styles.premiumText}>Unlock premium features</Text>
        <TouchableOpacity
          style={styles.freeTrialButton}
          onPress={handleFreeTrialClick}
        >
          <Text style={styles.freeTrialText}>Free trial</Text>
        </TouchableOpacity>
      </View>

      {/* Documents List */}
      <ScrollView
        style={[styles.documentsContainer, styles.docContainer]}
        showsVerticalScrollIndicator={false}
      >
        {documents.map((doc) => renderDocumentItem(doc))}
      </ScrollView>

      <DocumentOptionsModal
        visible={itemModalVisible}
        onClose={closeModal}
        document={selectedDocument}
      />

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleCameraClick}
        >
          <Ionicons name="camera" size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handleGalleryClick}
        >
          <Ionicons name="images" size={24} color="#ffffff" />
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
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#008080",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#008080",
  },
  premiumText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  freeTrialButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  freeTrialText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  documentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  documentContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  documentImageContainer: {
    marginRight: 12,
  },
  documentImage: {
    width: 80,
    height: 100,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  documentInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  documentTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  documentDate: {
    color: "#666666",
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
    backgroundColor: "#008080",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryButton: {
    backgroundColor: "#008080",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DoclynHomeScreen;
