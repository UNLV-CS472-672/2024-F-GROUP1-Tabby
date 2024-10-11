import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router';

export default function book() {
    const { book: slug } = useLocalSearchParams();
    console.log(slug);
    return (
        <View>
            <Text>Specific book is {slug}</Text>
        </View>
    )
}