import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { useLocalSearchParams } from 'expo-router';

const Book = () => {
    // Extract both category and book slugs
    const { category, book } = useLocalSearchParams();
    console.log('Category:', category);
    console.log('Book:', book);
    return (
        <SafeAreaView className='flex-1 justify-center items-center'>
            <Text className='text-white'>This book is {book} from {category}</Text>
        </SafeAreaView>
    )
}

export default Book