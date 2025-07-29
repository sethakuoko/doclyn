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
import Toast from "react-native-toast-message";
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
      // Create a timeout promise that rejects after 10 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("TIMEOUT"));
        }, 10000); // 10 seconds
      });

      // Race between the authentication request and timeout
      const response = (await Promise.race([
        ApiService.authenticateUser({
          email,
          password,
          action,
        }),
        timeoutPromise,
      ])) as any; // Type assertion since we know it will be the API response if not timeout

      // Handle successful response
      if (response.success) {
        await storeUserSession(email);
        ToastMessage(
          "success",
          action === "createAccount" ? "Account Created!" : "Welcome Back!",
          action === "createAccount" ? "You're all set!" : "Login successful"
        );
        router.replace("/HomeScreen");
      } else {
        // Handle failed response from server
        const errorMessage = response.message || "Something went wrong";
        ToastMessage(
          "error",
          action === "createAccount" ? "Signup Failed" : "Login Failed",
          errorMessage.length > 40 ? "Please try again" : errorMessage
        );
      }
    } catch (error: any) {
      console.error("📡 [Backend] Error during authentication:", error);

      // Handle different types of errors
      let errorTitle = "";
      let errorMessage = "";

      // Check for timeout error first
      if (error.message === "TIMEOUT") {
        errorTitle = "Connection Timeout";
        errorMessage = "Request took too long. Try again.";
      } else if (
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        // Network error
        errorTitle = "No Internet";
        errorMessage = "Check your connection and retry.";
      } else if (error.status === 400) {
        // Bad request
        errorTitle = "Invalid Request";
        errorMessage = "Please check your details.";
      } else if (error.status === 401) {
        // Unauthorized
        errorTitle = "Access Denied";
        errorMessage =
          action === "createAccount"
            ? "Email might already exist"
            : "Wrong email or password";
      } else if (error.status === 403) {
        // Forbidden
        errorTitle = "Account Blocked";
        errorMessage = "Contact support for help.";
      } else if (error.status === 409) {
        // Conflict (email already exists)
        errorTitle = "Email Taken";
        errorMessage = "Try logging in instead.";
      } else if (error.status === 429) {
        // Too many requests
        errorTitle = "Too Many Attempts";
        errorMessage = "Wait a moment and try again.";
      } else if (error.status >= 500) {
        // Server error
        errorTitle = "Server Error";
        errorMessage = "Our servers are busy. Try later.";
      } else {
        // Generic error
        errorTitle =
          action === "createAccount" ? "Signup Failed" : "Login Failed";
        errorMessage = "Something went wrong. Try again.";
      }

      ToastMessage("error", errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = () => {
    Keyboard.dismiss();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    console.log("🔍 [DEBUG] Starting validation...");

    // Basic input checks
    if (!trimmedEmail || !trimmedPassword) {
      console.log("🔍 [DEBUG] Empty fields validation failed");
      ToastMessage(
        "error",
        "Missing Information",
        "Please fill in both fields"
      );
      return;
    }

    // Email validation
    if (!isValidEmail(trimmedEmail)) {
      console.log("🔍 [DEBUG] Email validation failed");
      ToastMessage("error", "Invalid Email", "Please enter a valid email");
      return;
    }

    // Password validation (only for sign up)
    if (isSignUp) {
      const passwordCheck = isValidPassword(trimmedPassword);
      if (!passwordCheck.isValid) {
        console.log(
          "🔍 [DEBUG] Password validation failed:",
          passwordCheck.message
        );
        // Custom shorter password messages
        let shortMessage = "";
        if (passwordCheck.message.includes("8 characters")) {
          shortMessage = "Password must be 8+ characters";
        } else if (passwordCheck.message.includes("lowercase")) {
          shortMessage = "Add a lowercase letter";
        } else if (passwordCheck.message.includes("uppercase")) {
          shortMessage = "Add an uppercase letter";
        } else if (passwordCheck.message.includes("number")) {
          shortMessage = "Add a number";
        } else {
          shortMessage = "Password requirements not met";
        }
        ToastMessage("error", "Weak Password", shortMessage);
        return;
      }
    } else {
      // For login, just check minimum length
      if (trimmedPassword.length < 6) {
        console.log("🔍 [DEBUG] Password too short");
        ToastMessage("error", "Invalid Password", "Password too short");
        return;
      }
    }

    console.log("🔍 [DEBUG] All validations passed, proceeding with auth");

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
      <Toast />
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
