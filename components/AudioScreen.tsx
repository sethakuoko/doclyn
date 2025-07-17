import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const AudioScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const router = useRouter();

  const toggleRecording = (): void => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording simulation
      setRecordingTime(0);
      setTranscribedText("");
    } else {
      // Stop recording simulation
      setTranscribedText(
        "This is a demo transcription. The actual audio-to-text functionality will be implemented later."
      );
    }
  };

  const clearTranscription = (): void => {
    setTranscribedText("");
    setRecordingTime(0);
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar with Home Button */}
      <View style={styles.header}>
        <Text style={styles.title}>Audio to Text</Text>
        <Text style={styles.subtitle}>
          Tap the microphone to start recording
        </Text>
      </View>

      <View style={styles.recordingArea}>
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={toggleRecording}
          activeOpacity={0.8}
        >
          <View style={styles.micIcon}>
            <View
              style={[styles.micShape, isRecording && styles.micShapeActive]}
            />
            {isRecording && <View style={styles.recordingIndicator} />}
          </View>
        </TouchableOpacity>

        <Text style={styles.recordingStatus}>
          {isRecording ? "Recording..." : "Tap to Record"}
        </Text>

        {isRecording && (
          <Text style={styles.timer}>
            {Math.floor(recordingTime / 60)}:
            {(recordingTime % 60).toString().padStart(2, "0")}
          </Text>
        )}
      </View>

      <View style={styles.transcriptionArea}>
        <View style={styles.transcriptionHeader}>
          <Text style={styles.transcriptionTitle}>Transcription</Text>
          {transcribedText.length > 0 && (
            <TouchableOpacity
              onPress={clearTranscription}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.transcriptionContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.transcriptionText}>
            {transcribedText || "Your transcribed text will appear here..."}
          </Text>
        </ScrollView>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          disabled={!transcribedText}
        >
          <Text
            style={[
              styles.actionButtonText,
              !transcribedText && styles.disabledText,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          disabled={!transcribedText}
        >
          <Text
            style={[
              styles.actionButtonText,
              !transcribedText && styles.disabledText,
            ]}
          >
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a", // Dark background
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#008080",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#cccccc", // Light gray text
    fontSize: 16,
    textAlign: "center",
  },
  recordingArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2a2a2a", // Dark button background
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#404040", // Dark border
  },
  micButtonActive: {
    backgroundColor: "#008080",
    borderColor: "#006666",
  },
  micIcon: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  micShape: {
    width: 30,
    height: 40,
    backgroundColor: "#ffffff", // White mic shape
    borderRadius: 15,
  },
  micShapeActive: {
    backgroundColor: "#ffffff",
  },
  recordingIndicator: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#008080",
    opacity: 0.7,
  },
  recordingStatus: {
    color: "#ffffff", // White text
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  timer: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "bold",
  },
  transcriptionArea: {
    flex: 1,
    marginBottom: 20,
  },
  transcriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  transcriptionTitle: {
    color: "#ffffff", // White text
    fontSize: 18,
    fontWeight: "600",
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#2a2a2a", // Dark button background
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#404040", // Dark border
  },
  clearButtonText: {
    color: "#008080",
    fontSize: 14,
  },
  transcriptionContainer: {
    flex: 1,
    backgroundColor: "#2a2a2a", // Dark container background
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#404040", // Dark border
  },
  transcriptionText: {
    color: "#ffffff", // White text
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
  },
  actionButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "#008080",
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: "#666666", // Darker gray for disabled state
  },
});

export default AudioScreen;