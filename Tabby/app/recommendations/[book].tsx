import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

const Book = () => {
    // getting slug from useLocalSearchParams which is [book]
    const { book } = useLocalSearchParams();
    if (book == null) {
        throw new Error('slug is null');
    }
    console.log(book);
    return (
        <SafeAreaView className='flex-1 justify-center items-center'>
            <Text className='text-white'>This recommended book is {book}</Text>
        </SafeAreaView>
    )
}

export default Book;