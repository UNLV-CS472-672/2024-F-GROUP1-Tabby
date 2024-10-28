import { View, Pressable, Text } from "react-native";
import { Link, usePathname } from "expo-router";
import { Image } from "expo-image"
import React from "react";
import SelectedLibrary from "@/assets/navbar-images/selectedLibrary.svg";
import NotSelectedLibrary from "@/assets/navbar-images/notSelectedLibrary.svg";
import SelectedExplore from "@/assets/navbar-images/selectedExplore.svg";
import NotSelectedExplore from "@/assets/navbar-images/notSelectedExplore.svg";
import Camera from "@/assets/navbar-images/camera.svg";
import SelectedFavorite from "@/assets/navbar-images/selectedFavorite.svg";
import NotSelectedFavorite from "@/assets/navbar-images/notSelectedFavorite.svg";
import Settings from "@/assets/navbar-images/settings.svg";

const FooterNavBar = () => {
  const pathname = usePathname();
  const size = 40;
  return (



    <View className="flex-row bg-[#1d232b] w-full py-1 justify-around">
      <Link href="/library" className="" asChild>
        <Pressable className="flex-col mx-auto">

          {pathname.includes("/library") ? <SelectedLibrary height={size} width={size} /> : <NotSelectedLibrary height={size} width={size} />}

          <Text className="text-white text-center">Library</Text>
        </Pressable>
      </Link>

      <Link href="/recommendations" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/recommendations") ? <SelectedExplore height={size} width={size} /> : <NotSelectedExplore height={size} width={size} />}

          <Text className="text-white text-center">Explore</Text>
        </Pressable>
      </Link>

      <Link href="/camera" asChild>
        <Pressable className="flex-col mx-auto">
          <View className="w-16 h-16 bg-white rounded-full items-center justify-center">
            <Camera height={size} width={size} />
          </View>
        </Pressable>
      </Link>

      <Link href="/favorites" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/favorites") ? <SelectedFavorite height={size} width={size} /> : <NotSelectedFavorite height={size} width={size} />}

          <Text className="text-white text-center">Liked</Text>
        </Pressable>
      </Link>

      <Link href="/setting" asChild>
        <Pressable className="flex-col mx-auto">

          <Settings height={size} width={size} />
          <Text className="text-white text-center">Settings</Text>
        </Pressable>
      </Link>
    </View>

  );
};

export default FooterNavBar;
