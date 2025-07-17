import { Alert } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import Toast from "react-native-toast-message";

export const handleResize = (currentImageUri: string, setEditState: any) => {
  Alert.alert(
    "Resize Image",
    "Select new dimensions:",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Portrait (720x1280)", onPress: () => resizeImage(720, 1280, currentImageUri, setEditState) },
      { text: "Landscape (1280x720)", onPress: () => resizeImage(1280, 720, currentImageUri, setEditState) },
      { text: "A4 Portrait (2480x3508)", onPress: () => resizeImage(2480, 3508, currentImageUri, setEditState) },
      { text: "A4 Landscape (3508x2480)", onPress: () => resizeImage(3508, 2480, currentImageUri, setEditState) },
      { text: "Default (Original Size)", onPress: () => resetToOriginal(currentImageUri, setEditState) },
    ]
  );
};

const resizeImage = async (newWidth: number, newHeight: number, currentImageUri: string, setEditState: any) => {
  if (!currentImageUri) {
    Toast.show({
      type: "error",
      text1: "No image to resize",
    });
    return;
  }
  
  setEditState((prev: any) => ({ ...prev, isProcessing: true }));
  
  try {
    const result = await ImageManipulator.manipulateAsync(
      currentImageUri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    setEditState((prev: any) => ({
      ...prev,
      currentImageUri: result.uri,
      isProcessing: false,
    }));
    
    Toast.show({
      type: "success",
      text1: `Image resized to ${newWidth}x${newHeight}`,
    });
  } catch (error) {
    console.error("Resize error:", error);
    setEditState((prev: any) => ({ ...prev, isProcessing: false }));
    Toast.show({
      type: "error",
      text1: "Failed to resize image",
      text2: "Please try again",
    });
  }
};

const resetToOriginal = (currentImageUri: string, setEditState: any) => {
  setEditState((prev: any) => ({
    ...prev,
    currentImageUri: prev.originalImageUri,
    isProcessing: false,
  }));
  Toast.show({
    type: "success",
    text1: "Image reset to original size",
  });
};
