import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function book() {
    const { book: slug } = useLocalSearchParams();
    console.log(slug);
    return (
        <View>
            <Text>Specific book is {slug}</Text>
        </View>
    )
}