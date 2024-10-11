import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from 'react-native';

const Categories = () => {
    const router = useRouter();

    const handleRecommendationPress = (reccommendation: string) => {
        router.push(`/Reccomendations/${reccommendation}`);
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => handleRecommendationPress('book1')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white font-Roboto-Mono text-lg font-semibold">Book 1</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleRecommendationPress('book2')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">Book 2</Text>
            </TouchableOpacity>

        </View>
    );
};

export default Categories;
