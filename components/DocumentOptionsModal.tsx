import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Document {
  id: number;
  title: string;
  date: string;
  thumbnail: string;
  isLarge?: boolean;
}

interface DocumentOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  document: Document | null;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const DocumentOptionsModal: React.FC<DocumentOptionsModalProps> = ({
  visible,
  onClose,
  document,
}) => {
  if (!document) return null;

  const handleOptionPress = (option: string) => {
    console.log(`${option} pressed for document ${document.id}`);
    // Handle different options here
    // For now, just log and close modal for most options
    if (option !== "Edit text") {
      onClose();
    }
  };

  const menuItems = [
    {
      icon: "cloud-download-outline",
      label: "Copy to device",
      action: () => handleOptionPress("Copy to device"),
    },
    {
      icon: "copy-outline",
      label: "Copy to...",
      action: () => handleOptionPress("Copy to..."),
    },
    {
      icon: "document-text-outline",
      label: "Export PDF",
      action: () => handleOptionPress("Export PDF"),
      hasBlueIcon: true,
    },
    {
      icon: "albums-outline",
      label: "Combine files",
      action: () => handleOptionPress("Combine files"),
      hasBlueIcon: true,
    },
    {
      icon: "lock-closed-outline",
      label: "Set password",
      action: () => handleOptionPress("Set password"),
      hasBlueIcon: true,
    },
    {
      icon: "compress-outline",
      label: "Compress PDF",
      action: () => handleOptionPress("Compress PDF"),
      hasBlueIcon: true,
    },
    {
      icon: "scan-outline",
      label: "Modify scan",
      action: () => handleOptionPress("Modify scan"),
    },
    {
      icon: "pencil-outline",
      label: "Rename",
      action: () => handleOptionPress("Rename"),
    },
    {
      icon: "folder-outline",
      label: "Move",
      action: () => handleOptionPress("Move"),
    },
    {
      icon: "print-outline",
      label: "Print",
      action: () => handleOptionPress("Print"),
    },
    {
      icon: "trash-outline",
      label: "Delete",
      action: () => handleOptionPress("Delete"),
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          {/* Gray top bar */}
          <View style={styles.topBar} />

          {/* File Info */}
          <View style={styles.fileInfo}>
            <Image
              source={{ uri: document.thumbnail }}
              style={styles.smallThumbnail}
            />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>photo</Text>
              <Text style={styles.fileSize}>{document.date} • 202 KB</Text>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView>
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.action}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={item.hasBlueIcon ? "#008080" : "#333333"}
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuText}>{item.label}</Text>
                  {item.hasBlueIcon && (
                    <Ionicons
                      name="add-circle"
                      size={16}
                      color="#008080"
                      style={styles.plusIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: screenHeight * (2 / 3), // 2/3 of screen height
    paddingBottom: 34, // Safe area padding for bottom
  },
  topBar: {
    height: 5,
    backgroundColor: "#666",
    marginHorizontal: screenWidth * 0.4,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 3,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#2a2a2a",
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  smallThumbnail: {
    width: 40,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 14,
    color: "#999",
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
  },
  menuText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  plusIcon: {
    marginLeft: 8,
  },
});

export default DocumentOptionsModal;
