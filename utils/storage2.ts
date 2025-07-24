// utils/pdfStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedPDF {
  name: string;
  path: string;
  date: string;
  ocrText?: string;
}

export const savePDFWithOCR = async (
  name: string,
  path: string,
  ocrText?: string
): Promise<void> => {
  try {
    let savedPdfs: SavedPDF[] = [];
    const existing = await AsyncStorage.getItem("SAVED_PDFS");
    if (existing) {
      savedPdfs = JSON.parse(existing);
    }

    const newPdf: SavedPDF = {
      name,
      path,
      date: new Date().toISOString(),
      ocrText: ocrText || undefined,
    };

    savedPdfs.push(newPdf);
    await AsyncStorage.setItem("SAVED_PDFS", JSON.stringify(savedPdfs));
  } catch (error) {
    console.error("Error saving PDF with OCR:", error);
    throw error;
  }
};

export const getSavedPDFs = async (): Promise<SavedPDF[]> => {
  try {
    const saved = await AsyncStorage.getItem("SAVED_PDFS");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error("Error getting saved PDFs:", error);
    return [];
  }
};

export const updatePDFOCRText = async (
  path: string,
  ocrText: string
): Promise<void> => {
  try {
    const savedPdfs = await getSavedPDFs();
    const updatedPdfs = savedPdfs.map(pdf =>
      pdf.path === path ? { ...pdf, ocrText } : pdf
    );
    await AsyncStorage.setItem("SAVED_PDFS", JSON.stringify(updatedPdfs));
  } catch (error) {
    console.error("Error updating PDF OCR text:", error);
    throw error;
  }
};