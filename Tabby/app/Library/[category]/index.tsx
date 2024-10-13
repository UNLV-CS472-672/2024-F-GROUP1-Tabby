import { View, Text, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'


const index = () => {
    const router = useRouter();
    const { category: slug } = useLocalSearchParams();
    console.log(slug);

    const handleBookPress = (title: string) => {
        router.push(`/Library/${slug}/${title}`);
    }
    return (
        <SafeAreaView className='flex-1 pt-20'>
            <Text className='text-white text-xl pb-2'>Specfic category is {slug}</Text>
            <Pressable
                onPress={() => handleBookPress('book1')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">book1</Text>
            </Pressable>

            <Pressable
                onPress={() => handleBookPress('book2')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">book2</Text>
            </Pressable>

        </SafeAreaView>
    )
}

export default index