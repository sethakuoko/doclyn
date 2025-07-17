import Toast from "react-native-toast-message";

// Markup tools
export const MARKUP_TOOLS = [
  { icon: "brush", label: "Draw", type: "draw" },
  { icon: "square-outline", label: "Rectangle", type: "rectangle" },
  { icon: "ellipse-outline", label: "Circle", type: "circle" },
  { icon: "arrow-forward", label: "Arrow", type: "arrow" },
  { icon: "text", label: "Text", type: "text" },
];

export const handleMarkup = () => {
  Toast.show({
    type: "info",
    text1: "Markup Tools",
    text2: "Drawing and annotation tools will be implemented here",
  });
};
