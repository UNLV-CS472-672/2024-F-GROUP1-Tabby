import { View } from "react-native";
import SettingBar from "@/components/SettingBar";

/// ********** SVGs **********
/// All SVGs should be passed here and used like so
/// for the settings Icon. 
import EyeIcon from "@/components/settings/EyeIcon";
import ShieldIcon from "@/components/settings/ShieldIcon";

const setting = () => {

    return (
        <View>
            {/* Each component will create a button complete with
                a working redirect to a specified page.
            */}
            <SettingBar
                settingName="Appearances"
                settingLink="settingDisplay"
                description="Theme, language, formatting"
                svg_icon={<EyeIcon />}
            />

            <SettingBar
                settingName="Security"
                settingLink="settingDisplay"
                description="App lock, Secure screen"
                svg_icon={<ShieldIcon />}
            />
        </View>
    )
}

export default setting;
