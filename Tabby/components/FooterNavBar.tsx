import { View, Pressable, Text } from "react-native";
import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import SelectedLibrary from "@/assets/navbar-images/selectedLibrary";
import NotSelectedLibrary from "@/assets/navbar-images/notSelectedLibrary";
import SelectedExplore from "@/assets/navbar-images/selectedExplore";
import NotSelectedExplore from "@/assets/navbar-images/notSelectedExplore";
import SelectedFavorite from "@/assets/navbar-images/selectedFavorite";
import NotSelectedFavorite from "@/assets/navbar-images/notSelectedFavorite";
import Settings from "@/assets/navbar-images/settings";
import CameraIcon from "@/assets/navbar-images/camera";
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
      <Pressable onPress={() => setCameraModalVisible(true)} className="flex-col mx-auto">
        <View className="w-16 h-16 items-center justify-center">
          <CameraIcon height={size} width={size} />
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
