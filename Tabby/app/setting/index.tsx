import { View } from "react-native";
import SettingBar from "@/components/SettingBar";
import EyeIcon from "@/assets/icons/EyeIcon";
import ShieldIcon from "@/assets/icons/ShieldIcon";

const setting = () => {

    return (
        <View>
            <SettingBar 
                settingName="Appearances"
                settingLink="settingDisplay"
                description="Theme, language, formatting"
                svg_icon={<EyeIcon/>}
            />

            <SettingBar
                settingName="Security"
                settingLink="settingDisplay"
                description="App lock, Secure screen"
                svg_icon={<ShieldIcon/>}
            />
        </View>
    )
}

export default setting;
