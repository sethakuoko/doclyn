// ocr.ts - Updated with parallel processing and logging
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import MLKitOCR from 'expo-mlkit-ocr';
import { Alert } from 'react-native';

export interface OCRResult {
  text: string;
  confidence: number;
  source: 'google' | 'local';
}

export interface OCRStatus {
  status: 'idle' | 'processing' | 'success' | 'failed';
  result?: OCRResult;
  error?: string;
}

// Configuration - you'll add your API key here
const GOOGLE_VISION_API_KEY = 'AIzaSyA_EoslAD2Ih39QR1RWfDnqqeaOfIUNLDE'; // You'll add this later
const GOOGLE_VISION_TIMEOUT = 10000; // 10 seconds timeout

export const processOCRWithGoogleVision = async (imageUri: string): Promise<OCRResult> => {
  console.log('🔍 [Google Vision] Starting OCR processing...');
  console.log('🔍 [Google Vision] Image URI:', imageUri);
  
  try {
    console.log('🔍 [Google Vision] Converting image to base64...');
    const base64Image = await getBase64FromUri(imageUri);
    console.log('🔍 [Google Vision] Base64 conversion completed, length:', base64Image.length);
    
    console.log('🔍 [Google Vision] Making API request to Google Vision...');
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION'
              }
            ]
          }
        ]
      },
      {
        timeout: GOOGLE_VISION_TIMEOUT
      }
    );

    console.log('🔍 [Google Vision] API response received');
    console.log('🔍 [Google Vision] Response status:', response.status);
    
    const textAnnotations = response.data.responses[0]?.textAnnotations;
    console.log('🔍 [Google Vision] Text annotations found:', textAnnotations?.length || 0);
    
    if (!textAnnotations || textAnnotations.length === 0) {
      console.log('🔍 [Google Vision] No text detected in image');
      throw new Error('No text detected');
    }

    const fullText = textAnnotations[0].description;
    console.log('🔍 [Google Vision] Extracted text length:', fullText.length);
    console.log('🔍 [Google Vision] Text preview:', fullText.substring(0, 100) + (fullText.length > 100 ? '...' : ''));
    
    const result: OCRResult = {
      text: fullText,
      confidence: 0.9, // Google Vision doesn't provide confidence scores
      source: 'google'
    };
    
    console.log('✅ [Google Vision] OCR completed successfully');
    return result;
  } catch (error) {
    console.error('❌ [Google Vision] OCR failed:', error);
    console.error('❌ [Google Vision] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      response: error instanceof Error ? error : null
    });
    throw error;
  }
};

