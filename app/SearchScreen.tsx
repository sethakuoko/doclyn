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
import { COLORS } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    setSearched(true);
    const saved = await AsyncStorage.getItem("SAVED_PDFS");
    if (!saved) {
      setResults([]);
      return;
    }
    const pdfs = JSON.parse(saved);
    const filtered = pdfs.filter((pdf: any) =>
      pdf.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    setResults(filtered);
    Keyboard.dismiss();
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleResultPress = (pdf: any) => {
    router.push({ pathname: "/PhotoDetailsScreen", params: { imagePath: pdf.path } });
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
        {/* More options button restored */}
        <TouchableOpacity onPress={() => alert('More options coming soon!')} style={{ marginLeft: 12, padding: 4 }}>
          <Ionicons name="ellipsis-vertical" size={22} color="#666666" />
        </TouchableOpacity>
      </View>
      {/* Results or Empty State */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32 }}>
        {searched && results.length === 0 ? (
          <Text style={styles.emptySubtitle}>No results found.</Text>
        ) : null}
        {results.map((pdf, idx) => (
          <TouchableOpacity
            key={pdf.path + idx}
            onPress={() => handleResultPress(pdf)}
            style={{
              width: '90%',
              backgroundColor: '#f5f5f5',
              borderRadius: 10,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}
          >
            <Text style={{ fontSize: 16, color: '#222', fontWeight: '600' }}>{pdf.name}</Text>
            <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{pdf.date ? new Date(pdf.date).toLocaleDateString() : ''}</Text>
          </TouchableOpacity>
        ))}
        {!searched && results.length === 0 && (
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
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
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
    borderColor: COLORS.brand,
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
    borderColor: COLORS.brand,
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
    borderColor: COLORS.brand,
    borderRadius: 4,
    padding: 4,
  },
  documentLine: {
    height: 2,
    backgroundColor: COLORS.brand,
    marginBottom: 3,
  },
  documentLineShort: {
    height: 2,
    backgroundColor: COLORS.brand,
    width: "60%",
  },
  documentCorner: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: COLORS.brand,
    borderRadius: 2,
  },
  barcodeLine: {
    height: 1,
    backgroundColor: COLORS.brand,
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
    borderColor: COLORS.brand,
    borderRadius: 12,
  },
  magnifyingHandle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 3,
    height: 16,
    backgroundColor: COLORS.brand,
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
    backgroundColor: COLORS.brand,
  },
  plusVertical: {
    position: "absolute",
    width: 2,
    height: 12,
    backgroundColor: COLORS.brand,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default SearchScreen;
