import { Text, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Prop {
    icon: ImageSourcePropType,
    pageLink: React.ReactElement<typeof Link>,
    description: string
}

const SettingBar:React.FC<Prop> = ({icon, pageLink, description}) => {

    return (
        <SafeAreaView className="items-left flex-row">
            <Image 
                source={icon}
                className="w-10 h-8 mr-4 ml-2"
                resizeMode="cover"
                alt="Icon"
            />

            <Text className="text-white text-left">
                {pageLink}
            </Text>

            <Text className="text-gray-400">
                {description}
            </Text>

        </SafeAreaView>
    )
}

export default SettingBar;