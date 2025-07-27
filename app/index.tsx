// App.tsx
import { ToastMessage } from "@/components/Toast";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
// import Toast from "react-native-toast-message";
import { ApiService } from "../utils/api";
import { checkLoginStatus, storeUserSession } from "../utils/storage";
import { COLORS } from "./types";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Password validation function
const isValidPassword = (
  password: string
): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }
  return { isValid: true, message: "" };
};

export default function App() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [validationError, setValidationError] = useState("");

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
    setValidationError(""); // Clear any previous validation errors

    try {
      const response = await ApiService.authenticateUser({
        email,
        password,
        action,
      });

      // Handle successful response
      if (response.success) {
        await storeUserSession(email);
        ToastMessage(
          "success",
          action === "createAccount" ? "Account Created!" : "Login Successful!",
          response.message || "Welcome to Doclyn"
        );
        router.replace("/HomeScreen");
      } else {
        // Handle failed response from server
        const errorMessage = response.message || "Authentication failed";
        setValidationError(errorMessage);
        ToastMessage(
          "error",
          action === "createAccount"
            ? "Account Creation Failed"
            : "Login Failed",
          errorMessage
        );
      }
    } catch (error: any) {
      console.error("📡 [Backend] Error during authentication:", error);

      // Handle different types of errors
      let errorTitle = "";
      let errorMessage = "";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        // Network error
        errorTitle = "Connection Error";
        errorMessage =
          "Unable to connect to server. Please check your internet connection.";
      } else if (error.status === 400) {
        // Bad request
        errorTitle =
          action === "createAccount" ? "Account Creation Error" : "Login Error";
        errorMessage = error.message || "Invalid email or password format";
      } else if (error.status === 401) {
        // Unauthorized
        errorTitle = "Authentication Failed";
        errorMessage =
          action === "createAccount"
            ? "Email already exists or invalid credentials"
            : "Invalid email or password";
      } else if (error.status === 403) {
        // Forbidden
        errorTitle = "Access Denied";
        errorMessage = "Your account may be suspended or inactive";
      } else if (error.status === 409) {
        // Conflict (email already exists)
        errorTitle = "Account Already Exists";
        errorMessage =
          "An account with this email already exists. Try logging in instead.";
      } else if (error.status === 429) {
        // Too many requests
        errorTitle = "Too Many Attempts";
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.status >= 500) {
        // Server error
        errorTitle = "Server Error";
        errorMessage =
          "Our servers are experiencing issues. Please try again later.";
      } else {
        // Generic error
        errorTitle =
          action === "createAccount"
            ? "Account Creation Failed"
            : "Login Failed";
        errorMessage =
          error.message || "An unexpected error occurred. Please try again.";
      }

      setValidationError(errorMessage);
      ToastMessage("error", errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = () => {
    Keyboard.dismiss();
    setValidationError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Basic input checks
    if (!trimmedEmail || !trimmedPassword) {
      setValidationError("Please fill in all fields");
      ToastMessage("error", "Please fill in all fields");
      return;
    }

    // Email validation
    if (!isValidEmail(trimmedEmail)) {
      setValidationError("Please enter a valid email address");
      ToastMessage("error", "Please enter a valid email address");
      return;
    }

    // Password validation (only for sign up)
    if (isSignUp) {
      const passwordCheck = isValidPassword(trimmedPassword);
      if (!passwordCheck.isValid) {
        setValidationError(passwordCheck.message);
        ToastMessage("error", passwordCheck.message);
        return;
      }
    } else {
      // For login, just check minimum length
      if (trimmedPassword.length < 6) {
        setValidationError("Password is too short");
        ToastMessage("error", "Password is too short");
        return;
      }
    }

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
      <ImageBackground
        source={require("../assets/images/IndexBackground.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
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

                    {validationError ? (
                      <Text style={styles.errorText}>{validationError}</Text>
                    ) : null}

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
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ImageBackground>
      {/* <Toast /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    minHeight: "100%", // Ensures content takes full height
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: "100%", // Ensures overlay takes full height
  },
  content: {
    flex: 1,
    justifyContent: "space-between", // Changed to space-between for better distribution
    minHeight: 600, // Minimum height to ensure scrollability
  },
  headerSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 50, // Reduced margin
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
    marginBottom: 50, // Reduced margin
    marginTop: "auto", // Push to bottom of available space
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
