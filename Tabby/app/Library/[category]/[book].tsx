import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { useLocalSearchParams } from 'expo-router';

export default function book() {
    const { book: slug } = useLocalSearchParams();
    console.log(slug);
    return (
        <SafeAreaView className='flex-1 justify-center items-center'>
            <Text className='text-white'>Specific book is {slug}</Text>
        </SafeAreaView>
    )
}