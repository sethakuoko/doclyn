import { ClerkProvider } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
};

export default function RootLayout() {
  const clerkKey = Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY;

  if (!clerkKey) {
    console.error(
      "CLERK_PUBLISHABLE_KEY is not defined in app.json or app.config.js"
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey} tokenCache={tokenCache}>
      <Stack />
    </ClerkProvider>
  );
}
