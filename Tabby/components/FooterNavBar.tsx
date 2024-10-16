import { View, Image } from "react-native";
import { Link } from "expo-router";
import React from "react";

const FooterNavBar = () => {
  return (
    <View className="bottom-0 flex-row h-16 space-x-8 bg-zinc-700">
      <Link href="/Library" className="text-white ">
        {" "}
        <Image
          className="self-center w-10 h-10"
          source={require("@/assets/navbar-images/notSelectedLibrary.png")}
        />
      </Link>
      <Link href="/recommendations" className="text-white">
        {" "}
        <Image
          className="self-center w-10 h-10"
          source={require("@/assets/navbar-images/notSelectedFavorite.png")}
        />
      </Link>
      <Image
        className="w-16 h-16"
        source={require("@/assets/navbar-images/camera.png")}
      />
      <Image
        className="absolute right-0 self-center w-10 h-10"
        source={require("@/assets/navbar-images/settings.png")}
      />
    </View>
  );
};

export default FooterNavBar;
