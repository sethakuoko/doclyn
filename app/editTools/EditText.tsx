import Toast from "react-native-toast-message";

export const handleEditText = () => {
  Toast.show({
    type: "info",
    text1: "Text Editing",
    text2: "OCR and text editing features will be implemented here",
  });
};
