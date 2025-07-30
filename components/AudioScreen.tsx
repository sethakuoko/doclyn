import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../app/types";

// API Keys (left exposed per user request)
const OPENAI_API_KEY =
  "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";
const GOOGLE_API_KEY = "AIzaSyA_EoslAD2Ih39QR1RWfDnqqeaOfIUNLDE";

const AudioScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionFailed, setTranscriptionFailed] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    try {
      if (hasPermission !== true) {
        Alert.alert("Microphone access is required.");
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: ".wav",
          outputFormat: 3,
          audioEncoder: 1,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: ".wav",
          audioQuality: 2,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
        isMeteringEnabled: false,
      });
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (!uri) {
        Alert.alert("Error", "Recording URI is null.");
        return;
      }

      setIsTranscribing(true);
      setTranscriptionFailed(false);
      console.log("🎤 Recorded URI:", uri);

      // Google STT
      try {
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const googleResponse = await axios.post(
          `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
          {
            config: {
              encoding: "LINEAR16",
              sampleRateHertz: 16000,
              languageCode: "en-US",
              enableAutomaticPunctuation: true,
            },
            audio: {
              content: base64Audio,
            },
          }
        );

        const alternatives =
          googleResponse.data.results?.[0]?.alternatives ?? [];

        if (alternatives.length) {
          setTranscript(alternatives[0].transcript);
          setIsTranscribing(false);
          return;
        } else {
          throw new Error("No transcription found from Google.");
        }
      } catch (googleError) {
        setTranscriptionFailed(true);
        console.warn("Google STT failed, trying OpenAI...", googleError);
      }

      // OpenAI Whisper
      const response = await FileSystem.uploadAsync(
        "https://api.openai.com/v1/audio/transcriptions",
        uri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "file",
          parameters: {
            model: "whisper-1",
          },
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const result = JSON.parse(response.body);
      setTranscript(result.text);
      setIsTranscribing(false);
    } catch (error) {
      console.error("stopRecording error", error);
      setIsTranscribing(false);
      Alert.alert("Transcription Failed", "Both services failed.");
    }
  };

  const toggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };

  const speakText = () => {
    if (!transcript.trim()) {
      Speech.speak("An error occurred. Please try again.");
      return;
    }

    Speech.stop();
    Speech.speak(transcript, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const clearTranscript = () => {
    setTranscript("");
  };

  const copyToClipboard = async () => {
    if (transcript.trim()) {
      await Clipboard.setStringAsync(transcript.trim());
      Alert.alert("Copied", "Text copied to clipboard");
    }
  };

  const exportToPDF = async () => {
    if (!transcript.trim()) return;
    const html = `<html><body><pre>${transcript}</pre></body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const shareText = async () => {
    if (transcript.trim()) {
      await Share.share({
        message: transcript.trim(),
        title: "Voice Transcription",
      });
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Requesting microphone permissions...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Microphone access denied</Text>
        <Text style={styles.permissionSubText}>
          Please enable microphone permissions in your device settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice to Text</Text>

      <TouchableOpacity
        style={[
          styles.recordButton,
          { backgroundColor: isRecording ? "#ff4444" : COLORS.brand },
        ]}
        onPress={toggleRecording}
      >
        <Ionicons name={isRecording ? "stop" : "mic"} size={48} color="white" />
      </TouchableOpacity>

      <View style={styles.transcriptContainer}>
        {isTranscribing && (
          <ActivityIndicator size="large" color={COLORS.brand} />
        )}
        <ScrollView style={{ maxHeight: 200 }}>
          <Text style={styles.transcriptText}>
            {transcript || "Your transcription will appear here..."}
          </Text>
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={speakText}>
            <Ionicons name="volume-high" size={24} color={COLORS.brand} />
          </TouchableOpacity>
          <TouchableOpacity onPress={copyToClipboard}>
            <Ionicons name="copy" size={24} color={COLORS.brand} />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareText}>
            <Ionicons name="share" size={24} color={COLORS.brand} />
          </TouchableOpacity>
          <TouchableOpacity onPress={exportToPDF}>
            <Ionicons name="document-text" size={24} color={COLORS.brand} />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearTranscript}>
            <Ionicons name="trash" size={24} color={COLORS.brand} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
  },
  transcriptContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  transcriptText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  permissionText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  permissionSubText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});

export default AudioScreen;
