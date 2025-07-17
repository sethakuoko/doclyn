import { Alert } from "react-native";

interface FileNameInputProps {
  currentFileName: string;
  onFileNameUpdate: (fileName: string) => void;
  title?: string;
  message?: string;
  placeholder?: string;
}

// FileNameInput is not a React component, so export only the hook below.
// If you want a component, return JSX here, e.g., a button to trigger showFileNamePrompt.
// For now, remove this to avoid the type error.

// Export as a hook-like function
export const useFileNameInput = (props: FileNameInputProps) => {
  const showFileNamePrompt = () => {
    Alert.prompt(
      props.title || "Default File Name",
      props.message || "Enter the default name for your scanned files:",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("File name input cancelled"),
        },
        {
          text: "OK",
          onPress: (inputText) => {
            const newFileName = inputText ? inputText.trim() : "";
            // Allow empty string as valid (no prefix)
            props.onFileNameUpdate(newFileName);
            console.log("New file name entered:", newFileName);
          },
        },
      ],
      "plain-text",
      props.currentFileName
    );
  };

  return { showFileNamePrompt };
};

// No default export; use the hook instead.
