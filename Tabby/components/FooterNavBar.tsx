import { View, Pressable, Text } from "react-native";
import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import SelectedLibrary from "@/assets/navbar-images/selectedLibrary.svg";
import NotSelectedLibrary from "@/assets/navbar-images/notSelectedLibrary.svg";
import SelectedExplore from "@/assets/navbar-images/selectedExplore.svg";
import NotSelectedExplore from "@/assets/navbar-images/notSelectedExplore.svg";
import SelectedFavorite from "@/assets/navbar-images/selectedFavorite.svg";
import NotSelectedFavorite from "@/assets/navbar-images/notSelectedFavorite.svg";
import Settings from "@/assets/navbar-images/settings.svg";
import CameraIcon from "@/assets/navbar-images/camera.svg";
import CameraModal from "@/components/camera/CameraModel";

const FooterNavBar = () => {
  // set to true to show camera modal
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const pathname = usePathname();
  const size = 40;

  return (
    <View className="flex-row bg-[#1d232b] w-full py-1 justify-around h-20">
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
            <SelectedExplore height={size} width={size} />
          ) : (
            <NotSelectedExplore height={size} width={size} />
          )}
          <Text className="text-center text-white">Explore</Text>
        </Pressable>
      </Link>

      {/* Camera Button to show camera modal */}
      <Pressable onPress={() => setCameraModalVisible(true)} className="flex-col mx-auto">
        <View className="w-16 h-16 bg-white rounded-full items-center justify-center">
          <CameraIcon height={size} width={size} />
        </View>
      </Pressable>

      <Link href="/favorites" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/favorites") ? (
            <SelectedFavorite height={size} width={size} />
          ) : (
            <NotSelectedFavorite height={size} width={size} />
          )}
          <Text className="text-center text-white">Liked</Text>
        </Pressable>
      </Link>

      <Link href="/setting" asChild>
        <Pressable className="flex-col mx-auto">
          <Settings height={size} width={size} />
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
