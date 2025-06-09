// app/AlbumScreen.tsx
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    StatusBar,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { Stack, useRouter } from "expo-router";
// Move openSystemImagePicker inside the component to access router
const [albums, setAlbums] = useState<
  { album: MediaLibrary.Album; coverUri: string }[]
>([]);

type AlbumWithCover = {
  album: MediaLibrary.Album;
  coverUri: string;
  photoCount: number; // Add this to store number of image files
};

const AlbumScreen = () => {
  const [albums, setAlbums] = useState<AlbumWithCover[]>([]);
  const router = useRouter();

useEffect(() => {
  fetchAlbums();
}, []);

const fetchAlbums = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") return;
  const allAlbums = await MediaLibrary.getAlbumsAsync();
  const imageAlbums: AlbumWithCover[] = [];

for (const album of allAlbums) {
  const assets = await MediaLibrary.getAssetsAsync({
    album,
    mediaType: "photo",
    first: 1,
    sortBy: [["creationTime", false]],
  });

  if (assets.totalCount > 0) {
    imageAlbums.push({
      album,
      coverUri: assets.assets[0].uri,
      photoCount: assets.totalCount, // Store number of image files
    });
  }
}

setAlbums(imageAlbums);

};

  const openAlbumPhotos = (albumId: string, title: string) => {
    router.push({
      pathname: "/GalleryScreen",
      params: { albumId, title }, // Gallery screen will filter by album
    });
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
      router.push({
        pathname: "/EditPhoteScreen",
        params: { uri },
      });
    }
  };
const style = {
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
};
  return (
   <SafeAreaView style={style.container} edges={['top']}>
         <Stack.Screen options={{ headerShown: false }} />
          <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
    <View style={styles.container}>
      <Text style={styles.heading}>Albums</Text>
      
      <FlatList
  data={albums}
  keyExtractor={(item) => item.album.id}
  numColumns={2} //  This creates a 2-column grid
  columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 13 }} // spacing between items in a row
  renderItem={({ item }) => (
    <TouchableOpacity
      onPress={() => openAlbumPhotos(item.album.id, item.album.title)}
      style={styles.albumItem}
    >
      <Image
        source={{ uri: item.coverUri }}
        style={styles.albumCover}
        resizeMode="cover"
      />
      <Text style={styles.albumText} numberOfLines={2} ellipsizeMode="tail">
  {item.album.title} ({item.photoCount})
</Text>


    </TouchableOpacity>
  )}
  contentContainerStyle={{ paddingBottom: 20 }}
/>
     
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a", padding: 20 },
  heading: { color: "#fff", fontSize: 20, marginBottom: 10, height: 30},
  albumItem: {
  width: "48%", // Roughly half, with spacing
  height: 195,
  borderRadius: 8,
  overflow: "hidden",
  backgroundColor: "#1a1a1a",
},

albumCover: {
  width: "100%",
  height: 150,
  borderRadius: 8,
},

albumText: {
  color: "#fff",
  fontSize: 13,
  paddingVertical: 2,
  paddingHorizontal: 5,
  lineHeight: 20,
 
},
});

export default AlbumScreen;