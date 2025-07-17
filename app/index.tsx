// App.tsx
import { ToastMessage } from "@/components/Toast";
import { SignedOut, useAuth, useSSO, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ApiService } from "../utils/api";
import { saveUserSession, checkLoginStatus } from "../utils/storage";
import { COLORS } from "./types";

// App.tsx
// … all your imports remain unchanged

export default function App() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

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

  useEffect(() => {
    if (user) {
      const userID = user.id;
      const email = user.primaryEmailAddress?.emailAddress ?? "";
      const fullname = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

      console.log("🔐 User data now available from Clerk:", { userID, email, fullname });
      sendLoginInfoToBackend(userID, email, fullname).catch(console.error);
    }
  }, [user]);

  const sendLoginInfoToBackend = async (
    userID: string,
    email: string,
    fullname: string
  ) => {
    console.log("📡 Sending login info to backend:", userID, email, fullname);
    try {
      const response = await ApiService.loginUser({ id: userID, email, fullName: fullname });
      if (response.success) {
        await saveUserSession(userID, email, fullname);
        ToastMessage("success", "Login successful!");
      } else {
        console.error("❌ Backend login failed:", response.message);
      }
    } catch (error) {
      console.error("❌ Error sending login info:", error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const userID = credential.user;
      const fullname = credential.fullName
        ? `${credential.fullName.givenName ?? ""} ${credential.fullName.familyName ?? ""}`.trim()
        : "";
      const email = credential.email ?? "";

      router.navigate("/HomeScreen");
      sendLoginInfoToBackend(userID, email, fullname).catch(console.error);
    } catch (e) {
      ToastMessage("error", "An error occurred. Please try again later");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("clerk-callback"),
      });
      if (!createdSessionId) {
        ToastMessage("info", "Google sign-in was canceled.");
        return;
      }
      console.log("✅ Google SSO flow completed, session ID:", createdSessionId);
      router.navigate("/HomeScreen");
    } catch (err) {
      console.error("❌ Google sign-in error:", err);
      ToastMessage("error", "An error occurred. Please try again later");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const { createdSessionId } = await startSSOFlow({
        strategy: "oauth_facebook",
        redirectUrl: Linking.createURL("clerk-callback"),
      });
      if (!createdSessionId) {
        ToastMessage("info", "Facebook sign-in was canceled.");
        return;
      }
      console.log("✅ Facebook SSO flow completed, session ID:", createdSessionId);
      router.navigate("/HomeScreen");
    } catch (err) {
      console.error("❌ Facebook sign-in error:", err);
      ToastMessage("error", "An error occurred. Please try again later");
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
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.headerSection}>
              <Text style={styles.welcomeTitle}>Welcome to Doclyn</Text>
              <Text style={styles.subtitle}>
                Use your mobile device to scan anything to PDF. Then access the PDFs anytime, anywhere from Doclyn cloud storage.
              </Text>
            </View>
            <View style={styles.signInSection}>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleAppleSignIn}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color="#000" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, { color: '#000' }]}>Sign in with Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={18} color="#000" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, { color: '#000' }]}>Sign in with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signInButton, styles.facebookButton]}
                onPress={handleFacebookSignIn}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={18} color="#FFF" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, styles.facebookButtonText]}>Sign in with Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => router.push("/HomeScreen")}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: '#000' }]}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
      <Toast />
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
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // even darker overlay
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerSection: {
    alignItems: "center",
    marginTop: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 20, // even larger
    color: '#FFF',
    textAlign: "center",
    lineHeight: 28,
    opacity: 0.9,
    paddingHorizontal: 10,
    fontWeight: "300",
  },
  signInSection: {
    marginBottom: 100,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    marginBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF', // default to white
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  facebookButton: {
    backgroundColor: COLORS.brand, // use brand color for Facebook
    borderWidth: 1,
    borderColor: COLORS.brand,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary, // default text color for contrast on white
  },
  facebookButtonText: {
    color: '#FFF', // white text for Facebook button
  },
});
