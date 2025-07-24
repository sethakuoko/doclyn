import DocumentOptionsModal from "@/components/DocumentOptionsModal";
import HomeViewModal from "@/components/HomeViewModal";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // RECOMMENDED package
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from 'react-native-webview';
import { COLORS } from "./types";
import { getDefaultFilePrefix } from "../utils/storage";
// @ts-ignore
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import { Platform } from "react-native";
import ViewShot from "react-native-view-shot";
import { useRef } from "react";
import { SavedPDF } from "../utils/pdfStorage";

interface Document {
  id: number;
  title: string;
  date: string;
  thumbnail: string;
  isLarge?: boolean;
  path: string; // Added path for navigation
  ocrText?: string; // Added OCR text
}

/*

*/

// Utility to generate HTML for PDF preview (responsive to container)
const getPdfHtml = (base64: string) => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        html, body { 
          margin:0; 
          padding:0; 
          overflow:hidden; 
          background:#fff; 
          width:100%; 
          height:100%; 
        }
        embed { 
          width:100%; 
          height:100%; 
          object-fit:cover;
        }
      </style>
    </head>
    <body>
      <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
    </body>
  </html>
`;

const DoclynHomeScreen: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pdfPreviews, setPdfPreviews] = useState<{ [id: number]: string }>({});
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [defaultPrefix, setDefaultPrefix] = useState("");
  const [webViewHeight, setWebViewHeight] = useState(0);
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Multi-select state
  const [selectedOption, setSelectedOption] = useState<string>("viewAll"); // 'viewAll' by default
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set());

  // Reset selection when switching back to viewAll
  useEffect(() => {
    if (selectedOption === "viewAll") {
      setSelectedDocs(new Set());
    }
  }, [selectedOption]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const toggleDocSelection = (docId: number) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleCancelMultiSelect = () => {
    setSelectedOption("viewAll");
    setSelectedDocs(new Set());
  };

  const handleDeleteSelected = async () => {
    // Remove selected docs from AsyncStorage and state
    const idsToDelete = Array.from(selectedDocs);
    let saved = await AsyncStorage.getItem("SAVED_PDFS");
    let pdfs: SavedPDF[] = saved ? JSON.parse(saved) : [];
    pdfs = pdfs.filter((pdf: SavedPDF, idx: number) => !idsToDelete.includes(idx + 1));
    await AsyncStorage.setItem("SAVED_PDFS", JSON.stringify(pdfs));
    setDocuments((docs) => docs.filter((doc) => !selectedDocs.has(doc.id)));
    handleCancelMultiSelect();
  };

  const handleShareSelected = async () => {
    const docsToShare = documents.filter((doc) => selectedDocs.has(doc.id));
    if (docsToShare.length === 0) {
      handleCancelMultiSelect();
      return;
    }
    try {
      // If only one file, share directly
      if (docsToShare.length === 1) {
        await Sharing.shareAsync(docsToShare[0].path);
      } else {
        // For multiple files, share as an array (if supported)
        // Expo Sharing API does not support multiple