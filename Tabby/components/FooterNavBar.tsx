import { View, Image, Text } from "react-native";
import { Link, usePathname } from "expo-router";
import React from "react";

const FooterNavBar = () => {
  const pathname = usePathname();
  return (
    <View className="absolute justify-center bottom-0 flex-row items-start h-16 w-screen bg-[#1d232b]">
      <View className="absolute left-0 flex-col">
        <Link href="/Library">
          {" "}
          <Image
            className="w-10 h-10"
            source={
              pathname === "/Library"
                ? require("@/assets/navbar-images/selectedLibrary.png")
                : require("@/assets/navbar-images/notSelectedLibrary.png")
            }
          />
        </Link>
        <Text className="text-white">Library</Text>
      </View>
      <View className="absolute flex-col left-16">
        <Link href="/recommendations">
          {" "}
          <Image
            className="w-10 h-10"
            source={
              pathname === "/recommendations"
                ? require("@/assets/navbar-images/selectedFavorite.png")
                : require("@/assets/navbar-images/notSelectedFavorite.png")
            }
          />
        </Link>
        <Text className="text-white">Favorites</Text>
      </View>
      <View className="w-16 h-16 bg-white rounded-full -top-8">
        <Image
          className="w-16 h-16"
          source={require("@/assets/navbar-images/camera.png")}
        />
      </View>
      <View className="absolute right-0 flex-col px-4">
        <Image
          className="self-start w-10 h-10"
          source={require("@/assets/navbar-images/settings.png")}
        />
        <Text className="bottom-0 text-white">Menu</Text>
      </View>
    </View>
  );
};

export default FooterNavBar;
