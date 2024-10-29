import { Text, View, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Prop {
    settingName: string,        // Name
    settingLink: string,        // Page the button should redirect to
    description: string,        // Text below the name
    svg_icon: React.ReactElement<React.FC<{width: number, height: number}>>       // Pass the SVG as a imported component
}

const SettingBar:React.FC<Prop> = ({settingName, svg_icon, settingLink, description}) => {
    // Use Expo Router to assist with navigation
    const router = useRouter();

    const handleSettingPress = () => {
        // Upon pressing the button, it should redirect to an
        // existing page within the same directory
        router.push(`./${settingLink}`);
    }

    return (
        <SafeAreaView>
            {/* This component can be located at the very top where
                the phone UI is at. So wrap in save view.
                
                Entire component will be pressable including the images.
            */}

            <Pressable onPress={handleSettingPress} className="max-w-xs items-left flex-row my-0">
                {/* The setup for the settings will be the following
                    Icon       Name
                            Description
                */}
                {svg_icon}

                {/* Allow for the text to lay below eachother. Wrapped in view.*/}
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
