import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from "expo-router";


const Footer = () => {
    const router = useRouter();

    const navigateToCategories = () => {
        router.push(`(tabs)/categories`);
    };

    const navigateToRecommendations = () => {
        router.push(`(tabs)/recommendations`);
    };
    return (
        <View className="flex-row h-full">
            <TouchableOpacity
                onPress={navigateToCategories}
                className="bg-blue-500 p-4 rounded"
            >
                <Text className="text-white">Go to Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={navigateToRecommendations}
                className="bg-green-500 p-4 rounded"
            >
                <Text className="text-white">Go to Recommendations</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Footer