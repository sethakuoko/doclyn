// App.tsx
import { ToastMessage } from "@/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
// import Toast from "react-native-toast-message";
import { ApiService } from "../utils/api";
import { checkLoginStatus, saveUserSession } from "../utils/storage";
import { COLORS } from "./types";

export default function App() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const isLoggedIn = await checkLoginStatus();
        if (isLoggedIn) {
          router.replace("/HomeScreen");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLogin();
  }, [router]);

  const sendLoginInfoToBackend = async (
    email: string,
    password: string,
    action: "createAccount" | "signIn"
  ) => {
    setLoading(true);
    try {
      const response = await ApiService.authenticateUser({
        email,
        password,
        action,
      });
      if (response.success) {
        ToastMessage("success", response.message);
        router.replace("/HomeScreen");
      } else {
        ToastMessage("error", response.message);
      }
    } catch (error: any) {
      console.error("📡 [Backend] Error sending login info:", error);
      ToastMessage(
        "error",
        error.message || "An error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = () => {
    Keyboard.dismiss();
    if (isSignUp) {
      // Handle Sign Up
      sendLoginInfoToBackend(email, password, "createAccount");
    } else {
      // Handle Login
      sendLoginInfoToBackend(email, password, "signIn");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          source={require("../assets/images/IndexBackground.jpg")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.overlay}>
                <View style={styles.content}>
                  <View style={styles.headerSection}>
                    <Text style={styles.welcomeTitle}>Welcome to Doclyn</Text>
                    <Text style={styles.subtitle}>
                      Use your mobile device to scan anything to PDF. Then
                      access the PDFs anytime, anywhere from Doclyn cloud
                      storage.
                    </Text>
                  </View>
                  <View style={styles.signInSection}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#ccc"
                      onChangeText={setEmail}
                      value={email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#ccc"
                      onChangeText={setPassword}
                      value={password}
                      secureTextEntry
                    />
                    <TouchableOpacity
                      style={styles.signInButton}
                      onPress={handleAuthAction}
                      activeOpacity={0.8}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>
                          {isSignUp ? "Create Account" : "Login"}
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                      <Text style={styles.toggleText}>
                        {isSignUp
                          ? "Already have an account? Login"
                          : "Don't have an account? Create one"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </TouchableWithoutFeedback>
      {/* <Toast /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start", // Align content to the top
    paddingHorizontal: 24,
    paddingTop: 60, // Adjust as needed
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start", // Align content to the top
  },
  headerSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 200,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
    paddingHorizontal: 10,
    fontWeight: "300",
  },
  signInSection: {
    marginBottom: 100,
  },
  input: {
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    paddingHorizontal: 20,
    color: "#fff",
    marginBottom: 16,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    marginBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.brand,
    borderWidth: 1,
    borderColor: COLORS.brand,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFF",
  },
  toggleText: {
    color: "#FFF",
    textAlign: "center",
    marginTop: 10,
  },
});
