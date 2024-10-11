import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function book() {
    const { book: slug } = useLocalSearchParams();
    console.log(slug);
    return (
        <View className='flex-1 justify-center items-center'>
            <Text>Specific recommended book is {slug}</Text>
        </View>
    )
}