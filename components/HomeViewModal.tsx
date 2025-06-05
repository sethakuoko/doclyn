// components/ModalExample.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ModalOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}

type HomeViewModalProps = {
  visible: boolean;
  onClose: () => void;
};

const HomeViewModal: React.FC<HomeViewModalProps> = ({ visible, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string>("viewAll");

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
      setSelectedOption(optionId);
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
                    color={selectedOption === option.id ? "#3B82F6" : "#FFFFFF"}
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
                  <Ionicons name="checkmark" size={16} color="#3B82F6" />
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
    backgroundColor: "#1F2937",
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
    color: "#FFFFFF",
    marginLeft: 12,
    fontWeight: "400",
  },
  selectedText: {
    color: "#3B82F6",
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
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
});
