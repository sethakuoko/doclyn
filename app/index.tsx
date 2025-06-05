// App.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // Adjust the path as necessary
import { StyleSheet, Dimensions } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { ToastMessage } from "@/components/Toast";
import Toast from "react-native-toast-message";
import { Stack, useRouter } from "expo-router";

export default function App() {
  let userID: string;
  let email: string;
  let fullname: string;
  const router = useRouter();

  const sendLoginInfoToBackend = async () => {
    console.log("sending login info", userID, email, fullname);

    let msg = "success";
    if ((msg = "success")) {
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

      userID = credential.user;
      fullname = credential.fullName
        ? `${credential.fullName.givenName ?? ""} ${
            credential.fullName.familyName ?? ""
          }`.trim()
        : "";
      email = credential.email ?? "";

      sendLoginInfoToBackend();

      // Pass data to backend for logging and returning values.
    } catch (e) {
      ToastMessage("error", "An error occured. Please try again later");
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Sign in with Google pressed");
  };

  const handleFacebookSignIn = () => {
    console.log("Sign in with Facebook pressed");
  };

  const handleExistingAccount = () => {
    console.log("Sign in or sign up pressed");
  };

  const handleLearnMore = () => {
    console.log("Learn more pressed");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        }}
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"]}
          style={styles.overlay}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.welcomeTitle}>Welcome to Adobe Scan</Text>
              <Text style={styles.subtitle}>
                Use your mobile device to scan anything to PDF. Then access the
                PDFs anytime, anywhere from Adobe cloud storage.
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

              {/* Existing Account Link */}
              <TouchableOpacity
                style={styles.existingAccountContainer}
                onPress={() => router.navigate("/ManualSignInScreen")}
                activeOpacity={0.7}
              >
                <Text style={styles.existingAccountText}>
                  Already have an Adobe account?
                </Text>
                <Text style={styles.signInLink}>Sign in or sign up.</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Section */}
            <View style={styles.footerSection}>
              <Text style={styles.privacyText}>
                Adobe collects analytics to improve your experience.{" "}
                <Text style={styles.learnMoreLink} onPress={handleLearnMore}>
                  Learn more
                </Text>
              </Text>
            </View>
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
    backgroundColor: "#000",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
    paddingHorizontal: 10,
    fontWeight: "300",
  },
  signInSection: {
    marginBottom: 40,
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appleButton: {
    backgroundColor: "#fff",
  },
  googleButton: {
    backgroundColor: "#fff",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  appleButtonText: {
    color: "#000",
  },
  googleButtonText: {
    color: "#000",
  },
  facebookButtonText: {
    color: "#fff",
  },
  existingAccountContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  existingAccountText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  signInLink: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "underline",
    opacity: 0.9,
  },
  footerSection: {
    alignItems: "center",
    paddingBottom: 20,
  },
  privacyText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 16,
  },
  learnMoreLink: {
    textDecorationLine: "underline",
    opacity: 0.9,
  },
});
