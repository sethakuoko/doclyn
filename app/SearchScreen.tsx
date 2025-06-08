import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Keyboard,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    console.log("Search initiated with query:", searchQuery);
    // Demo function - will be replaced with actual search functionality
    Keyboard.dismiss();
  };

  const handleBackPress = () => {
    router.back();
    // Navigation logic would go here
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus={true}
          />

          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty State Content */}
      <View style={styles.content}>
        <View style={styles.emptyStateContainer}>
          {/* Search Icon with Documents */}
          <View style={styles.iconContainer}>
            <View style={styles.documentIcon1}>
              {/* Document lines */}
              <View style={styles.documentLine} />
              <View style={styles.documentLine} />
              <View style={styles.documentLine} />
              <View style={styles.documentLineShort} />
            </View>

            <View style={styles.documentIcon2}>
              <View style={styles.documentCorner} />
            </View>

            <View style={styles.documentIcon3}>
              {/* Barcode lines */}
              <View style={styles.barcodeLine} />
              <View style={styles.barcodeLine} />
              <View style={styles.barcodeLine} />
              <View style={styles.barcodeLine} />
            </View>

            {/* Magnifying Glass */}
            <View style={styles.magnifyingGlass}>
              <View style={styles.magnifyingCircle} />
              <View style={styles.magnifyingHandle} />
              {/* Plus icon in center */}
              <View style={styles.plusContainer}>
                <View style={styles.plusHorizontal} />
                <View style={styles.plusVertical} />
              </View>
            </View>
          </View>

          <Text style={styles.emptySubtitle}>
            Enter the name of the file in the search text provided.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 0,
  },
  searchButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateContainer: {
    alignItems: "center",
    maxWidth: 280,
  },
  iconContainer: {
    width: 120,
    height: 120,
    marginBottom: 32,
    position: "relative",
  },
  documentIcon1: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 32,
    height: 40,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 4,
    padding: 6,
  },
  documentIcon2: {
    position: "absolute",
    top: 5,
    right: 15,
    width: 28,
    height: 36,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 4,
  },
  documentIcon3: {
    position: "absolute",
    bottom: 15,
    left: 5,
    width: 30,
    height: 24,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 4,
    padding: 4,
  },
  documentLine: {
    height: 2,
    backgroundColor: "#666",
    marginBottom: 3,
  },
  documentLineShort: {
    height: 2,
    backgroundColor: "#666",
    width: "60%",
  },
  documentCorner: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderTopColor: "#666",
    borderRightColor: "#666",
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },
  barcodeLine: {
    height: 2,
    backgroundColor: "#666",
    marginBottom: 2,
  },
  magnifyingGlass: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
  },
  magnifyingCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#666",
    backgroundColor: "transparent",
  },
  magnifyingHandle: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 3,
    backgroundColor: "#666",
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  plusContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  plusHorizontal: {
    position: "absolute",
    width: 8,
    height: 2,
    backgroundColor: "#007AFF",
    borderRadius: 1,
  },
  plusVertical: {
    position: "absolute",
    width: 2,
    height: 8,
    backgroundColor: "#007AFF",
    borderRadius: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default SearchScreen;
