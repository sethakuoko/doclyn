import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import { COLORS } from "../app/types";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AudioScreen: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    requestPermissions();
    initializeSpeechRecognition();
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

  const initializeSpeechRecognition = () => {
    // For web environments (if running in Expo web)
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + " ";
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript((prev: string) => prev + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  };

  const startRecording = async () => {
    try {
      if (hasPermission === false) {
        alert("Permission to access microphone was denied");
        return;
      }

      if (hasPermission === null) {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access microphone was denied");
          return;
        }
        setHasPermission(true);
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;
        setIsRecording(false);

        // For demo purposes, simulate speech-to-text conversion
        // In a real implementation, you would send the audio file to a speech-to-text service
        const simulatedTranscript =
          "This is a simulated transcription of your audio recording. ";
        setTranscript((prev) => prev + simulatedTranscript);
        console.log("Recording saved to:", uri);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      // Web-based speech recognition
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
      setIsListening((prev) => !prev);
    } else {
      // Mobile recording (for actual implementation, you'd need to integrate
      // with a speech-to-text service)
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const clearTranscript = () => {
    setTranscript("");
  };

  const speakText = () => {
    if (transcript.trim()) {
      Speech.speak(transcript, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.8,
      });
    }
  };

  const copyToClipboard = async () => {
    if (transcript.trim()) {
      try {
        await Clipboard.setStringAsync(transcript.trim());
        Alert.alert("Copied", "Text copied to clipboard");
      } catch (error) {
        Alert.alert("Error", "Failed to copy text to clipboard");
      }
    } else {
      Alert.alert("No Text", "There is no text to copy");
    }
  };

  const shareText = async () => {
    if (transcript.trim()) {
      try {
        await Share.share({
          message: transcript.trim(),
          title: "Voice Transcription",
        });
      } catch (error) {
        Alert.alert("Error", "Failed to share text");
      }
    } else {
      Alert.alert("No Text", "There is no text to share");
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
      <View style={styles.header}>
        <Ionicons name="mic" size={32} color={COLORS.brand} />
        <Text style={styles.title}>Voice to Text</Text>
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: isListening || isRecording ? "#ff4444" : "#666",
            },
          ]}
        />
        <Text style={styles.statusText}>
          {isListening || isRecording
            ? "Listening..."
            : "Tap to start recording"}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.recordButton,
          {
            backgroundColor:
              isListening || isRecording ? "#ff4444" : COLORS.brand,
          },
        ]}
        onPress={toggleListening}
      >
        <Ionicons
          name={isListening || isRecording ? "stop" : "mic"}
          size={48}
          color="white"
        />
      </TouchableOpacity>

      <View style={styles.transcriptContainer}>
        <View style={styles.transcriptHeader}>
          <Text style={styles.transcriptTitle}>Transcription</Text>
          <View style={styles.transcriptActions}>
            <TouchableOpacity onPress={speakText} style={styles.actionButton}>
              <Ionicons name="volume-high" size={20} color={COLORS.brand} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={styles.actionButton}
            >
              <Ionicons name="copy" size={20} color={COLORS.brand} />
            </TouchableOpacity>
            <TouchableOpacity onPress={shareText} style={styles.actionButton}>
              <Ionicons name="share" size={20} color={COLORS.brand} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={clearTranscript}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color={COLORS.brand} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.transcriptScrollView}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.transcriptText}>
            {transcript || "Your voice transcription will appear here..."}
          </Text>
        </ScrollView>
      </View>

      <Text style={styles.infoText}>
        Speak clearly and close to your device's microphone for best results
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  transcriptActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  transcriptScrollView: {
    flex: 1,
    maxHeight: 200,
  },
  transcriptText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
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
