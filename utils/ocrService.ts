// utils/ocrService.ts
import * as FileSystem from "expo-file-system";
import * as Network from "expo-network";
import { ToastMessage } from "../components/Toast";
import * as Clipboard from 'expo-clipboard';

// Google Vision API configuration
const GOOGLE_VISION_API_KEY = ""; // Replace with actual API key
const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export interface OCRResult {
  success: boolean;
  text?: string;
  error?: string;
}

export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected && networkState.isInternetReachable;
  } catch (error) {
    console.error("Error checking internet connection:", error);
    return false;
  }
};

export const performOCR = async (imageUri: string): Promise<OCRResult> => {
  try {
    // Check if API key is configured
    if (!GOOGLE_VISION_API_KEY || GOOGLE_VISION_API_KEY.trim() === "") {
      return { success: false, error: "API key not configured" };
    }

    // Check internet connection
    const hasInternet = await checkInternetConnection();
    if (!hasInternet) {
      return { success: false, error: "No internet connection" };
    }

    // Convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Prepare the request body for Google Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 1,
            },
          ],
        },
      ],
    };

    // Make API request
    const response = await fetch(GOOGLE_VISION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Vision API error:", errorData);
      return { success: false, error: "API request failed" };
    }

    const data = await response.json();

    // Extract text from response
    if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
      const extractedText = data.responses[0].textAnnotations[0]?.description;
      if (extractedText && extractedText.trim() !== "") {
        return { success: true, text: extractedText.trim() };
      } else {
        return { success: false, error: "No text found in image" };
      }
    } else {
      return { success: false, error: "No text annotations found" };
    }
  } catch (error) {
    console.error("OCR error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    ToastMessage("success", "Text Copied", "OCR text copied to clipboard");
    return true;
  } catch (error) {
    console.error("Error copying text:", error);
    ToastMessage("error", "Copy Failed", "Unable to copy text to clipboard");
    return false;
  }
};

export const getOCRErrorMessage = (error: string): { title: string; message: string } => {
  switch (error) {
    case "API key not configured":
      return {
        title: "OCR Unavailable",
        message: "Text extraction service is not configured"
      };
    case "No internet connection":
      return {
        title: "OCR Unavailable", 
        message: "Internet connection required for text extraction"
      };
    case "No text found in image":
      return {
        title: "No Text Found",
        message: "No readable text detected in this image"
      };
    default:
      return {
        title: "OCR Failed",
        message: "Unable to extract text from image"
      };
  }
};