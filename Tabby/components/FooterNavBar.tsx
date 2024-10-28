import { View, Pressable, Text } from "react-native";
import { Link, usePathname} from "expo-router";
import { Image } from "expo-image"
import React from "react";
import CameraButton from "@/components/CameraButton";

const FooterNavBar = () => {
  const pathname = usePathname();
  return (
    <View className="flex-row items-end flex-1 bg-[#1E1E1E]">
      <View className="flex-row justify-between bg-[#1d232b] w-screen">
        <Link href="/library" asChild>
          <Pressable className="flex-col px-3">
            <Image
            className="flex-1"
            source={
              pathname === "/library"
                ? require("@/assets/navbar-images/selectedLibrary.svg")
                : require("@/assets/navbar-images/notSelectedLibrary.svg")
            }
            />
            <Text className="text-white">Library</Text>
          </Pressable>
        </Link>
        <Link href="/recommendations" asChild>
          <Pressable className="flex-col px-3">
            <Image 
            className="flex-1"
            source={
              pathname === "/recommendations"
                ? require("@/assets/navbar-images/selectedFavorite.svg")
                : require("@/assets/navbar-images/notSelectedFavorite.svg")
            }
            />
            <Text className="text-white">Favorites</Text>
          </Pressable>
        </Link>
        <View className="w-16 h-16">
          <CameraButton/>
        </View>
        <Link href="/setting" asChild>
          <Pressable className="flex-col px-3">
            <Image className="flex-1" source={require("@/assets/navbar-images/settings.svg")}/>
            <Text className="text-white">Settings</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

export default FooterNavBar;
