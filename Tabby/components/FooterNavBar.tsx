import { View } from "react-native";
import { Link } from "expo-router";
import React from "react";

const FooterNavBar = () => {

    return (
        <View className=" flex-1 flex-row items-end">
            <Link href="/(tabs)/categories" className="p-5 text-white"> Library</Link>
            <Link href="/(tabs)/recommendations" className="p-5 text-white"> Reccomendations</Link>
        </View>
    )
}

export default FooterNavBar