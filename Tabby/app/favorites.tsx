import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const Favorites = () => {

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">
            <View className=' my-5'>
                <Text className="text-4xl font-bold mb-4 text-white">Favorite Categories</Text>
                <Text className="text-lg text-center mb-8 text-white">
                    Categories ....
                </Text>

            </View>

            <View className=' my-5'>
                <Text className="text-4xl font-bold mb-4 text-white">Favorite Books</Text>
                <Text className="text-lg text-center mb-8 text-white">
                    Books ....
                </Text>

            </View>


        </SafeAreaView>
    );
};

export default Favorites;
