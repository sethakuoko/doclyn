import * as ImageManipulator from "expo-image-manipulator";
import Toast from "react-native-toast-message";

export const handleRotate = async (currentImageUri: string, rotation: number, setEditState: any) => {
  if (!currentImageUri) {
    Toast.show({
      type: "error",
      text1: "No image to rotate",
    });
    return;
  }
  
  setEditState((prev: any) => ({ ...prev, isProcessing: true }));
  
  try {
    const newRotation = (rotation + 90) % 360;
    const result = await ImageManipulator.manipulateAsync(
      currentImageUri,
      [{ rotate: 90 }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    setEditState((prev: any) => ({
      ...prev,
      currentImageUri: result.uri,
      rotation: newRotation,
      isProcessing: false,
    }));
    
    Toast.show({
      type: "success",
      text1: "Image rotated successfully",
    });
  } catch (error) {
    console.error("Rotate error:", error);
    setEditState((prev: any) => ({ ...prev, isProcessing: false }));
    Toast.show({
      type: "error",
      text1: "Failed to rotate image",
      text2: "Please try again",
    });
  }
};
