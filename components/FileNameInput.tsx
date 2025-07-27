import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FileNameInputProps {
  currentFileName: string;
  onFileNameUpdate: (fileName: string) => void;
  title?: string;
  message?: string;
  placeholder?: string;
}

// Custom Android Modal Component
const AndroidFileNameModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  currentFileName,
  placeholder,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  title: string;
  message: string;
  currentFileName: string;
  placeholder?: string;
}) => {
  const [inputText, setInputText] = useState(currentFileName);

  const handleConfirm = () => {
    const newFileName = inputText ? inputText.trim() : "";
    onConfirm(newFileName);
    onClose();
  };

  const handleCancel = () => {
    setInputText(currentFileName); // Reset to original value
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={placeholder}
            autoFocus
            selectTextOnFocus
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Export as a hook-like function
export const useFileNameInput = (props: FileNameInputProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const showFileNamePrompt = () => {
    if (Platform.OS === "ios") {
      // Use native iOS Alert.prompt
      Alert.prompt(
        props.title || "Default File Name",
        props.message || "Enter the default name for your scanned files:",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log("File name input cancelled"),
          },
          {
            text: "OK",
            onPress: (inputText) => {
              const newFileName = inputText ? inputText.trim() : "";
              // Allow empty string as valid (no prefix)
              props.onFileNameUpdate(newFileName);
              console.log("New file name entered:", newFileName);
            },
          },
        ],
        "plain-text",
        props.currentFileName
      );
    } else {
      // Use custom modal for Android
      setModalVisible(true);
    }
  };

  const handleModalConfirm = (fileName: string) => {
    props.onFileNameUpdate(fileName);
    console.log("New file name entered:", fileName);
  };

  const FileNameInputModal = () => (
    <AndroidFileNameModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      onConfirm={handleModalConfirm}
      title={props.title || "Default File Name"}
      message={
        props.message || "Enter the default name for your scanned files:"
      }
      currentFileName={props.currentFileName}
      placeholder={props.placeholder}
    />
  );

  return { showFileNamePrompt, FileNameInputModal };
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1c1c1e",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
    color: "#ffffff",
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#a1a1a6",
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#38383a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#2c2c2e",
    color: "#ffffff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#48484a",
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    marginLeft: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
});

// No default export; use the hook instead.
