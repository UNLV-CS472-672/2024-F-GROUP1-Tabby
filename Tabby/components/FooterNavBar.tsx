import { View, Pressable, Text } from "react-native";
import { Link, usePathname } from "expo-router";
import React from "react";
import CameraButton from "@/components/CameraButton";
import SelectedLibrary from "@/assets/navbar-images/selectedLibrary.svg";
import NotSelectedLibrary from "@/assets/navbar-images/notSelectedLibrary.svg";
import SelectedExplore from "@/assets/navbar-images/selectedExplore.svg";
import NotSelectedExplore from "@/assets/navbar-images/notSelectedExplore.svg";
import SelectedFavorite from "@/assets/navbar-images/selectedFavorite.svg";
import NotSelectedFavorite from "@/assets/navbar-images/notSelectedFavorite.svg";
import Settings from "@/assets/navbar-images/settings.svg";

const FooterNavBar = () => {
  // getting the current page to see the path and using that to make the icons change to selected if that path invloves the page that icon is related to 
  const pathname = usePathname();
  const size = 40;
  return (

    <View className="flex-row bg-[#1d232b] w-full py-1 justify-around">
      <Link href="/library" className="" asChild>
        <Pressable className="flex-col mx-auto">

          {pathname.includes("/library") ? <SelectedLibrary height={size} width={size} /> : <NotSelectedLibrary height={size} width={size} />}

          <Text className="text-center text-white">Library</Text>
        </Pressable>
      </Link>

      <Link href="/recommendations" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/recommendations") ? <SelectedExplore height={size} width={size} /> : <NotSelectedExplore height={size} width={size} />}

          <Text className="text-center text-white">Explore</Text>
        </Pressable>
      </Link>

      <View className="w-16 h-16">
          <CameraButton/>
        </View>

      <Link href="/favorites" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/favorites") ? <SelectedFavorite height={size} width={size} /> : <NotSelectedFavorite height={size} width={size} />}

          <Text className="text-center text-white">Liked</Text>
        </Pressable>
      </Link>

      <Link href="/setting" asChild>
        <Pressable className="flex-col mx-auto">

          <Settings height={size} width={size} />
          <Text className="text-center text-white">Settings</Text>
        </Pressable>
      </Link>
    </View>

  );
};

export default FooterNavBar;