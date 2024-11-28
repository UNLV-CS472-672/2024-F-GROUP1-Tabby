import { View, Pressable, Text } from "react-native";
import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import SelectedLibrary from "@/components/navbar/selectedLibrary";
import NotSelectedLibrary from "@/components/navbar/notSelectedLibrary";
import SelectedExplore from "@/components/navbar/selectedExplore";
import NotSelectedExplore from "@/components/navbar/notSelectedExplore";
import SelectedFavorite from "@/components/navbar/selectedFavorite";
import NotSelectedFavorite from "@/components/navbar/notSelectedFavorite";
import Settings from "@/components/navbar/settings";
import CameraIcon from "@/components/navbar/camera";
import CameraModal from "@/components/camera/CameraModel";

const FooterNavBar = () => {
  // set to true to show camera modal
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const pathname = usePathname();
  const size = 40;

  return (
    <View className="flex-row bg-[#1d232b] w-full py-1 justify-around">
      <Link href="/library" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/library") ? (
            <SelectedLibrary height={size} width={size} />
          ) : (
            <NotSelectedLibrary height={size} width={size} />
          )}
          <Text className="text-center text-white">Library</Text>
        </Pressable>
      </Link>

      <Link href="/recommendations" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/recommendations") ? (
            <SelectedExplore />
          ) : (
            <NotSelectedExplore />
          )}
          <Text className="text-center text-white">Explore</Text>
        </Pressable>
      </Link>

      {/* Camera Button to show camera modal */}
      <Pressable testID="CameraButton" onPress={() => setCameraModalVisible(true)} className="flex-col mx-auto">
        <View className="w-16 h-16 items-center justify-center">
          <CameraIcon />
        </View>
      </Pressable>

      <Link href="/favorites" asChild>
        <Pressable testID="favoritesButton" className="flex-col mx-auto">
          {pathname.includes("/favorites") ? (
            <SelectedFavorite />
          ) : (
            <NotSelectedFavorite />
          )}
          <Text className="text-center text-white">Liked</Text>
        </Pressable>
      </Link>

      <Link href="/setting" asChild>
        <Pressable className="flex-col mx-auto">
          <Settings />
          <Text className="text-center text-white">Settings</Text>
        </Pressable>
      </Link>

      {/* Camera Modal */}
      {isCameraModalVisible && (
        <CameraModal closeModal={() => setCameraModalVisible(false)} />
      )}
    </View>
  );
};

export default FooterNavBar;
