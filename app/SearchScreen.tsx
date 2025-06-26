import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333333" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus={true}
          />

          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#666666" />
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
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#333333",
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
    borderColor: "#008080",
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
    borderColor: "#008080",
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
    borderColor: "#008080",
    borderRadius: 4,
    padding: 4,
  },
  documentLine: {
    height: 2,
    backgroundColor: "#008080",
    marginBottom: 3,
  },
  documentLineShort: {
    height: 2,
    backgroundColor: "#008080",
    width: "60%",
  },
  documentCorner: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: "#008080",
    borderRadius: 2,
  },
  barcodeLine: {
    height: 1,
    backgroundColor: "#008080",
    marginBottom: 2,
  },
  magnifyingGlass: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
  },
  magnifyingCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: "#008080",
    borderRadius: 12,
  },
  magnifyingHandle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 3,
    height: 16,
    backgroundColor: "#008080",
    transform: [{ rotate: "45deg" }],
  },
  plusContainer: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  plusHorizontal: {
    position: "absolute",
    width: 12,
    height: 2,
    backgroundColor: "#008080",
  },
  plusVertical: {
    position: "absolute",
    width: 2,
    height: 12,
    backgroundColor: "#008080",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default SearchScreen;
