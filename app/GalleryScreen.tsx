import React, { useEffect, useState } from "react";

import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { albumId, title } = useLocalSearchParams();

// This screen will display photos from the media library
// and allow users to select a photo for scanning or previewing.
// It will also have a button to open the albums screen.
// Make sure to create the AlbumScreen as well to handle album navigation.
const GalleryScreen = () => {
  const { albumId, title } = useLocalSearchParams();
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const router = useRouter();

  const getPhotos = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required.");
      return;
    }

    const options = {
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [["creationTime", false] as [MediaLibrary.SortByKey, boolean]],
      first: 100,
    };

    let media;
    if (albumId) {
      media = await MediaLibrary.getAssetsAsync({
        ...options,
        album: albumId as string,
      } as any); // 'album' is not in the type, so we cast as any
    } else {
      media = await MediaLibrary.getAssetsAsync(options);
    }
    setPhotos(media.assets);
  };

  useEffect(() => {
    getPhotos();
  }, []);

  const openAlbums = async () => {
    router.push("/AlbumScreen"); // Create this screen too
  };
  const openSystemImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      console.log("System Picker Selected Image URI:", uri);
      router.push({
        pathname: "/EditPhoteScreen",
        params: { uri },
      });
    }
  };
  const RenderMediaItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const [uri, setUri] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
      let active = true;

      if (Platform.OS === "android") {
        setUri(item.uri); // Android URIs are fine
        return;
      }

      (async () => {
        const info = await MediaLibrary.getAssetInfoAsync(item.id);
        if (info?.localUri && active) {
          setUri(info.localUri); // iOS fix
        }
      })();

      return () => {
        active = false;
      };
    }, []);

    if (!uri) return null; // Skip rendering if URI not yet resolved

    return (
      <TouchableOpacity
        onPress={() => {
          console.log("Selected photo: ", uri);
          router.push({
            pathname: "/EditPhoteScreen",
            params: { uri },
          });
        }}
      >
        <Image
          source={{ uri }}
          style={{
            width: 105,
            height: 110,
            margin: 4,
            borderRadius: 10,
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 10 }}>
        <Text style={{ color: "#008080", fontSize: 20, marginBottom: 10 }}>
          {title ? `Album: ${title}` : "Your Photos"}
        </Text>

        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RenderMediaItem item={item} />}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 0,
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={openAlbums}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: "#f8f9fa",
              borderRadius: 10,
              marginRight: 5,
              borderWidth: 1,
              borderColor: "#e0e0e0",
            }}
          >
            <Text style={{ color: "#008080", textAlign: "center" }}>
              Open Albums...
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openSystemImagePicker}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: "#f8f9fa",
              borderRadius: 10,
              marginLeft: 5,
              borderWidth: 1,
              borderColor: "#e0e0e0",
            }}
          >
            <Text style={{ color: "#008080", textAlign: "center" }}>
              Show all photos...
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
};

export default GalleryScreen;
2;
