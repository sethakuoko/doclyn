import * as ImageManipulator from "expo-image-manipulator";
import Toast from "react-native-toast-message";

export const handleCleanup = async (
  currentImageUri: string,
  setEditState: any
) => {
  if (!currentImageUri) {
    Toast.show({
      type: "error",
      text1: "No image to cleanup",
    });
    return;
  }

  setEditState((prev: any) => ({ ...prev, isProcessing: true }));

  try {
    // For cleanup, we'll apply a simple resize to enhance quality
    const result = await ImageManipulator.manipulateAsync(
      currentImageUri,
      [{ resize: { width: 1920, height: 1080 } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );

    setEditState((prev: any) => ({
      ...prev,
      currentImageUri: result.uri,
      isProcessing: false,
    }));

    Toast.show({
      type: "success",
      text1: "Image cleaned up successfully",
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    setEditState((prev: any) => ({ ...prev, isProcessing: false }));
    Toast.show({
      type: "error",
      text1: "Failed to cleanup image",
      text2: "Please try again",
    });
  }
};
