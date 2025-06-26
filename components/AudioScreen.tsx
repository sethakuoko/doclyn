import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AudioScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState<number>(0);

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
    backgroundColor: "#000",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#ccc",
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
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#555",
  },
  micButtonActive: {
    backgroundColor: "#ff4444",
    borderColor: "#ff6666",
  },
  micIcon: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  micShape: {
    width: 30,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  micShapeActive: {
    backgroundColor: "#fff",
  },
  recordingIndicator: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
    opacity: 0.7,
  },
  recordingStatus: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  timer: {
    color: "#ff4444",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#333",
    borderRadius: 15,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  transcriptionContainer: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 15,
  },
  transcriptionText: {
    color: "#ccc",
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
    backgroundColor: "#333",
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: "#666",
  },
});

export default AudioScreen;
