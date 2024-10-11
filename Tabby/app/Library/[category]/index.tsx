import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams } from "expo-router";
import React from 'react'

import { } from 'expo-router';


const index = () => {
    const router = useRouter();
    const { category: slug } = useLocalSearchParams();
    console.log(slug);

    const handleBookPress = (title: string) => {
        router.push(`/Library/${slug}/${title}`);
    }
    return (
        <View>
            <Text>Specfic category is {slug}</Text>
            <TouchableOpacity
                onPress={() => handleBookPress('book1')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">book1</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleBookPress('book2')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">book2</Text>
            </TouchableOpacity>

        </View>
    )
}

export default index