import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Categories = () => {
    const router = useRouter();

    const categories = [
        'Fiction', 'Fantasy', 'Science Fiction', 'Romance', 'Thriller', 'Non-fiction'
    ];

    const handleCategoryPress = (category: string) => {
        router.push(`/Library/${category}`);
    };

    return (
        <View className="">
            {categories.map((category, index) => (
                <TouchableOpacity
                    key={category}
                    onPress={() => handleCategoryPress(category)}
                    className={`flex-row items-center justify-between py-4 px-6 ${index % 2 === 0 ? 'bg-black' : 'bg-gray-300'}`}
                >
                    <Text className={`text-xl font-rmono font-semibold ${index % 2 === 0 ? 'text-white' : 'text-black'}`}>
                        {category}
                    </Text>

                    <TouchableOpacity>
                        <FontAwesome name="heart" size={24} color="red" />
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default Categories;