export const processOCRWithLocal = async (imageUri: string): Promise<OCRResult> => {
  console.log('📱 [Local OCR] Starting local OCR processing...');
  console.log('📱 [Local OCR] Image URI:', imageUri);
  
  try {
    console.log('📱 [Local OCR] Calling MLKit recognizeText...');
    const result = await MLKitOCR.recognizeText(imageUri);
    console.log('📱 [Local OCR] MLKit response received');
    console.log('📱 [Local OCR] Text blocks found:', result.blocks.length);
    
    const allText = result.blocks
      .map((block) => block.text)
      .join(' ')
      .trim();
    
    console.log('📱 [Local OCR] Extracted text length:', allText.length);
    console.log('📱 [Local OCR] Text preview:', allText.substring(0, 100) + (allText.length > 100 ? '...' : ''));
    
    const averageConfidence = 0.8; // Default confidence for local OCR
    
    const ocrResult: OCRResult = {
      text: allText,
      confidence: averageConfidence,
      source: 'local'
    };
    
    console.log('✅ [Local OCR] OCR completed successfully');
    return ocrResult;
  } catch (error) {
    console.error('❌ [Local OCR] Processing failed:', error);
    console.error('❌ [Local OCR] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('Local OCR processing failed');
  }
};

export const processOCRParallel = async (imageUri: string): Promise<OCRResult> => {
  console.log('🚀 [Parallel OCR] Starting parallel OCR processing...');
  console.log('🚀 [Parallel OCR] Image URI:', imageUri);
  
  // Start Google Vision OCR immediately
  console.log('🚀 [Parallel OCR] Starting Google Vision OCR immediately...');
  const googleVisionPromise = processOCRWithGoogleVision(imageUri);
  
  // Start local OCR after 10 seconds
  console.log('🚀 [Parallel OCR] Setting up local OCR to start in 10 seconds...');
  const localOCRPromise = new Promise<OCRResult>((resolve, reject) => {
    setTimeout(async () => {
      try {
        console.log('🚀 [Parallel OCR] Starting local OCR as fallback...');
        const result = await processOCRWithLocal(imageUri);
        console.log('🚀 [Parallel OCR] Local OCR completed, resolving promise');
        resolve(result);
      } catch (error) {
        console.log('🚀 [Parallel OCR] Local OCR failed, rejecting promise');
        reject(error);
      }
    }, 10000);
  });
  
  // Race between Google Vision and local OCR
  try {
    console.log('🚀 [Parallel OCR] Racing between Google Vision and local OCR...');
    const result = await Promise.race([googleVisionPromise, localOCRPromise]);
    console.log(`✅ [Parallel OCR] Winner: ${result.source} OCR`);
    console.log(`✅ [Parallel OCR] Final text length: ${result.text.length}`);
    console.log(`✅ [Parallel OCR] Final text preview: ${result.text.substring(0, 100)}${result.text.length > 100 ? '...' : ''}`);
    return result;
  } catch (error) {
    console.error('❌ [Parallel OCR] Both OCR methods failed:', error);
    console.error('❌ [Parallel OCR] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('OCR processing failed');
  }
};

export const copyOCRText = async (ocrStatus: OCRStatus): Promise<void> => {
  console.log('📋 [Copy Text] Starting copy text operation...');
  console.log('📋 [Copy Text] OCR status:', ocrStatus.status);
  
  if (ocrStatus.status === 'processing') {
    console.log('📋 [Copy Text] OCR still processing, showing alert');
    Alert.alert('OCR Processing', 'OCR is still processing...');
    return;
  }
  
  if (ocrStatus.status === 'failed') {
    console.log('📋 [Copy Text] OCR failed, showing alert');
    Alert.alert('OCR Failed', 'OCR failed to process this image.');
    return;
  }
  
  if (ocrStatus.status === 'success' && ocrStatus.result?.text) {
    console.log('📋 [Copy Text] Copying text to clipboard...');
    console.log('📋 [Copy Text] Text length:', ocrStatus.result.text.length);
    console.log('📋 [Copy Text] Text preview:', ocrStatus.result.text.substring(0, 100) + (ocrStatus.result.text.length > 100 ? '...' : ''));
    
    try {
      await Clipboard.setStringAsync(ocrStatus.result.text);
      console.log('✅ [Copy Text] Text copied to clipboard successfully');
      Alert.alert('Text Copied', 'OCR text has been copied to clipboard.');
    } catch (error) {
      console.error('❌ [Copy Text] Failed to copy text to clipboard:', error);
      Alert.alert('Copy Failed', 'Failed to copy text to clipboard.');
    }
  } else {
    console.log('📋 [Copy Text] No text available to copy');
    Alert.alert('No Text', 'No OCR text available to copy.');
  }
};

// Helper function to convert image URI to base64
const getBase64FromUri = async (uri: string): Promise<string> => {
  console.log('🔄 [Base64] Converting image URI to base64...');
  console.log('🔄 [Base64] URI:', uri);
  
  try {
    const { readAsStringAsync, EncodingType } = await import('expo-file-system');
    const base64 = await readAsStringAsync(uri, {
      encoding: EncodingType.Base64
    });
    console.log('✅ [Base64] Conversion completed, length:', base64.length);
    return base64;
  } catch (error) {
    console.error('❌ [Base64] Failed to convert image to base64:', error);
    throw error;
  }
};