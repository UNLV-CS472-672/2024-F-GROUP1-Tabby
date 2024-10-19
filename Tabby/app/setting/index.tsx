import { Settings, View } from "react-native";
import SettingBar from "@/components/SettingBar";
import { Link, LinkProps } from "expo-router";

const setting = () => {

    return (
        <View className="text-[#065f46]">
            <SettingBar 
                pageLink={
                    <Link href="/setting/settingDisplay">
                        Some type of value
                    </Link>
                }
                description="This is the settings description."
                icon="hello"
            />

        </View>
    )
}

export default setting;