import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { COLORS } from "./types";

const GalleryScreen = () => {
  const { albumId, title } = useLocalSearchParams();
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const router = useRouter();

  const getPhotos = async () => {
    try {
      const { status: mediaLibStatus } =
        await MediaLibrary.requestPermissionsAsync();
      const { status: pickerStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (mediaLibStatus !== "granted" || pickerStatus !== "granted") {
        alert("Permission to access the media library is required.");
        return;
      }

      const options = {
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [["creationTime", false] as [MediaLibrary.SortByKey, boolean]],
        first: 100,
      };

      const media = albumId
        ? await MediaLibrary.getAssetsAsync({
            ...options,
            album: albumId as string,
          } as any)
        : await MediaLibrary.getAssetsAsync(options);

      setPhotos(media.assets);
    } catch (error) {
      console.error("Error accessing media library:", error);
      alert("Failed to access media library. Please check app permissions.");
    }
  };

  useEffect(() => {
    getPhotos();
  }, []);

  const openAlbums = () => {
    router.push("/AlbumScreen");
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
      router.replace({
        pathname: "/EditPhotoScreen",
        params: { uri, from: "gallery" },
      });
    }
  };

  const RenderMediaItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const [uri, setUri] = useState<string | null>(null);

    useEffect(() => {
      let active = true;

      if (Platform.OS === "android") {
        setUri(item.uri);
        return;
      }

      (async () => {
        const info = await MediaLibrary.getAssetInfoAsync(item.id);
        if (info?.localUri && active) {
          setUri(info.localUri);
        }
      })();

      return () => {
        active = false;
      };
    }, []);

    if (!uri) return null;

    return (
      <TouchableOpacity
        onPress={() => {
          console.log("Selected photo: ", uri);
          router.replace({
            pathname: "/EditPhotoScreen",
            params: { uri, from: "gallery" },
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View
        style={{ flex: 1, backgroundColor: COLORS.background, padding: 10 }}
      >
        <Text style={{ color: COLORS.brand, fontSize: 20, marginBottom: 10 }}>
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
              backgroundColor: COLORS.backgroundSecondary,
              borderRadius: 10,
              marginRight: 5,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: COLORS.brand, textAlign: "center" }}>
              Open Albums...
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openSystemImagePicker}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: COLORS.backgroundSecondary,
              borderRadius: 10,
              marginLeft: 5,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ color: COLORS.brand, textAlign: "center" }}>
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
    backgroundColor: COLORS.background,
  },
};

export default GalleryScreen;
