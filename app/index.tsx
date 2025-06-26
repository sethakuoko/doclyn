// App.tsx
import { ToastMessage } from "@/components/Toast";
import { useSSO, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons"; // Adjust the path as necessary
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

export default function App() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const userID = user.id;
      const email = user.primaryEmailAddress?.emailAddress ?? "";
      const fullname = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

      // Send to backend, store in global state, or show in UI
      console.log("User logged in:", { userID, email, fullname });

      // Example call
      sendLoginInfoToBackend(userID, email, fullname);
    }
  }, [isSignedIn, user]);

  const sendLoginInfoToBackend = async (
    userID: string,
    email: string,
    fullname: string
  ) => {
    console.log("sending login info", userID, email, fullname);

    let msg = "success";
    if (msg === "success") {
      router.navigate("/HomeScreen");
    } else {
      ToastMessage("error", "An error occured. Please try again later");
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
        ? `${credential.fullName.givenName ?? ""} ${
            credential.fullName.familyName ?? ""
          }`.trim()
        : "";
      const email = credential.email ?? "";

      sendLoginInfoToBackend(userID, email, fullname);

      // Pass data to backend for logging and returning values.
    } catch (e) {
      ToastMessage("error", "An error occured. Please try again later");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("clerk-callback"),
      });

      if (!createdSessionId) {
        // User canceled the Google sign-in
        ToastMessage("info", "Google sign-in was canceled.");
        return;
      }

      if (createdSessionId && typeof setActive === "function") {
        await setActive({ session: createdSessionId });
        console.log("✅ Signed in with Google");
      }
    } catch (err) {
      ToastMessage("error", "An error occured. Please try again later");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_facebook", // Facebook-specific strategy
        redirectUrl: Linking.createURL("clerk-callback"),
      });

      if (!createdSessionId) {
        // User canceled the Google sign-in
        ToastMessage("info", "Facebook sign-in was canceled.");
        return;
      }

      if (createdSessionId && typeof setActive === "function") {
        await setActive({ session: createdSessionId });
        console.log("✅ Signed in with Facebook");
      }
    } catch (err) {
      ToastMessage("error", "An error occured. Please try again later");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("../assets/images/IndexBackground.jpg")}
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.8)"]}
          style={styles.overlay}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.welcomeTitle}>Welcome to Doclyn</Text>
              <Text style={styles.subtitle}>
                Use your mobile device to scan anything to PDF. Then access the
                PDFs anytime, anywhere from Doclyn cloud storage.
              </Text>
            </View>

            {/* Sign In Buttons Section */}
            <View style={styles.signInSection}>
              {/* Apple Sign In */}
              <TouchableOpacity
                style={[styles.signInButton, styles.appleButton]}
                onPress={handleAppleSignIn}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="logo-apple"
                  size={20}
                  color="#000"
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.appleButtonText]}>
                  Sign in with Apple
                </Text>
              </TouchableOpacity>

              {/* Google Sign In */}
              <TouchableOpacity
                style={[styles.signInButton, styles.googleButton]}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="logo-google"
                  size={18}
                  color="#4285F4"
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.googleButtonText]}>
                  Sign in with Google
                </Text>
              </TouchableOpacity>

              {/* Facebook Sign In */}
              <TouchableOpacity
                style={[styles.signInButton, styles.facebookButton]}
                onPress={handleFacebookSignIn}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="logo-facebook"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.facebookButtonText]}>
                  Sign in with Facebook
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signInButton, styles.facebookButton]}
                onPress={() => router.push("/HomeScreen")}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, styles.facebookButtonText]}>
                  Continue
                </Text>
              </TouchableOpacity>
              {/* Existing Account Link */}
            </View>

            {/* Footer Section */}
          </View>
        </LinearGradient>
      </ImageBackground>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "300",
    color: "#008080",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    lineHeight: 24,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appleButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  googleButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  facebookButton: {
    backgroundColor: "#008080",
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  appleButtonText: {
    color: "#333333",
  },
  googleButtonText: {
    color: "#333333",
  },
  facebookButtonText: {
    color: "#ffffff",
  },
});
