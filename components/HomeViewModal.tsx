// components/ModalExample.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ModalOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}

type HomeViewModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedOption: string;
  onSelectOption: (optionId: string) => void;
};

const HomeViewModal: React.FC<HomeViewModalProps> = ({ visible, onClose, selectedOption, onSelectOption }) => {

  const options: ModalOption[] = [
    { id: "viewAll", icon: "list-outline", title: "View all scans" },
    {
      id: "selectMultiple",
      icon: "checkbox-outline",
      title: "Select multiple items",
    },
  ];

  const handleOptionPress = (optionId: string) => {
    if (optionId === "viewAll" || optionId === "selectMultiple") {
      onSelectOption(optionId);
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.bottomSheetContainer}>
          <View style={styles.modalContent}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionRow}
                onPress={() => handleOptionPress(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.leftContent}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={selectedOption === option.id ? "#008080" : "#B0B0B0"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === option.id && styles.selectedText,
                    ]}
                  >
                    {option.title}
                  </Text>
                </View>
                {selectedOption === option.id && (
                  <Ionicons name="checkmark" size={16} color="#008080" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.bottomIndicator}></View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default HomeViewModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#232323",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: "100%",
    maxWidth: 400,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
    fontWeight: "400",
  },
  selectedText: {
    color: "#008080",
  },
  bottomIndicator: {
    alignItems: "center",
    paddingBottom: 16,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },

  bottomSheetContainer: {
    backgroundColor: "#232323",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
});
