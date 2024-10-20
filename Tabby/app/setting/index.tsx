import { View } from "react-native";
import SettingBar from "@/components/SettingBar";
import { Link } from "expo-router";

const setting = () => {

    return (
        <View className="text-[#065f46]">
            <SettingBar 
                pageLink={
                    <Link href="/setting/settingDisplay">
                        Appearance
                    </Link>
                }
                description="This is the settings description."
                icon={require("../../assets/icons/eye.png")}
            />

            <SettingBar
                pageLink={
                    <Link href="/setting/settingDisplay">
                        Security
                    </Link>
                }
                description="This is the settings description."
                icon={require("../../assets/images/react-logo.png")}
            />
        </View>
    )
}

export default setting;