import { View, Text, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'


const Category = () => {
    const router = useRouter();
    // slug which is [category]
    const { category } = useLocalSearchParams();
    console.log(category);

    const handleBookPress = (title: string) => {
        router.push(`/library/${category}/${title}`);
    }
    return (
        <SafeAreaView className='flex-1 pt-20'>
            <Text className='text-white text-xl pb-2'>Specfic category is {category}</Text>
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

            <Pressable
                onPress={() => handleBookPress('book-1234789ck')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">book-ck</Text>
            </Pressable>


        </SafeAreaView>
    )
}

export default Category;