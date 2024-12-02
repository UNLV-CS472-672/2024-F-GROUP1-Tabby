import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { Image } from "react-native";



const Settings = () => {

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 justify-center items-center">
                <Text className="text-2xl font-bold text-white">Settings Coming Soon ...</Text>
                <Image source={require("@/assets/icons/app/icon.png")} className="w-64 h-64" testID="settings-image"
                />
            </View>
        </SafeAreaView>

    )
}

export default Settings;
