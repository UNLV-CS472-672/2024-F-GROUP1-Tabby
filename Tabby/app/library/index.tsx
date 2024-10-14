import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react'
const Categories = () => {
    const router = useRouter();

    const categories = [
        'Fiction', 'Fantasy', 'Science Fiction', 'Romance', 'Thriller', 'Non-fiction'
    ];

    const [favoritedCategories, setFavoritedCategories] = useState<string[]>([]);

    const handleCategoryPress = (category: string) => {
        router.push(`/library/${category}`);
    };

    const handleFavoritePress = (category: string) => {
        // removes the category from the list of favorited categories if in the array
        if (favoritedCategories.includes(category)) {
            setFavoritedCategories(favoritedCategories.filter(c => c !== category));
            console.log(`this is no longer a Favorite category: ${category}`);
        }
        // othwerwise adds it to the list of favorited categories
        else {
            setFavoritedCategories([...favoritedCategories, category]);
            console.log(`this is a Favorite category: ${category}`);

        }
    }

    const isFavorite = (category: string) => {
        return favoritedCategories.includes(category);
    }



    return (
        <>
            <SafeAreaView className="flex-1">
                {categories.map((category, index) => (
                    <Pressable
                        key={category}
                        onPress={() => handleCategoryPress(category)}
                        className={`flex-row items-center justify-between py-4 px-6 ${index % 2 === 0 ? 'bg-black' : 'bg-gray-300'}`}
                    >
                        <View className='flex-1 items-center'>
                            <Text className={`text-xl font-semibold ${index % 2 === 0 ? 'text-white' : 'text-black'}`}>
                                {category}
                            </Text>

                        </View>


                        <Pressable
                            className="p-1"
                            onPress={() => handleFavoritePress(category)}

                        >
                            <FontAwesome name="heart" size={36} color={isFavorite(category) ? 'red' : 'white'} />
                        </Pressable>
                    </Pressable>
                ))}

            </SafeAreaView>
        </>

    );
};

export default Categories;
