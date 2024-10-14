import { useRouter } from "expo-router";
import { Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Recommendations = () => {
    const router = useRouter();

    const handleRecommendationPress = (reccommendation: string) => {
        router.push(`/recommendations/${reccommendation}`);
    };

    return (
        <SafeAreaView className='flex-1 pt-20'>
            <Text className="text-xl font-bold mb-4 text-white"> Here are some reccommendations</Text>
            <Pressable
                onPress={() => handleRecommendationPress('Recoommendedbook1')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white font-Roboto-Mono text-lg font-semibold">Book 1</Text>
            </Pressable>

            <Pressable
                onPress={() => handleRecommendationPress('Recoommendedbook2')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">Book 2</Text>
            </Pressable>

        </SafeAreaView>
    );
};

export default Recommendations;
