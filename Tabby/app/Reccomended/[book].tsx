import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export default function book() {
    const { book: slug } = useLocalSearchParams();
    console.log(slug);
    return (
        <SafeAreaView className='flex-1 justify-center items-center'>
            <Text className='text-white'>Specific recommended book is {slug}</Text>
        </SafeAreaView>
    )
}