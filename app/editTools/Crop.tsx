import * as ImageManipulator from "expo-image-manipulator";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import Toast from "react-native-toast-message";

interface PanHandlers {
  onStartShouldSetPanResponder: () => boolean;
  onMoveShouldSetPanResponder: () => boolean;
  onPanResponderGrant: (evt: any, gestureState: any) => void;
  onPanResponderMove: (evt: any, gestureState: any) => void;
  onPanResponderRelease: (evt: any, gestureState: any) => void;
}

interface CropProps {
  width: number;
  height: number;
  cropRect: { x: number; y: number; w: number; h: number };
  leftHandle: { panHandlers: PanHandlers };
  rightHandle: { panHandlers: PanHandlers };
  topHandle: { panHandlers: PanHandlers };
  bottomHandle: { panHandlers: PanHandlers };
  confirmCrop: () => void;
  imageDimensions?: { width: number; height: number; x: number; y: number };
  isDragging: boolean;
}

interface EditState {
  currentImageUri: string;
  isProcessing: boolean;
}

// Crop functionality
export const handleCrop = async (
  currentImageUri: string,
  imageDimensions: { width: number; height: number } | null,
  setEditState: React.Dispatch<React.SetStateAction<EditState>>
) => {
  if (!currentImageUri) {
    Toast.show({
      type: "error",
      text1: "No image to crop",
    });
    return;
  }

  setEditState((prev) => ({ ...prev, isProcessing: true }));

  try {
    // Get image info to calculate proper crop dimensions
    const imageInfo = await ImageManipulator.manipulateAsync(
      currentImageUri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    // Calculate crop area (center crop)
    const imageWidth = imageDimensions?.width || imageInfo.width;
    const imageHeight = imageDimensions?.height || imageInfo.height;

    const cropWidth = Math.min(imageWidth * 0.8, imageWidth);
    const cropHeight = Math.min(imageHeight * 0.8, imageHeight);
    const originX = (imageWidth - cropWidth) / 2;
    const originY = (imageHeight - cropHeight) / 2;

    const result = await ImageManipulator.manipulateAsync(
      currentImageUri,
      [
        {
          crop: {
            originX,
            originY,
            width: cropWidth,
            height: cropHeight,
          },
        },
      ],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    setEditState((prev) => ({
      ...prev,
      currentImageUri: result.uri,
      isProcessing: false,
    }));

    Toast.show({
      type: "success",
      text1: "Image cropped successfully",
    });
  } catch (error) {
    console.error("Crop error:", error);
    setEditState((prev) => ({ ...prev, isProcessing: false }));
    Toast.show({
      type: "error",
      text1: "Failed to crop image",
      text2: "Please try again",
    });
  }
};

const Crop: React.FC<CropProps> = ({
  width,
  height,
  cropRect,
  leftHandle,
  rightHandle,
  topHandle,
  bottomHandle,
  confirmCrop,
  imageDimensions,
  isDragging,
}) => {
  // Use image dimensions if available, otherwise fall back to screen dimensions
  const cropWidth = imageDimensions?.width || width;
  const cropHeight = imageDimensions?.height || height;
  const cropX = imageDimensions?.x || 0;
  const cropY = imageDimensions?.y || 0;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          left: cropX,
          top: cropY,
          width: cropWidth,
          height: cropHeight,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Dimmed area overlay */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        {/* Top dim */}
        <Rect
          x="0"
          y="0"
          width={cropWidth}
          height={Math.max(0, cropRect.y)}
          fill="rgba(0,0,0,0.6)"
        />
        {/* Bottom dim */}
        <Rect
          x="0"
          y={cropRect.y + cropRect.h}
          width={cropWidth}
          height={Math.max(0, cropHeight - (cropRect.y + cropRect.h))}
          fill="rgba(0,0,0,0.6)"
        />
        {/* Left dim */}
        <Rect
          x="0"
          y={cropRect.y}
          width={Math.max(0, cropRect.x)}
          height={cropRect.h}
          fill="rgba(0,0,0,0.6)"
        />
        {/* Right dim */}
        <Rect
          x={cropRect.x + cropRect.w}
          y={cropRect.y}
          width={Math.max(0, cropWidth - (cropRect.x + cropRect.w))}
          height={cropRect.h}
          fill="rgba(0,0,0,0.6)"
        />
        {/* Crop rectangle border */}
        <Rect
          x={cropRect.x}
          y={cropRect.y}
          width={cropRect.w}
          height={cropRect.h}
          fill="none"
          stroke="#00FFFF"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        {/* Corner indicators */}
        <Rect
          x={cropRect.x - 2}
          y={cropRect.y - 2}
          width="20"
          height="20"
          fill="none"
          stroke="#00FFFF"
          strokeWidth="3"
        />
        <Rect
          x={cropRect.x + cropRect.w - 18}
          y={cropRect.y - 2}
          width="20"
          height="20"
          fill="none"
          stroke="#00FFFF"
          strokeWidth="3"
        />
        <Rect
          x={cropRect.x - 2}
          y={cropRect.y + cropRect.h - 18}
          width="20"
          height="20"
          fill="none"
          stroke="#00FFFF"
          strokeWidth="3"
        />
        <Rect
          x={cropRect.x + cropRect.w - 18}
          y={cropRect.y + cropRect.h - 18}
          width="20"
          height="20"
          fill="none"
          stroke="#00FFFF"
          strokeWidth="3"
        />
      </Svg>

      {/* Handles with better positioning and touch areas */}
      {/* Left handle */}
      <View
        {...leftHandle.panHandlers}
        style={[
          styles.handle,
          {
            left: cropRect.x - 20,
            top: cropRect.y + cropRect.h / 2 - 20,
            backgroundColor: "#00FFFF",
          },
        ]}
      >
        <View style={styles.handleInner} />
      </View>

      {/* Right handle */}
      <View
        {...rightHandle.panHandlers}
        style={[
          styles.handle,
          {
            left: cropRect.x + cropRect.w - 20,
            top: cropRect.y + cropRect.h / 2 - 20,
            backgroundColor: "#00FFFF",
          },
        ]}
      >
        <View style={styles.handleInner} />
      </View>

      {/* Top handle */}
      <View
        {...topHandle.panHandlers}
        style={[
          styles.handle,
          {
            left: cropRect.x + cropRect.w / 2 - 20,
            top: cropRect.y - 20,
            backgroundColor: "#00FFFF",
          },
        ]}
      >
        <View style={styles.handleInner} />
      </View>

      {/* Bottom handle */}
      <View
        {...bottomHandle.panHandlers}
        style={[
          styles.handle,
          {
            left: cropRect.x + cropRect.w / 2 - 20,
            top: cropRect.y + cropRect.h - 20,
            backgroundColor: "#00FFFF",
          },
        ]}
      >
        <View style={styles.handleInner} />
      </View>

      {/* Floating Confirm Button */}
      {isDragging ? null : (
        <TouchableOpacity
          style={[
            styles.cropConfirmButton,
            {
              position: "absolute",
              bottom: 20,
              right: 20,
              zIndex: 20,
              elevation: 5,
            },
          ]}
          onPress={confirmCrop}
        >
          <Text style={styles.cropConfirmText}>✓ Confirm Crop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  handle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00FFFF",
    borderWidth: 3,
    borderColor: "#fff",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  cropConfirmButton: {
    position: "absolute",
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    zIndex: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cropConfirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Crop;
