import { View } from "react-native";
import SettingBar from "@/components/SettingBar";
import { Svg, Path } from 'react-native-svg';

const setting = () => {

    return (
        <View>
            <SettingBar 
                settingName="Appearances"
                settingLink="settingDisplay"
                description="Theme, language, formatting"
                icon={require("@/assets/icons/eye.png")}
            />

            <SettingBar
                settingName="Security"
                settingLink="settingDisplay"
                description="App lock, Secure screen"
                icon={require("@/assets/icons/shield.png")}
            />
        </View>
    )
}

export default setting;
