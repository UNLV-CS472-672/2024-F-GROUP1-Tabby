import { Text, View, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Prop {
    settingName: string,
    settingLink: string,
    description: string,
    svg_icon: React.ReactElement<React.FC<{}>>       // Pass the SVG as a imported component
}

const SettingBar:React.FC<Prop> = ({settingName, svg_icon, settingLink, description}) => {
    const router = useRouter();

    const handleSettingPress = () => {
        router.push(`./${settingLink}`);
    }

    return (
        <SafeAreaView>
            <Pressable onPress={handleSettingPress} className="max-w-xs items-left flex-row my-0">
                {svg_icon}

                <View>
                    <Text className={`text-textWhite text-left mt-2 mb-1`}>
                        {settingName}
                    </Text>

                    <Text className={`text-textGray`}>
                        {description}
                    </Text>
                </View>
            </Pressable>
        </SafeAreaView>
    )
}

export default SettingBar;
