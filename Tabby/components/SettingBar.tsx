import { Text, Image, ImageSourcePropType, View, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Prop {
    settingName: string,
    icon: ImageSourcePropType,
    settingLink: string,
    description: string,
    svg_icon?: React.FC<void>       // Pass the SVG as a imported component
}

const SettingBar:React.FC<Prop> = ({settingName, icon, settingLink, description}) => {
    const router = useRouter();

    const handleSettingPress = () => {
        router.push(`./${settingLink}`);
    }

    return (
        <SafeAreaView>
            <Pressable onPress={handleSettingPress} className="max-w-xs items-left flex-row my-0">
                <Image
                    source={icon}
                    className="w-10 h-8 mr-4 ml-2 mt-1"
                    resizeMode="cover"
                    alt="Icon"
                />

                <View>
                    <Text className={`text-textWhite text-left`}>
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
