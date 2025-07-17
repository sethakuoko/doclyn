import { Alert } from "react-native";
import { useRouter } from "expo-router";

export const handleDelete = (router: any) => {
  Alert.alert(
    "Delete Image",
    "Are you sure you want to delete this image?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => router.replace("/HomeScreen") }
    ]
  );
};
