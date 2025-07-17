import Toast from "react-native-toast-message";

export const handleMagicEraser = () => {
  Toast.show({
    type: "info",
    text1: "Magic Eraser",
    text2: "AI-powered background removal will be implemented here",
  });
};
